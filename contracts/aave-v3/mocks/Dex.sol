// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

contract Dex {
    // Aave ERC20 Token addresses on Polygon Mumbai
    address private immutable wethAddress = 0xd575d4047f8c667E064a4ad433D04E25187F40BB;
    address private immutable daiAddress = 0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B;

    IERC20 private weth;
    IERC20 private dai;

    // exchange rate indexes
    uint256 public wethToDaiRate = 230;

    constructor() {
        weth = IERC20(wethAddress);
        dai = IERC20(daiAddress);
    }

    function sellWeth(uint256 _amount) external {
        uint256 daiToReceive = _amount * wethToDaiRate;
        weth.transferFrom(msg.sender, address(this), _amount);
        dai.transfer(msg.sender, daiToReceive);
    }

    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    receive() external payable {}
}
