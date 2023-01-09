type NetworkConfigItem = {
    name: string;
    v2PoolProvider?: string;
    v2Dai?: string;
    v3PoolProvider?: string;
    v3AaveOracle?: string;
    v3Dai?: string;
    v3Weth?: string;
    v3Link?: string;
    v3Btc?: string;
};

type NetworkConfigMap = {
    [chainId: string]: NetworkConfigItem;
};

export const networkConfig: NetworkConfigMap = {
    default: {
        name: "hardhat",
    },
    31337: {
        // Polygon Mumbai
        name: "localhost",
        v3PoolProvider: "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6",
        v3AaveOracle: "0x520D14AE678b41067f029Ad770E2870F85E76588",
        v3Dai: "0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B",
        v3Weth: "0xd575d4047f8c667E064a4ad433D04E25187F40BB",
        v3Link: "0xD9E7e5dd6e122dDE11244e14A60f38AbA93097f2",
        v3Btc: "0x85E44420b6137bbc75a85CAB5c9A3371af976FdE",

        // Polygon
        // v3PoolProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
        // v3AaveOracle: "0xb023e699F5a33916Ea823A16485e259257cA8Bd1",
        // v3Dai: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        // v3Weth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        // v3Link: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
        // v3Btc: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    },
    1: {
        name: "mainnet",
    },
    5: {
        name: "goerli",
        v2PoolProvider: "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
        v2Dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        v3PoolProvider: "0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D",
        v3Dai: "0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33",
    },
    137: {
        name: "polygon",
        v3PoolProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
        v3AaveOracle: "0xb023e699F5a33916Ea823A16485e259257cA8Bd1",
        v3Dai: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        v3Weth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        v3Link: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
        v3Btc: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    },
    80001: {
        name: "polygonMumbai",
        v3PoolProvider: "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6",
        v3Dai: "0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B",
        v3Weth: "0xd575d4047f8c667E064a4ad433D04E25187F40BB",
        v3Link: "0xD9E7e5dd6e122dDE11244e14A60f38AbA93097f2",
        v3Btc: "0x85E44420b6137bbc75a85CAB5c9A3371af976FdE",
    },
    4002: {
        name: "ftmTestnet",
    },
    97: {
        name: "bscTestnet",
    },
    43113: {
        name: "avaxFuji",
        v3PoolProvider: "0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29",
        v3Dai: "0xFc7215C9498Fc12b22Bc0ed335871Db4315f03d3",
        v3Weth: "0x28A8E6e41F84e62284970E4bc0867cEe2AAd0DA4",
        v3Link: "0x73b4C0C45bfB90FC44D9013FA213eF2C2d908D0A",
    },
};

export const developmentChains: string[] = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 7;
