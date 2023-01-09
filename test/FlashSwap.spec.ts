import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers, network } from "hardhat";
import { FlashSwap } from "../typechain";
import { IERC20 } from "../typechain/@openzeppelin/contracts/token/ERC20";
import { developmentChains } from "../utils/helper-hardhat-config";
import impersonateAccount from "../utils/impersonateAccount";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Flash Swap", () => {
          let flashSwap: FlashSwap,
              user: SignerWithAddress,
              wethWhale: SignerWithAddress,
              maticWhale: SignerWithAddress,
              weth: IERC20,
              matic: IERC20;

          beforeEach(async () => {
              [user] = await ethers.getSigners();
              await deployments.fixture("swap");

              // Init contract
              flashSwap = await ethers.getContract("FlashSwap");
              // Impersonate whale accounts to get tokens
              wethWhale = await impersonateAccount("0x2093b4281990a568c9d588b8bce3bfd7a1557ebd");
              maticWhale = await impersonateAccount("0xFffbCD322cEace527C8ec6Da8de2461C6D9d4e6e");
              weth = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
                  wethWhale
              );
              matic = await ethers.getContractAt(
                  "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
                  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                  maticWhale
              );

              // Sending gas to the whales
              await user.sendTransaction({
                  to: wethWhale.address,
                  value: ethers.utils.parseEther("10"),
              });
              await user.sendTransaction({
                  to: maticWhale.address,
                  value: ethers.utils.parseEther("10"),
              });

              await weth.transfer(flashSwap.address, ethers.utils.parseEther("10"));
              await matic.transfer(flashSwap.address, ethers.utils.parseEther("10000"));
          });

          it("Should swap tokens", async () => {
              const tx = await flashSwap.swap(
                  weth.address,
                  matic.address,
                  3000,
                  ethers.utils.parseEther("500"),
                  ethers.utils.parseEther("10")
              );
              await tx.wait();

              console.log(
                  "WETH: ",
                  ethers.utils.formatEther(await weth.balanceOf(flashSwap.address))
              );
              console.log(
                  "MATIC: ",
                  ethers.utils.formatEther(await matic.balanceOf(flashSwap.address))
              );
          });
      });
