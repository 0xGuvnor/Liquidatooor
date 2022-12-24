import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "@appliedblockchain/chainlink-plugins-fund-link";
import "./tasks";

dotenv.config();

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            hardfork: "merge",
            // If you want to do some forking set `enabled` to true
            forking: {
                url: process.env.MAINNET_URL!,
                blockNumber: Number(process.env.FORKING_BLOCK_NUMBER),
                enabled: false,
            },
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        mainnet: {
            url: process.env.MAINNET_URL,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            chainId: 1,
        },
        goerli: {
            url: process.env.GOERLI_URL,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            chainId: 5,
        },
        polygonMumbai: {
            url: process.env.POLY_MUMBAI_URL,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            chainId: 80001,
        },
        bscTestnet: {
            url: process.env.BSC_TESTNET_URL,
            accounts: [process.env.PRIVATE_KEY!],
            chainId: 97,
            saveDeployments: true,
        },
        ftmTestnet: {
            url: process.env.FTM_TESTNET_URL,
            accounts: [process.env.PRIVATE_KEY!],
            chainId: 4002,
            saveDeployments: true,
        },
        optimisticKovan: {
            url: process.env.OP_KOVAN_URL,
            accounts: [process.env.PRIVATE_KEY!],
            chainId: 69,
            saveDeployments: true,
        },
    },
    etherscan: {
        apiKey: {
            miannet: process.env.ETHERSCAN_API_KEY!,
            goerli: process.env.ETHERSCAN_API_KEY!,
            polygonMumbai: process.env.POLYSCAN_API_KEY!,
            bscTestnet: process.env.BSCSCAN_API_KEY!,
            ftmTestnet: process.env.FTMSCAN_API_KEY!,
            optimisticKovan: process.env.OPSCAN_API_KEY!,
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        user: {
            default: 1,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
            {
                version: "0.4.24",
            },
        ],
    },
    mocha: {
        timeout: 200_000, // 200 seconds max for running tests
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },
};

export default config;
