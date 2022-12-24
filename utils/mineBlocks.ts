import { network } from "hardhat";

const sleep = (timeInMs: number) => {
    return new Promise((resolve) => setTimeout(resolve, timeInMs));
};

export const mineBlock = async (amount: number, sleepAmount = 0) => {
    console.log("Mining block(s)...");
    for (let i = 0; i < amount; i++) {
        await network.provider.request({ method: "evm_mine", params: [] });
        if (sleepAmount) {
            console.log(`Sleeping for ${sleepAmount / 1000}s`);
            await sleep(sleepAmount);
        }
    }
    console.log(`Successfully mined ${amount} blocks!`);
};
