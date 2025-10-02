/**
 * VeChain contract registry
 * This stores known contract addresses for both mainnet and testnet
 */

export interface ContractInfo {
  name: string;
  mainnet?: string;
  testnet?: string;
  abi?: any[];
  description?: string;
}

/**
 * VeBetter DAO Contracts
 */
export const VEBETTER_CONTRACTS: Record<string, ContractInfo> = {
  REWARDS_POOL: {
    name: 'X2Earn Rewards Pool',
    testnet: '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38',
    mainnet: undefined, // Add when available
    description: 'Distributes B3TR rewards for sustainable actions',
  },
  B3TR_TOKEN: {
    name: 'B3TR Token',
    testnet: '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F',
    mainnet: undefined,
    description: 'VeBetter DAO governance and reward token',
  },
  APPS_REGISTRY: {
    name: 'X2Earn Apps Registry',
    testnet: '0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153',
    mainnet: undefined,
    description: 'Registry of VeBetter applications',
  },
};

/**
 * Get contract address for a network
 */
export function getContractAddress(
  contractKey: keyof typeof VEBETTER_CONTRACTS,
  network: 'mainnet' | 'testnet'
): string {
  const contract = VEBETTER_CONTRACTS[contractKey];
  if (!contract) {
    throw new Error(`Contract ${contractKey} not found in registry`);
  }

  const address = network === 'mainnet' ? contract.mainnet : contract.testnet;
  if (!address) {
    throw new Error(`Contract ${contractKey} not available on ${network}`);
  }

  return address;
}

/**
 * Standard ERC20/VIP-180 ABI (basic functions)
 */
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
];


