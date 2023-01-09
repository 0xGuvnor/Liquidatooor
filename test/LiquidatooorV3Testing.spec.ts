import { deployments, ethers, network } from "hardhat";
import { developmentChains, networkConfig } from "../utils/helper-hardhat-config";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Dex, IAaveOracle, IPool, LiquidatooorV3Testing, MockAggregator } from "../typechain";
import { Address } from "hardhat-deploy/types";
import { IERC20 } from "../typechain/@openzeppelin/contracts/token/ERC20";
import impersonateAccount from "../utils/impersonateAccount";
import { getUserCollateral } from "../utils/getUserCollateral";
import { getUserDebt } from "../utils/getUserDebt";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Liquidation Lifecycle Test 🧪", () => {
          let chainId: number,
              deployer: SignerWithAddress,
              user: SignerWithAddress,
              other: SignerWithAddress,
              liquidatooor: LiquidatooorV3Testing,
              dex: Dex,
              aaveOracle: IAaveOracle,
              mockAggregator: MockAggregator,
              addressesProviderAddress: Address,
              poolAdminSigner: SignerWithAddress,
              whale: SignerWithAddress,
              borrowTokenAddress: Address,
              borrowToken: IERC20,
              collateralAddress: Address,
              collateral: IERC20,
              poolAddress: Address,
              pool: IPool;

          beforeEach(async () => {
              chainId = network.config.chainId!;
              [deployer, user, other] = await ethers.getSigners();
              await deployments.fixture("all");

              // Init contracts
              liquidatooor = await ethers.getContract("LiquidatooorV3Testing", deployer);
              addressesProviderAddress = await liquidatooor.ADDRESSES_PROVIDER();
              dex = await ethers.getContract("Dex", deployer);
              poolAdminSigner = await impersonateAccount(
                  "0x77c45699A715A64A7a7796d5CEe884cf617D5254"
              );
              aaveOracle = await ethers.getContractAt(
                  "IAaveOracle",
                  networkConfig[chainId].v3AaveOracle!,
                  poolAdminSigner
              );
              mockAggregator = await ethers.getContract("MockAggregator");
              whale = await impersonateAccount("0x93a7c39d7f848a1e9c479c6fe1f8995015ea2fb9"); // Address obtained from Polygonscan Mumbai
              borrowTokenAddress = networkConfig[chainId].v3Dai!;
              borrowToken = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  borrowTokenAddress,
                  whale
              );
              collateralAddress = networkConfig[chainId].v3Weth!;
              collateral = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  collateralAddress,
                  whale
              );
              poolAddress = await liquidatooor.POOL();
              pool = await ethers.getContractAt("IPool", poolAddress, user);

              // Fund user with WETH to borrow against
              await collateral.transfer(user.address, ethers.utils.parseEther("1"));

              // Transfer tokens to mock dex for initial liquidity
              await borrowToken.transfer(dex.address, ethers.utils.parseEther("1000000"));
              await collateral.transfer(dex.address, ethers.utils.parseEther("1000000"));
          });

          it("Entire debt is liquidated when HF is < 0.95 ↯", async () => {
              // Supply collateral
              await collateral.connect(user).approve(pool.address, ethers.utils.parseEther("1"));
              await pool.supply(collateralAddress, ethers.utils.parseEther("1"), user.address, 0);

              // Borrow debt
              await pool.borrow(
                  borrowTokenAddress,
                  ethers.utils.parseEther("200"),
                  2,
                  0,
                  user.address
              );

              console.log(
                  "Supplied WETH: ",
                  await getUserCollateral(addressesProviderAddress, user.address, collateralAddress)
              );

              console.log(
                  "Borrowed DAI: ",
                  await getUserDebt(addressesProviderAddress, user.address, borrowTokenAddress)
              );
              console.log(
                  "Initial prices: ",
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(collateralAddress), 8),
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(borrowTokenAddress), 8)
              );
              const healthFactor = async () =>
                  Number(
                      ethers.utils.formatEther(
                          (await pool.getUserAccountData(user.address)).healthFactor
                      )
                  );
              console.log("Starting health factor: ", await healthFactor());

              await aaveOracle.setAssetSources([collateralAddress], [mockAggregator.address]);

              console.log(
                  "\nNew prices: ",
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(collateralAddress), 8),
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(borrowTokenAddress), 8)
              );
              console.log("New health factor: ", await healthFactor());

              // Liquidate
              console.log(
                  "Contract WETH balance: ",
                  ethers.utils.formatEther(
                      await liquidatooor.getBalance(deployer.address, collateralAddress)
                  )
              );
              console.log(
                  "Contract DAI balance: ",
                  ethers.utils.formatEther(
                      await liquidatooor.getBalance(deployer.address, borrowTokenAddress)
                  )
              );

              const borrowAmount = async () => {
                  const hf = await healthFactor();
                  const debt = await getUserDebt(
                      addressesProviderAddress,
                      user.address,
                      borrowTokenAddress
                  );
                  return hf < 1 && hf > 0.95 ? debt / 2 : hf < 0.95 ? debt : 0;
              };
              const tx = await liquidatooor.requestFlashLoan(
                  borrowTokenAddress,
                  ethers.utils.parseEther((await borrowAmount()).toString()),
                  collateralAddress,
                  user.address,
                  false
              );
              await tx.wait();

              const wethProfit = await liquidatooor.getBalance(deployer.address, collateralAddress);
              console.log("\nContract WETH balance: ", ethers.utils.formatEther(wethProfit));
              console.log(
                  "Contract DAI balance: ",
                  ethers.utils.formatEther(
                      await liquidatooor.getBalance(deployer.address, borrowTokenAddress)
                  )
              );
              console.log("Ending health factor: ", await healthFactor());

              console.log(
                  "Supplied WETH: ",
                  await getUserCollateral(addressesProviderAddress, user.address, collateralAddress)
              );
              console.log(
                  "Borrowed DAI: ",
                  await getUserDebt(addressesProviderAddress, user.address, borrowTokenAddress)
              );

              // Effectively all debt has been liquidated
              expect(
                  await getUserDebt(addressesProviderAddress, user.address, borrowTokenAddress)
              ).to.be.lt(0.0000001);

              // Ensure token profit is accounted to an account correctly
              expect(await collateral.balanceOf(liquidatooor.address)).to.equal(
                  await liquidatooor.getBalance(deployer.address, collateralAddress)
              );

              // Profit in tokens are successfully withdrawn
              await liquidatooor.withdrawToken(collateralAddress);
              expect(await collateral.balanceOf(deployer.address)).to.equal(wethProfit);
          });

          it("Receives ETH and only owner can withdraw", async () => {
              await other.sendTransaction({
                  to: liquidatooor.address,
                  value: ethers.utils.parseEther("100"),
              });

              await expect(liquidatooor.connect(other).withdrawETH()).to.be.revertedWith(
                  "Ownable: caller is not the owner"
              );

              const initialBal = await ethers.provider.getBalance(deployer.address);
              await liquidatooor.withdrawETH();
              expect(await ethers.provider.getBalance(liquidatooor.address)).to.equal(0);
              // Adding 99.999 instead of 100 to account for gas
              expect(await ethers.provider.getBalance(deployer.address)).to.be.gte(
                  initialBal.add(ethers.utils.parseEther("99.999"))
              );
          });
      });
