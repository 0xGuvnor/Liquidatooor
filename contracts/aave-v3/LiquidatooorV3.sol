// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidatooorV3 is FlashLoanSimpleReceiverBase, Ownable {
    // Router address is the same across chains + testnets, so I'm hardcoding it here
    ISwapRouter public constant router = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    struct TxData {
        address collateral;
        address liquidatee;
        address sender;
    }

    constructor(
        IPoolAddressesProvider _addressesProvider
    ) FlashLoanSimpleReceiverBase(_addressesProvider) {}

    /**
     * @notice Liquidates the liquidatee's Aave position, swaps the collateral received
     *         back to the debt asset to repay the flash loan fees, and transfers any
     *         profit back to the sender.
     * @dev This implementation only works if there is a 0.3% trading fee Uniswap V3 pool
     *      available with sufficient liquidity for the tokens
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address /* initiator */,
        bytes calldata params
    ) external override returns (bool) {
        // Decode variables passed in from requestFlashLoan()
        TxData memory txData = abi.decode(params, (TxData));

        uint256 profit;

        // Scoping to avoid stack too deep error
        {
            // Approval for twice the amount flash loaned + fees for liquidation call & returning flash loan
            IERC20(asset).approve(address(POOL), (amount * 2) + premium);
            uint256 startingBal = IERC20(txData.collateral).balanceOf(address(this));
            POOL.liquidationCall(txData.collateral, asset, txData.liquidatee, amount, false);
            uint256 endingBal = IERC20(txData.collateral).balanceOf(address(this));

            // Swap just enough collateral to the borrowed asset to repay the loan + fees
            uint256 collateralSwapped = _swap(
                txData.collateral,
                asset,
                uint24(3000),
                amount + premium,
                endingBal - startingBal
            );

            profit = endingBal - startingBal - collateralSwapped;
        }

        if (profit == 0) {
            // Transaction reverts if no profit is made (excluding gas costs)
            revert("Bad trade");
        } else {
            // Transfer profit back to the caller
            IERC20(txData.collateral).transfer(txData.sender, profit);
        }

        return true;
    }

    /**
     * @notice Call this function to initiate the flash loan + liquidation process
     * @param _token The address of the asset to liquidate
     * @param _amount The amount of the asset to liquidate
     * @param _collateral The address of the asset to receive for the liquidation process
     * @param _liquidatee The address of the account to liquidate
     */
    function requestFlashLoan(
        address _token,
        uint256 _amount,
        address _collateral,
        address _liquidatee
    ) external {
        address receiverAddress = address(this);
        address asset = _token;
        uint256 amount = _amount;
        bytes memory params = abi.encode(
            // Using structs to avoid stack too deep error in executeOperation()
            TxData({collateral: _collateral, liquidatee: _liquidatee, sender: msg.sender})
        );
        uint16 referralCode = 0;

        POOL.flashLoanSimple(receiverAddress, asset, amount, params, referralCode);
    }

    /**
     * @notice Performs the swap between collateral to borrowed asset on Uniswap V3
     * @dev Ensure that there is a pool with sufficient liquidity between the assets for
     *      a favourable swap rate
     * @param _tokenIn The address of the collateral asset
     * @param _tokenOut The address of the borrowed asset
     * @param _fee The fee rate of the Uniswap V3 pool
     * @param _amountOut The amount to receive in _tokenOut
     * @param _amountInMaximum The maximum amount of _tokenIn can be used to swap for the
     *        exact amount in _amountOut
     * @return _amountIn Amount of _tokenIn used to swap for _tokenOut
     */
    function _swap(
        address _tokenIn,
        address _tokenOut,
        uint24 _fee,
        uint256 _amountOut,
        uint256 _amountInMaximum
    ) private returns (uint256 _amountIn) {
        IERC20(_tokenIn).approve(address(router), _amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            fee: _fee,
            recipient: address(this),
            deadline: block.timestamp,
            amountOut: _amountOut,
            amountInMaximum: _amountInMaximum,
            sqrtPriceLimitX96: 0
        });

        _amountIn = router.exactOutputSingle(params);

        // Reset token approval to 0
        IERC20(_tokenIn).approve(address(router), 0);
    }

    /**
     * @notice Admin function to rescue tokens accidentally sent to contract
     * @param _token The address of the asset to rescue
     */
    function sweepToken(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    /**
     * @notice Admin function to rescue ETH sent to contract
     */ function sweepETH() external onlyOwner {
        address payable to = payable(owner());
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok);
    }

    receive() external payable {}
}
