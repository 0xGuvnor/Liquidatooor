import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { Address } from "hardhat-deploy/types";
import {
    IAaveOracle,
    IPool,
    LiquidatooorV3,
    MockAggregator,
    UniswapV3Liquidity,
} from "../typechain";
import { IERC20 } from "../typechain/@openzeppelin/contracts/token/ERC20";
import { getUserCollateral } from "../utils/getUserCollateral";
import { getUserDebt } from "../utils/getUserDebt";
import { developmentChains, networkConfig } from "../utils/helper-hardhat-config";
import impersonateAccount from "../utils/impersonateAccount";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("LiquidatooorV3", () => {
          let chainId: number,
              liquidatooor: LiquidatooorV3,
              pool: IPool,
              addressesProviderAddress: Address,
              uniLiquidity: UniswapV3Liquidity,
              aaveOracle: IAaveOracle,
              mockAggregator: MockAggregator,
              deployer: SignerWithAddress,
              user: SignerWithAddress,
              wethWhale: SignerWithAddress,
              daiWhale: SignerWithAddress,
              weth: IERC20,
              dai: IERC20;

          beforeEach(async () => {
              chainId = network.config.chainId!;
              [deployer, user] = await ethers.getSigners();
              await deployments.fixture("all");

              // Init contracts`
              liquidatooor = await ethers.getContract("LiquidatooorV3");
              uniLiquidity = await ethers.getContract("UniswapV3Liquidity");
              pool = await ethers.getContractAt("IPool", await liquidatooor.POOL(), user);
              aaveOracle = await ethers.getContractAt(
                  "IAaveOracle",
                  networkConfig[chainId].v3AaveOracle!,
                  await impersonateAccount("0x77c45699A715A64A7a7796d5CEe884cf617D5254")
              );
              mockAggregator = await ethers.getContract("MockAggregator");

              // Impersonate whale accounts to get tokens
              wethWhale = await impersonateAccount("0x93a7c39d7f848A1e9C479C6FE1F8995015Ea2fb9");
              daiWhale = await impersonateAccount("0x93a7c39d7f848a1e9c479c6fe1f8995015ea2fb9");
              weth = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  "0xd575d4047f8c667E064a4ad433D04E25187F40BB",
                  wethWhale
              );
              dai = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  "0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B",
                  daiWhale
              );

              // Tokens to add liquidity to Uni V3 pool
              await weth.transfer(deployer.address, ethers.utils.parseEther("5"));
              await dai.transfer(deployer.address, ethers.utils.parseEther("1150"));

              // Tokens to supply and borrow from Aave
              await weth.transfer(user.address, ethers.utils.parseEther("1"));
              await dai.transfer(user.address, ethers.utils.parseEther("200"));

              // Aave Addresses Provider
              addressesProviderAddress = await liquidatooor.ADDRESSES_PROVIDER();
          });

          it("Should swap tokens", async () => {
              // Create new liquidity pool in Uni V3
              await uniLiquidity.createNewPool();

              await dai
                  .connect(deployer)
                  .approve(uniLiquidity.address, ethers.utils.parseEther("1000000"));
              await weth
                  .connect(deployer)
                  .approve(uniLiquidity.address, ethers.utils.parseEther("1000000"));

              await uniLiquidity.mintNewPosition(
                  ethers.utils.parseEther("1150"),
                  ethers.utils.parseEther("5")
              );

              // Supply and borrow
              await weth.connect(user).approve(pool.address, ethers.utils.parseEther("1"));
              await pool.supply(weth.address, ethers.utils.parseEther("1"), user.address, 0);
              await pool.borrow(dai.address, ethers.utils.parseEther("200"), 2, 0, user.address);

              const healthFactor = async () =>
                  Number(
                      ethers.utils.formatEther(
                          (await pool.getUserAccountData(user.address)).healthFactor
                      )
                  );

              console.log(
                  "Supplied WETH: ",
                  await getUserCollateral(addressesProviderAddress, user.address, weth.address)
              );
              console.log(
                  "Borrowed DAI: ",
                  await getUserDebt(addressesProviderAddress, user.address, dai.address)
              );
              console.log(
                  "Initial prices: ",
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(weth.address), 8),
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(dai.address), 8)
              );
              console.log("Starting health factor: ", await healthFactor());

              // Update oracle
              await aaveOracle.setAssetSources([weth.address], [mockAggregator.address]);

              console.log(
                  "\nNew prices: ",
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(weth.address), 8),
                  ethers.utils.formatUnits(await aaveOracle.getAssetPrice(dai.address), 8)
              );
              console.log("New health factor: ", await healthFactor());

              // Liquidate;
              console.log(
                  "Starting DAI: ",
                  ethers.utils.formatEther(await dai.balanceOf(deployer.address))
              );
              console.log(
                  "Starting WETH: ",
                  ethers.utils.formatEther(await weth.balanceOf(deployer.address))
              );

              const borrowAmount = async () => {
                  const hf = await healthFactor();
                  const debt = await getUserDebt(
                      addressesProviderAddress,
                      user.address,
                      dai.address
                  );
                  return hf < 1 && hf > 0.95 ? debt / 2 : hf < 0.95 ? debt : 0;
              };
              await liquidatooor.requestFlashLoan(
                  dai.address,
                  ethers.utils.parseEther((await borrowAmount()).toString()),
                  weth.address,
                  user.address
              );

              console.log("\nEnding health factor: ", await healthFactor());
              console.log(
                  "Supplied WETH: ",
                  await getUserCollateral(addressesProviderAddress, user.address, weth.address)
              );
              console.log(
                  "Borrowed DAI: ",
                  await getUserDebt(addressesProviderAddress, user.address, dai.address)
              );

              console.log(
                  "\nEnding DAI: ",
                  ethers.utils.formatEther(await dai.balanceOf(deployer.address))
              );
              console.log(
                  "Ending WETH: ",
                  ethers.utils.formatEther(await weth.balanceOf(deployer.address))
              );

              // Effectively all debt has been liquidated
              expect(
                  await getUserDebt(addressesProviderAddress, user.address, dai.address)
              ).to.be.lt(0.0000001);
          });

          it("Receives ETH and only owner can withdraw", async () => {
              await user.sendTransaction({
                  to: liquidatooor.address,
                  value: ethers.utils.parseEther("100"),
              });

              await expect(liquidatooor.connect(user).sweepETH()).to.be.revertedWith(
                  "Ownable: caller is not the owner"
              );

              const initialBal = await ethers.provider.getBalance(deployer.address);
              await liquidatooor.sweepETH();
              expect(await ethers.provider.getBalance(liquidatooor.address)).to.equal(0);
              // Adding 99.999 instead of 100 to account for gas
              expect(await ethers.provider.getBalance(deployer.address)).to.be.gte(
                  initialBal.add(ethers.utils.parseEther("99.999"))
              );
          });
      });
