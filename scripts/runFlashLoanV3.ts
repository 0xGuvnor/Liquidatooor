import { getUserDebt } from "../utils/getUserDebt";
import { setTokenApproval } from "./../utils/setTokenApproval";
import { IERC20 } from "./../typechain/@openzeppelin/contracts/token/ERC20/IERC20";
import { IPool } from "./../typechain/@aave/core-v3/contracts/interfaces/IPool";
import { fundContract } from "./../utils/fundContract";
import { developmentChains, networkConfig } from "../utils/helper-hardhat-config";
import { ethers, network } from "hardhat";
import impersonateAccount from "../utils/impersonateAccount";
import { IAaveOracle, LiquidatooorV3Testing, MockAggregator } from "../typechain";
import { getUserCollateral } from "../utils/getUserCollateral";

const liquidatee = "0x65C4999968db9EC4e41b9DBb40691132F407EE95";

async function main() {
    const chainId = network.config.chainId!;
    const Liquidatooor: LiquidatooorV3Testing = await ethers.getContract("LiquidatooorV3");
    const borrowTokenAddress = networkConfig[chainId].v3Dai!;
    // We need to explicitly specify the IERC20 interface as the IERC20 namespace is taken by aave & openzeppelin
    const borrowToken: IERC20 = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        borrowTokenAddress
    );
    const collateralAddress = networkConfig[chainId].v3Weth!;
    const collateral: IERC20 = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        collateralAddress
    );

    // Retreiving account details from Aave's Pool contract
    const poolAddress = await Liquidatooor.POOL();
    const Pool: IPool = await ethers.getContractAt("IPool", poolAddress);
    const healthFactor = Number(
        ethers.utils.formatEther((await Pool.getUserAccountData(liquidatee)).healthFactor)
    );
    // console.log(`Target's current health factor: ${healthFactor}\n`);

    // let borrowAmount: number;

    // const totalDebt = await getUserDebt(
    //     await Liquidatooor.ADDRESSES_PROVIDER(),
    //     liquidatee,
    //     borrowTokenAddress
    // );
    // console.log(totalDebt);

    // /*
    // Able to liquidate the entire debt if health factor is lower than 0.95
    // 50% of total debt otherwise
    // */
    // if (healthFactor < 1 && healthFactor > 0.95) {
    //     borrowAmount = totalDebt * 0.5;
    // } else if (healthFactor < 0.95) {
    //     borrowAmount = totalDebt;
    // }

    // Contract needs some funds to pay the flash loan fee
    // await fundContract(Liquidatooor.address, borrowTokenAddress, "2000");

    // const startingBal = await Liquidatooor.getBalance(borrowTokenAddress);

    // console.log(`Starting token balance: ${ethers.utils.formatEther(startingBal)}\n`);
    // console.log("Initiating flash loan...\n");

    // const tx = await Liquidatooor.requestFlashLoan(
    //     borrowTokenAddress,
    //     borrowAmount,
    //     collateralAddress,
    //     liquidatee,
    //     false
    // );
    // await tx.wait();

    // console.log("Flashed! ⚡️\n");

    // const endingBal = await Liquidatooor.getBalance(borrowTokenAddress);

    // console.log(`Ending token balance: ${ethers.utils.formatEther(endingBal)}\n`);

    // Revoke allowance from Pool contract, as unlimited allowance was given in executeOperation()
    // await setTokenApproval(borrowToken, Liquidatooor.address, Pool.address, "0");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
