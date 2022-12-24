import { DeployFunction } from "hardhat-deploy/types";
import { getNamedAccounts, deployments, network } from "hardhat";

const deployFunction: DeployFunction = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (!chainId) return;

    // If we are on a local development network, we need to deploy mocks!
    if (chainId === 31337) {
        log("Local network detected! Deploying mocks...");

        await deploy("Mock", { from: deployer, log: true });

        log(`Mocks Deployed!`);
    }
};

export default deployFunction;
deployFunction.tags = [`all`, `mocks`];
