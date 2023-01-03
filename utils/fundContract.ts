import { IERC20 } from "../typechain/@openzeppelin/contracts/token/ERC20/IERC20";
import { ethers } from "hardhat";
import { Address } from "hardhat-deploy/types";

export const fundContract = async (recipient: Address, tokenAddress: Address, amount: string) => {
    const token: IERC20 = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        tokenAddress
    );
    const tx = await token.transfer(recipient, ethers.utils.parseEther(amount));
    await tx.wait();
};
