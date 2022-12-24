import { ethers, network } from "hardhat";
import { developmentChains } from "./../../utils/helper-hardhat-config";
import { expect } from "chai";

!developmentChains.includes(network.name) ? describe.skip : describe("Sample Unit Tests", () => {});
