/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  Dex,
  DexInterface,
} from "../../../../contracts/aave-v3/mocks/Dex";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
    ],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "sellWeth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "wethToDaiRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60c060405273d575d4047f8c667e064a4ad433d04e25187f40bb73ffffffffffffffffffffffffffffffffffffffff1660809073ffffffffffffffffffffffffffffffffffffffff16815250739a753f0f7886c9fbf63cf59d0d4423c5eface95b73ffffffffffffffffffffffffffffffffffffffff1660a09073ffffffffffffffffffffffffffffffffffffffff1681525060e66002553480156100a357600080fd5b506080516000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060a051600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060805160a0516105c361014860003960005050600050506105c36000f3fe6080604052600436106100385760003560e01c80634b8860bc14610044578063741182421461006d578063f8b2cb4f146100985761003f565b3661003f57005b600080fd5b34801561005057600080fd5b5061006b600480360381019061006691906102f1565b6100d5565b005b34801561007957600080fd5b5061008261022d565b60405161008f919061032d565b60405180910390f35b3480156100a457600080fd5b506100bf60048036038101906100ba91906103a6565b610233565b6040516100cc919061032d565b60405180910390f35b6000600254826100e59190610402565b905060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330856040518463ffffffff1660e01b81526004016101449392919061046b565b6020604051808303816000875af1158015610163573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061018791906104da565b50600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff1660e01b81526004016101e5929190610507565b6020604051808303816000875af1158015610204573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061022891906104da565b505050565b60025481565b60008173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161026e9190610530565b602060405180830381865afa15801561028b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102af9190610560565b9050919050565b600080fd5b6000819050919050565b6102ce816102bb565b81146102d957600080fd5b50565b6000813590506102eb816102c5565b92915050565b600060208284031215610307576103066102b6565b5b6000610315848285016102dc565b91505092915050565b610327816102bb565b82525050565b6000602082019050610342600083018461031e565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061037382610348565b9050919050565b61038381610368565b811461038e57600080fd5b50565b6000813590506103a08161037a565b92915050565b6000602082840312156103bc576103bb6102b6565b5b60006103ca84828501610391565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061040d826102bb565b9150610418836102bb565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610451576104506103d3565b5b828202905092915050565b61046581610368565b82525050565b6000606082019050610480600083018661045c565b61048d602083018561045c565b61049a604083018461031e565b949350505050565b60008115159050919050565b6104b7816104a2565b81146104c257600080fd5b50565b6000815190506104d4816104ae565b92915050565b6000602082840312156104f0576104ef6102b6565b5b60006104fe848285016104c5565b91505092915050565b600060408201905061051c600083018561045c565b610529602083018461031e565b9392505050565b6000602082019050610545600083018461045c565b92915050565b60008151905061055a816102c5565b92915050565b600060208284031215610576576105756102b6565b5b60006105848482850161054b565b9150509291505056fea2646970667358221220268fff4dd8c898cec68d7fcd632d873b330725196dc54ed88d3b88d4b54badd764736f6c634300080a0033";

type DexConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DexConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Dex__factory extends ContractFactory {
  constructor(...args: DexConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Dex> {
    return super.deploy(overrides || {}) as Promise<Dex>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Dex {
    return super.attach(address) as Dex;
  }
  override connect(signer: Signer): Dex__factory {
    return super.connect(signer) as Dex__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DexInterface {
    return new utils.Interface(_abi) as DexInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Dex {
    return new Contract(address, _abi, signerOrProvider) as Dex;
  }
}