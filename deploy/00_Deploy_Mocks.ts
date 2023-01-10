import { DeployFunction } from "hardhat-deploy/types";
import { network, ethers } from "hardhat";

const deployFunction: DeployFunction = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (!chainId) return;

    // If we are on a local development network, we need to deploy mocks!
    if (chainId === 31337) {
        log("Local network detected! Deploying mocks...");

        await deploy("MockAggregator", {
            from: deployer,
            args: [ethers.utils.parseUnits("230", 8)],
            log: true,
        });

        await deploy("Dex", { from: deployer, log: true });

        await deploy("UniswapV3Liquidity", { from: deployer, log: true });
    }
};

export default deployFunction;
deployFunction.tags = ["all", "mocks", "swap"];
