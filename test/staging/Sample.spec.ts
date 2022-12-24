import { network, ethers } from "hardhat";
import { developmentChains } from "../../utils/helper-hardhat-config";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Sample Staging Tests", () => {});
