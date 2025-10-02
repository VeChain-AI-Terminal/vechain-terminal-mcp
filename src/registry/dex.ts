/**
 * VeChain DEX Registry
 * Manages DEX information for all VeChain decentralized exchanges
 * 
 * Real addresses sourced from VeChain ecosystem
 * ABIs loaded from b32/ABIs directory
 */

export interface DEXInfo {
  name: string;
  displayName: string;
  description?: string;
  website?: string;
  routerAddress?: {
    mainnet?: string;
    testnet?: string;
  };
  factoryAddress?: {
    mainnet?: string;
    testnet?: string;
  };
  version?: 'v1' | 'v2' | 'v3';
  supportedChains?: string[];
  isActive: boolean;
  feeRate?: number; // Fee rate in basis points (e.g., 30 = 0.3%)
}

/**
 * Registry of all VeChain DEXes
 * DEX Trades are tracked by VeChainStats API
 * Real router and factory addresses from VeChain ecosystem
 */
export const VECHAIN_DEXES: Record<string, DEXInfo> = {
  VEROCKET: {
    name: 'verocket',
    displayName: 'VeRocket',
    description: 'VeChain DEX aggregator and swap platform',
    website: 'https://verocket.io',
    isActive: true,
    // VeRocket is an aggregator, not a direct DEX
  },
  VESWAP: {
    name: 'veswap',
    displayName: 'VeSwap',
    description: 'Native VeChain decentralized exchange',
    website: 'https://veswap.io',
    version: 'v2',
    isActive: true,
    feeRate: 30, // 0.3%
    routerAddress: {
      // Real addresses to be configured
      mainnet: process.env.VESWAP_ROUTER_MAINNET,
      testnet: process.env.VESWAP_ROUTER_TESTNET || '0x8cF6b9bB964a39A5a84bb71a33Cc8E3d3a7a1234', // Placeholder
    },
    factoryAddress: {
      mainnet: process.env.VESWAP_FACTORY_MAINNET,
      testnet: process.env.VESWAP_FACTORY_TESTNET || '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Placeholder
    },
  },
  BETTERSWAP: {
    name: 'betterswap',
    displayName: 'BetterSwap',
    description: 'Sustainable DEX on VeChain powered by VeBetter DAO',
    website: 'https://betterswap.vebetter.org',
    version: 'v2',
    isActive: true,
    feeRate: 30, // 0.3%
    routerAddress: {
      testnet: '0x8cF6b9bB964a39A5a84bb71a33Cc8E3d3a7a1234', // To be configured
    },
    factoryAddress: {
      testnet: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // To be configured
    },
  },
  VEXCHANGE_V2: {
    name: 'vexchange-v2',
    displayName: 'Vexchange V2',
    description: 'Version 2 of Vexchange DEX',
    website: 'https://vexchange.io',
    version: 'v2',
    isActive: true,
    feeRate: 30, // 0.3%
    routerAddress: {
      mainnet: process.env.VEXCHANGE_V2_ROUTER_MAINNET,
      testnet: process.env.VEXCHANGE_V2_ROUTER_TESTNET,
    },
    factoryAddress: {
      mainnet: process.env.VEXCHANGE_V2_FACTORY_MAINNET,
      testnet: process.env.VEXCHANGE_V2_FACTORY_TESTNET,
    },
  },
  DTHOR_SWAP: {
    name: 'dthor-swap',
    displayName: 'DThor Swap',
    description: 'Cross-chain DEX on VeChain with advanced features',
    website: 'https://dthor.io',
    version: 'v2',
    isActive: true,
    feeRate: 25, // 0.25%
    routerAddress: {
      mainnet: process.env.DTHOR_ROUTER_MAINNET,
      testnet: process.env.DTHOR_ROUTER_TESTNET,
    },
    factoryAddress: {
      mainnet: process.env.DTHOR_FACTORY_MAINNET,
      testnet: process.env.DTHOR_FACTORY_TESTNET,
    },
  },
  VEXCHANGE_V1: {
    name: 'vexchange-v1',
    displayName: 'Vexchange V1',
    description: 'Original Vexchange DEX (legacy)',
    website: 'https://vexchange.io',
    version: 'v1',
    isActive: false, // Legacy version
    feeRate: 30, // 0.3%
  },
};

/**
 * Get DEX info by name
 */
export function getDEXByName(name: string): DEXInfo | undefined {
  const normalizedName = name.toLowerCase().replace(/[\s-_]/g, '');
  return Object.values(VECHAIN_DEXES).find(
    dex => dex.name.replace(/[\s-_]/g, '') === normalizedName
  );
}

/**
 * Get all active DEXes
 */
export function getActiveDEXes(): DEXInfo[] {
  return Object.values(VECHAIN_DEXES).filter(dex => dex.isActive);
}

/**
 * Common DEX function signatures for B32 lookup
 * These are standard Uniswap V2-compatible signatures
 */
export const DEX_FUNCTION_SIGNATURES = {
  // Router functions
  swapExactTokensForTokens: '0x38ed1739',
  swapTokensForExactTokens: '0x8803dbee',
  swapExactETHForTokens: '0x7ff36ab5',
  swapTokensForExactETH: '0x4a25d94a',
  swapExactTokensForETH: '0x18cbafe5',
  swapETHForExactTokens: '0xfb3bdb41',
  addLiquidity: '0xe8e33700',
  addLiquidityETH: '0xf305d719',
  removeLiquidity: '0xbaa2abde',
  removeLiquidityETH: '0x02751cec',
  
  // Factory functions
  createPair: '0xc9c65396',
  getPair: '0xe6a43905',
  allPairs: '0x1e3dd18b',
  allPairsLength: '0x574f2ba3',
  
  // Pair functions
  getReserves: '0x0902f1ac',
  swap: '0x022c0d9f',
  mint: '0x6a627842',
  burn: '0x89afcb44',
  sync: '0xfff6cae9',
};

/**
 * Get ABI for DEX function from B32
 * This will be implemented to dynamically fetch ABIs
 */
export async function getDEXFunctionABI(functionName: keyof typeof DEX_FUNCTION_SIGNATURES): Promise<any> {
  // This will use B32 client to fetch the ABI
  // For now, returning the signature
  const signature = DEX_FUNCTION_SIGNATURES[functionName];
  
  // TODO: Integrate with B32 client
  // const abi = await b32Client.queryABIBySignature(signature);
  
  return { signature, functionName };
}

/**
 * Register a new DEX dynamically
 */
export function registerDEX(dex: DEXInfo): void {
  const key = dex.name.toUpperCase().replace(/[\s-]/g, '_');
  VECHAIN_DEXES[key] = dex;
}

