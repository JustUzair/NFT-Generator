import FactoryAbi from "./abis/FactoryAbi.json";
import ERC1155Abi from "./abis/ERC1155Abi.json";

const contractFactory = [
  {
    chainId: 80002,
    factoryAddress: "0xd712eEE0CcC2F3e8d6A5CbF7866c9A2fE648F409",
    factoryAbi: FactoryAbi.abi,
    erc1155Abi: ERC1155Abi.abi,
  },
  {
    chainId: 137,
    factoryAddress: null,
    factoryAbi: FactoryAbi.abi,
    erc1155Abi: ERC1155Abi.abi,
  },
  {
    chainId: 11155111,
    factoryAddress: "0xb4637cF1E4f73f34F96CF3144C135f953C3fF727",
    factoryAbi: FactoryAbi.abi,
    erc1155Abi: ERC1155Abi.abi,
  },
];

function getContractFactory(chainId: number) {
  console.log("====================================");
  console.log(contractFactory.find((contract) => contract.chainId === chainId));
  console.log("====================================");
  return contractFactory.find((contract) => contract.chainId === chainId);
}

export { getContractFactory };
