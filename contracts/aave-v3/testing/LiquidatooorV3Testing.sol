// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IDex {
    function wethToDaiRate() external view returns (uint256);

    function sellWeth(uint256 _amount) external;

    function getBalance(address _tokenAddress) external view returns (uint256);
}

contract LiquidatooorV3Testing is FlashLoanSimpleReceiverBase, Ownable {
    // Wallet -> token address -> token balance
    mapping(address => mapping(address => uint256)) public tokenBalances;
    struct TxData {
        address collateral;
        address liquidatee;
        bool receiveAToken;
        address sender;
        uint256 startingCollateralBal;
    }

    IDex public dex = IDex(0x8a3838B7699Ad8Ba372C5D4aEe9ec98ec4e83126);

    constructor(
        IPoolAddressesProvider _addressesProvider
    ) FlashLoanSimpleReceiverBase(_addressesProvider) {}

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address /* initiator */,
        bytes calldata params
    ) external override returns (bool) {
        // Decode variables passed in from requestFlashLoan()
        TxData memory txData = abi.decode(params, (TxData));

        // Approval for twice the amount flash loaned for liquidation call & returning flash loan + fees
        uint256 amountOwed = (amount * 2) + premium;
        IERC20(asset).approve(address(POOL), amountOwed);
        POOL.liquidationCall(
            txData.collateral,
            asset,
            txData.liquidatee,
            amount,
            txData.receiveAToken
        );

        // Swap just enough collateral to the borrowed asset to repay the loan
        // Swapping with mock dex for testing purposes
        IERC20 collateral = IERC20(txData.collateral);
        uint256 amountToSwap = (amount + premium) / dex.wethToDaiRate();
        collateral.approve(address(dex), amountToSwap);
        dex.sellWeth(amountToSwap);

        // Update token balances
        uint256 endingCollateralBal = collateral.balanceOf(address(this));
        tokenBalances[txData.sender][txData.collateral] +=
            endingCollateralBal -
            txData.startingCollateralBal;

        return true;
    }

    function requestFlashLoan(
        address _token,
        uint256 _amount,
        address _collateral,
        address _liquidatee,
        bool _receiveAToken
    ) external {
        address receiverAddress = address(this);
        address asset = _token;
        uint256 amount = _amount;
        bytes memory params = abi.encode(
            // Using structs to avoid stack too deep error in executeOperation()
            TxData({
                collateral: _collateral,
                liquidatee: _liquidatee,
                receiveAToken: _receiveAToken,
                sender: msg.sender,
                startingCollateralBal: IERC20(_collateral).balanceOf(address(this))
            })
        );
        uint16 referralCode = 0;

        POOL.flashLoanSimple(receiverAddress, asset, amount, params, referralCode);
    }

    function getBalance(address _user, address _token) external view returns (uint256) {
        return tokenBalances[_user][_token];
    }

    function withdrawToken(address _token) external {
        uint256 amountToSend = tokenBalances[msg.sender][_token];
        tokenBalances[msg.sender][_token] = 0;
        IERC20(_token).transfer(msg.sender, amountToSend);
    }

    function withdrawETH() external onlyOwner {
        address payable to = payable(owner());
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok);
    }

    receive() external payable {}
}
