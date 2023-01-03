import { LiquidatooorV2 } from "./../typechain/contracts/aave-v2/LiquidatooorV2.sol/LiquidatooorV2";
import { networkConfig } from "../utils/helper-hardhat-config";
import { ethers, network } from "hardhat";

async function main() {
    const chainId = network.config.chainId!;
    const liquidatooor: LiquidatooorV2 = await ethers.getContract("LiquidatooorV2");
    const borrowToken = networkConfig[chainId].v2Dai!;
    const borrowAmount = ethers.utils.parseEther("10");
    const startingBal = await liquidatooor.getBalance(borrowToken);

    console.log(`Starting token balace: ${ethers.utils.formatEther(startingBal)}\n`);
    console.log("Initiating flash loan...\n");

    await liquidatooor["flashloan(address,uint256)"](borrowToken, borrowAmount);

    console.log("Flashed! ⚡️\n");

    const endingBal = await liquidatooor.getBalance(borrowToken);

    console.log(`Ending token balance: ${ethers.utils.formatEther(endingBal)}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
