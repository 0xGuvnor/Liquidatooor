// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidatooorV3 is FlashLoanSimpleReceiverBase, Ownable {
    uint256 public constant MAX_UINT = type(uint256).max;

    constructor(
        IPoolAddressesProvider _addressesProvider
    ) FlashLoanSimpleReceiverBase(_addressesProvider) {}

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Received funds, custom logic goes here
        (address collateral, address liquidatee, bool receiveAToken) = abi.decode(
            params,
            (address, address, bool)
        );
        // Infinite approval to let Pool pull the required fees, approval will then be revoked when running the script
        IERC20(asset).approve(address(POOL), MAX_UINT);
        POOL.liquidationCall(collateral, asset, liquidatee, amount, receiveAToken);

        // Swap just enough collateral back to the borrowed asset to repay the loan
        uint256 amountOwed = amount + premium;
        // Call to dex aggregator to swap collatoral here

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
        bytes memory params = abi.encode(_collateral, _liquidatee, _receiveAToken);
        uint16 referralCode = 0;

        POOL.flashLoanSimple(receiverAddress, asset, amount, params, referralCode);
    }

    function getBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function withdrawToken(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    function withdrawETH() external onlyOwner {
        address payable to = payable(owner());
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok);
    }

    receive() external payable {}
}
