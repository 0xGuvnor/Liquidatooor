import { verify } from "../utils/verify";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../utils/helper-hardhat-config";

const deployFunction: DeployFunction = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (!chainId) return;

    let mockAddress;

    // Retrieve mock contracks if needed
    if (chainId === 31337) {
        const mock = await deployments.get("Mock");
        mockAddress = mock.address;
    } else {
    }

    // Deploy the contract
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;
    log(`----------------------------------------------------`);
    const contract = await deploy("Contract", {
        from: deployer,
        args: [mockAddress],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(contract.address, [mockAddress]);
    }
};

export default deployFunction;
deployFunction.tags = [`all`];
