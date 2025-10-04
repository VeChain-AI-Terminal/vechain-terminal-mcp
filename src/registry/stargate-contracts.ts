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
 * StarGate NFT Tiers Configuration
 */
export const STARGATE_TIERS = {
  8: { // Dawn
    name: 'Dawn',
    category: 'New Eco',
    vetRequired: '10000',
    supply: 500000,
    maturityDays: 2,
    rewardPerBlock: '0.000697615',
  },
  9: { // Lightning
    name: 'Lightning', 
    category: 'New Eco',
    vetRequired: '50000',
    supply: 100000,
    maturityDays: 5,
    rewardPerBlock: '0.000390030',
  },
  10: { // Flash
    name: 'Flash',
    category: 'New Eco', 
    vetRequired: '200000',
    supply: 25000,
    maturityDays: 15,
    rewardPerBlock: '0.000180745',
  },
  1: { // Strength
    name: 'Strength',
    category: 'Eco',
    vetRequired: '1000000',
    supply: 2500,
    maturityDays: 30,
    rewardPerBlock: '0.000122399',
  },
  2: { // Thunder
    name: 'Thunder',
    category: 'Eco',
    vetRequired: '5000000',
    supply: 300,
    maturityDays: 45,
    rewardPerBlock: '0.000975076',
  },
  3: { // Mjolnir
    name: 'Mjolnir',
    category: 'Eco',
    vetRequired: '15000000',
    supply: 100,
    maturityDays: 60,
    rewardPerBlock: '0.000390030',
  },
  4: { // VeThor X
    name: 'VeThor X',
    category: 'X',
    vetRequired: '600000',
    supply: 735,
    maturityDays: null, // No maturity for X nodes
    rewardPerBlock: '0.000766742',
  },
  5: { // Strength X
    name: 'Strength X',
    category: 'X',
    vetRequired: '1600000',
    supply: 843,
    maturityDays: null,
    rewardPerBlock: '0.000313546',
  },
  6: { // Thunder X
    name: 'Thunder X',
    category: 'X',
    vetRequired: '5600000',
    supply: 180,
    maturityDays: null,
    rewardPerBlock: '0.000136555',
  },
  7: { // Mjolnir X
    name: 'Mjolnir X',
    category: 'X',
    vetRequired: '15600000',
    supply: 158,
    maturityDays: null,
    rewardPerBlock: '0.000487252',
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

/**
 * Get StarGate tier info by ID
 */
export function getStarGateTier(tierId: number) {
  const tier = STARGATE_TIERS[tierId as keyof typeof STARGATE_TIERS];
  if (!tier) {
    throw new Error(`StarGate tier ${tierId} not found`);
  }
  return { id: tierId, ...tier };
}

/**
 * Get all available StarGate tiers
 */
export function getAllStarGateTiers() {
  return Object.entries(STARGATE_TIERS).map(([id, tier]) => ({
    id: parseInt(id),
    ...tier,
  }));
}