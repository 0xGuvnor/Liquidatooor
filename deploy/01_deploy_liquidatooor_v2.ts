import { verify } from "../utils/verify";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../utils/helper-hardhat-config";

const deployFunction: DeployFunction = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (!chainId) return;

    return;

    // // Deploy the contract
    // const args = [networkConfig[chainId].v2PoolProvider];
    // const waitConfirmations = developmentChains.includes(network.name)
    //     ? 1
    //     : VERIFICATION_BLOCK_CONFIRMATIONS;
    // log(`----------------------------------------------------`);
    // const liquidatooor = await deploy("LiquidatooorV2", {
    //     from: deployer,
    //     args,
    //     log: true,
    //     waitConfirmations,
    // });

    // // Verify the deployment
    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     await verify(liquidatooor.address, args);
    // }
};

export default deployFunction;
deployFunction.tags = ["all", "v2"];
