/**
 * StarGate contract registry
 * This stores known StarGate contract addresses for both mainnet and testnet
 */

export interface ContractInfo {
  name: string;
  mainnet?: string;
  testnet?: string;
  abi?: any[];
  description?: string;
}

/**
 * StarGate Contracts
 */
export const STARGATE_CONTRACTS: Record<string, ContractInfo> = {
  STARGATE_NFT: {
    name: 'StarGate NFT',
    mainnet: '0x1856c533ac2d94340aaa8544d35a5c1d4a21dee7',
    testnet: '0x1ec1d168574603ec35b9d229843b7c2b44bcb770',
    description: 'StarGate NFT staking contract for VET staking',
  },
  STARGATE_DELEGATION: {
    name: 'StarGate Delegation',
    mainnet: '0x4cb1c9ef05b529c093371264fab2c93cc6cddb0e',
    testnet: '0x7240e3bc0d26431512d5b67dbd26d199205bffe8',
    description: 'StarGate delegation contract for earning rewards',
  },
  NODE_MANAGEMENT: {
    name: 'Node Management',
    mainnet: '0xB0EF9D89C6b49CbA6BBF86Bf2FDf0Eee4968c6AB',
    testnet: '0x8bcbfc20ee39c94f4e60afc5d78c402f70b4f3b2',
    description: 'Node management contract for delegation and ownership',
  },
  LEGACY_VECHAIN_NODES: {
    name: 'VeChain Nodes (Legacy)',
    mainnet: '0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302',
    testnet: '0x0747b39abc0de3d11c8ddfe2e7eed00aaa8d475c',
    description: 'Legacy VeChain nodes contract for migration',
  },
  VTHO_TOKEN: {
    name: 'VTHO Token',
    mainnet: '0x0000000000000000000000000000456E65726779',
    testnet: '0x0000000000000000000000000000456E65726779',
    description: 'VTHO token contract for rewards',
  },
};

/**
 * Get contract address for a network
 */
export function getStarGateContractAddress(
  contractKey: keyof typeof STARGATE_CONTRACTS,
  network: 'mainnet' | 'testnet'
): string {
  const contract = STARGATE_CONTRACTS[contractKey];
  if (!contract) {
    throw new Error(`StarGate contract ${contractKey} not found in registry`);
  }

  const address = network === 'mainnet' ? contract.mainnet : contract.testnet;
  if (!address) {
    throw new Error(`StarGate contract ${contractKey} not available on ${network}`);
  }

  return address;
}