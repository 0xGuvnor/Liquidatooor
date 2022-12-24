type NetworkConfigItem = {
    name: string;
    fee?: string;
    keyHash?: string;
    interval?: string;
    linkToken?: string;
    vrfCoordinator?: string;
    vrfSubscriptionId?: number;
    callbackGasLimit?: number;
    keepersUpdateInterval?: string;
    oracle?: string;
    jobId?: string;
    ethUsdPriceFeed?: string;
};

type NetworkConfigMap = {
    [chainId: string]: NetworkConfigItem;
};

export const networkConfig: NetworkConfigMap = {
    default: {
        name: "hardhat",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
    },
    1: {
        name: "mainnet",
        linkToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
        keepersUpdateInterval: "30",
    },
    5: {
        name: "goerli",
        linkToken: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        oracle: "0xCC79157eb46F5624204f47AB42b3906cAA40eaB7",
        jobId: "ca98366cc7314957b8c012c72f05aeeb",
        fee: "100000000000000000",
        keepersUpdateInterval: "30",
    },
    137: {
        name: "polygon",
        linkToken: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        oracle: "0x0a31078cd57d23bf9e8e8f1ba78356ca2090569e",
        jobId: "12b86114fa9e46bab3ca436f88e1a912",
        fee: "100000000000000",
    },
    80001: {
        name: "polygonMumbai",
    },
    4002: {
        name: "ftmTestnet",
    },
    97: {
        name: "bscTestnet",
        vrfCoordinator: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f",
        linkToken: "0x84b9b910527ad5c03a9ca831909e21e236ea7b06",
        keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314",
        vrfSubscriptionId: 4446,
        callbackGasLimit: 500_000,
    },
    69: {
        name: "optimisticKovan",
    },
};

export const developmentChains: string[] = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 7;
