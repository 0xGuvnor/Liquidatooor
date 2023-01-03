import { ethers } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { IERC20 } from "../typechain/@openzeppelin/contracts/token/ERC20";

export const setTokenApproval = async (
    token: IERC20,
    owner: Address,
    spender: Address,
    approvalAmount: string
) => {
    const tx = await token.approve(spender, ethers.utils.parseEther(approvalAmount));
    await tx.wait();

    const allowance = await token.allowance(owner, spender);
    console.log(
        `Successfully revoked allowance \nAllowance: ${ethers.utils.formatEther(allowance)}\n`
    );
};
