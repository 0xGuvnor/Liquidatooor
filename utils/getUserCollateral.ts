import { Address } from "hardhat-deploy/types";
import { IPoolAddressesProvider } from "../typechain/@aave/core-v3/contracts/interfaces/IPoolAddressesProvider";
import { ethers } from "hardhat";
import { IPoolDataProvider } from "../typechain";

export const getUserCollateral = async (
    poolAddressesProviderAddress: Address,
    user: Address,
    tokenAddress: Address
) => {
    const poolAddressesProvider: IPoolAddressesProvider = await ethers.getContractAt(
        "IPoolAddressesProvider",
        poolAddressesProviderAddress
    );

    const poolDataProviderAddress = await poolAddressesProvider.getPoolDataProvider();
    const poolDataProvider: IPoolDataProvider = await ethers.getContractAt(
        "IPoolDataProvider",
        poolDataProviderAddress
    );

    const userReserveData = await poolDataProvider.getUserReserveData(tokenAddress, user);
    const suppliedTokens = ethers.utils.formatEther(userReserveData.currentATokenBalance);

    return suppliedTokens;
};
