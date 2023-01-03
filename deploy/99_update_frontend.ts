import { LiquidatooorV3 } from "./../typechain/contracts/aave-v3/LiquidatooorV3";
import { developmentChains } from "./../utils/helper-hardhat-config";
import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

const frontendContractsFile = "../client/constants/networkMapping.json";
const frontendAbiLocation = "../client/constants/";

const updateFrontend = async () => {
    if (process.env.UPDATE_FRONTEND === "true") {
        if (!developmentChains.includes(network.name)) {
            console.log("Updating frontend...");
            await updateContractAddresses();
            await updateContractAbi();
            console.log("Frontend updated!");
        }
    }
};

const updateContractAddresses = async () => {
    const LiquidatooorV3: LiquidatooorV3 = await ethers.getContract("LiquidatooorV3");
    const chainId = network.config.chainId!.toString();
    const contractAddresses = JSON.parse(readFileSync(frontendContractsFile, "utf8"));

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId].LiquidatooorV3.includes(LiquidatooorV3.address)) {
            contractAddresses[chainId].LiquidatooorV3.push(LiquidatooorV3.address);
        }
    } else {
        contractAddresses[chainId] = { LiquidatooorV3: [LiquidatooorV3.address] };
    }

    writeFileSync(frontendContractsFile, JSON.stringify(contractAddresses));
};

const updateContractAbi = async () => {
    const LiquidatooorV3 = await ethers.getContract("LiquidatooorV3");

    writeFileSync(
        `${frontendAbiLocation}LiquidatooorV3.json`,
        LiquidatooorV3.interface.format(ethers.utils.FormatTypes.json)
    );
};

export default updateFrontend;
updateFrontend.tags = ["all", "frontend"];
