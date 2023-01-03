import { getUserDebt } from "../utils/getUserDebt";
import { setTokenApproval } from "./../utils/setTokenApproval";
import { IERC20 } from "./../typechain/@openzeppelin/contracts/token/ERC20/IERC20";
import { IPool } from "./../typechain/@aave/core-v3/contracts/interfaces/IPool";
import { fundContract } from "./../utils/fundContract";
import { developmentChains, networkConfig } from "../utils/helper-hardhat-config";
import { ethers, network } from "hardhat";
import { LiquidatooorV3 } from "../typechain/contracts/aave-v3";
import impersonateAccount from "../utils/impersonateAccount";
import { IAaveOracle, MockAggregator } from "../typechain";
import { getUserCollateral } from "../utils/getUserCollateral";

const liquidatee = "0x65C4999968db9EC4e41b9DBb40691132F407EE95";

async function main() {
    const chainId = network.config.chainId!;
    const Liquidatooor: LiquidatooorV3 = await ethers.getContract("LiquidatooorV3");
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

    // If forking, impersonate the Pool Admin account to manipulate the oracle to force liquidation
    if (developmentChains.includes(network.name)) {
        const [user] = await ethers.getSigners();

        // Get tokens from whale accounts as the faucet is fully minted
        const daiWhale = await impersonateAccount("0x93a7c39d7f848a1e9c479c6fe1f8995015ea2fb9");
        const wethWhale = await impersonateAccount("0x93a7c39d7f848a1e9c479c6fe1f8995015ea2fb9");
        await borrowToken
            .connect(daiWhale)
            .transfer(Liquidatooor.address, ethers.utils.parseEther("10000"));
        // await borrowToken
        //     .connect(daiWhale)
        //     .transfer(user.address, ethers.utils.parseEther("10000"));
        await collateral.connect(wethWhale).transfer(user.address, ethers.utils.parseEther("100"));

        // Supply
        await collateral.approve(Pool.address, ethers.utils.parseEther("1"));
        await Pool.supply(collateralAddress, ethers.utils.parseEther("1"), user.address, 0);

        // Borrow
        await borrowToken.approve(Pool.address, ethers.utils.parseEther("1"));
        await Pool.borrow(borrowTokenAddress, ethers.utils.parseEther("200"), 2, 0, user.address);
        console.log(
            "DAI allowance: ",
            ethers.utils.formatEther(await borrowToken.allowance(user.address, Pool.address))
        );

        console.log(
            "Supplied tokens: ",
            await getUserCollateral(
                await Liquidatooor.ADDRESSES_PROVIDER(),
                user.address,
                collateralAddress
            )
        );
        console.log(
            "Borrowed tokens: ",
            await getUserDebt(
                await Liquidatooor.ADDRESSES_PROVIDER(),
                user.address,
                borrowTokenAddress
            )
        );

        // Manipulate oracle price & get health factor
        const poolAdminSigner = await impersonateAccount(
            // Pool Admin address on Polygon Mumbai
            "0x77c45699A715A64A7a7796d5CEe884cf617D5254"
        );
        const AaveOracle: IAaveOracle = await ethers.getContractAt(
            "IAaveOracle",
            networkConfig[chainId!].v3AaveOracle!
        );
        console.log(
            "Old prices: ",
            // Chainlink price feeds return 8 decimal points
            ethers.utils.formatUnits(
                (await AaveOracle.getAssetsPrices([collateralAddress, borrowTokenAddress]))[0],
                8
            ),
            ethers.utils.formatUnits(
                (await AaveOracle.getAssetsPrices([collateralAddress, borrowTokenAddress]))[1],
                8
            )
        );
        console.log(
            "Health factor: ",
            ethers.utils.formatEther((await Pool.getUserAccountData(user.address)).healthFactor)
        );

        // Sets collateral token price feed to mock aggregator where price is set to 1
        await AaveOracle.connect(poolAdminSigner).setAssetSources(
            [collateralAddress],
            ["0x73fa0B114C95Bfe6AC71F356F20883F2E5523033"] // Address of deployed Mock Aggregator
        );

        console.log(
            "New price: ",
            ethers.utils.formatUnits(
                (await AaveOracle.getAssetsPrices([collateralAddress, borrowTokenAddress]))[0],
                8
            ),
            ethers.utils.formatUnits(
                (await AaveOracle.getAssetsPrices([collateralAddress, borrowTokenAddress]))[1],
                8
            )
        );
        console.log(
            "Health factor: ",
            ethers.utils.formatEther((await Pool.getUserAccountData(user.address)).healthFactor)
        );

        // Liquidate
        console.log(
            "Contract Dai balance: ",
            ethers.utils.formatEther(await Liquidatooor.getBalance(borrowTokenAddress))
        );
        const tx = await Liquidatooor.requestFlashLoan(
            borrowTokenAddress,
            ethers.utils.parseEther("210"),
            collateralAddress,
            user.address,
            false
        );
        await tx.wait();

        console.log(
            "Health factor: ",
            ethers.utils.formatEther((await Pool.getUserAccountData(user.address)).healthFactor)
        );
        console.log(
            "Contract Dai balance: ",
            ethers.utils.formatEther(await Liquidatooor.getBalance(borrowTokenAddress))
        );
        console.log(
            "Supplied tokens: ",
            await getUserCollateral(
                await Liquidatooor.ADDRESSES_PROVIDER(),
                Liquidatooor.address,
                collateralAddress
            )
        );
        console.log(
            "Borrowed tokens: ",
            await getUserDebt(
                await Liquidatooor.ADDRESSES_PROVIDER(),
                Liquidatooor.address,
                borrowTokenAddress
            )
        );
        console.log(
            "DAI allowance: ",
            ethers.utils.formatEther(await borrowToken.allowance(user.address, Pool.address))
        );
    }

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
