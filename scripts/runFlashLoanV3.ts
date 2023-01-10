import { getUserDebt } from "../utils/getUserDebt";
import { IPool } from "./../typechain/@aave/core-v3/contracts/interfaces/IPool";
import { networkConfig } from "../utils/helper-hardhat-config";
import { ethers, network } from "hardhat";
import { LiquidatooorV3Testing } from "../typechain";
import { IERC20 } from "../typechain/contracts/aave-v2/interfaces";

const chainId = network.config.chainId!;

// Change these inputs
const liquidatee = "0x65C4999968db9EC4e41b9DBb40691132F407EE95";
const borrowTokenAddress = networkConfig[chainId].v3Dai!;
const collateralAddress = networkConfig[chainId].v3Weth!;

async function main() {
    const [account] = await ethers.getSigners();
    const liquidatooor: LiquidatooorV3Testing = await ethers.getContract("LiquidatooorV3");

    const collateral: IERC20 = await ethers.getContractAt(
        // We need to explicitly specify the IERC20 interface as the IERC20 namespace is taken by Aave & Openzeppelin
        // "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        "IERC20",
        collateralAddress
    );

    // Retreiving account details from Aave's Pool contract
    const pool: IPool = await ethers.getContractAt("IPool", await liquidatooor.POOL());
    const healthFactor = Number(
        ethers.utils.formatEther((await pool.getUserAccountData(liquidatee)).healthFactor)
    );
    console.log(`Target's current health factor: ${healthFactor}\n`);

    const totalDebt = await getUserDebt(
        await liquidatooor.ADDRESSES_PROVIDER(),
        liquidatee,
        borrowTokenAddress
    );

    /*
     *  Able to liquidate the entire debt if health factor is lower than 0.95
     *  50% of total debt otherwise
     */
    let borrowAmount: number = 0;
    if (healthFactor < 1 && healthFactor > 0.95) {
        borrowAmount = totalDebt * 0.5;
    } else if (healthFactor < 0.95) {
        borrowAmount = totalDebt;
    }

    const startingBal = await collateral.balanceOf(account.address);

    console.log(`Starting token balance: ${ethers.utils.formatEther(startingBal)}\n`);
    console.log("Initiating flash loan...\n");

    const tx = await liquidatooor.requestFlashLoan(
        borrowTokenAddress,
        ethers.utils.parseEther(borrowAmount.toString()),
        collateralAddress,
        liquidatee,
        false
    );
    await tx.wait();

    console.log("Flashed! ⚡️\n");

    const endingBal = await collateral.balanceOf(account.address);

    console.log(`Ending token balance: ${ethers.utils.formatEther(endingBal)}`);
    console.log(`Profit: ${endingBal.sub(startingBal)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
