import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async ({ deployments: { deploy }, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (!chainId) return;

    await deploy("FlashSwap", { from: deployer, log: true });
};

export default deployFunc;
deployFunc.tags = ["swap"];
