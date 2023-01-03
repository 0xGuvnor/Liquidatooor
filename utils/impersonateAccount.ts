import { ethers, network } from "hardhat";
import { Address } from "hardhat-deploy/types";

const impersonateAccount = async (address: Address) => {
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
    });
    return await ethers.getSigner(address);
};

export default impersonateAccount;
