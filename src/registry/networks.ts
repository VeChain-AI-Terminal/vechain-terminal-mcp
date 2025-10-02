import type { Chain } from '../core/types.js';

/**
 * VeChain network configurations
 */
export const VECHAIN_NETWORKS = {
  mainnet: {
    type: 'vechain' as const,
    id: 100009,
    name: 'VeChain',
    rpcUrl: 'https://mainnet.vechain.org',
    nativeCurrency: {
      name: 'VeChain',
      symbol: 'VET',
      decimals: 18,
    },
    blockExplorer: 'https://explore.vechain.org',
  },
  testnet: {
    type: 'vechain' as const,
    id: 100010,
    name: 'VeChain Testnet',
    rpcUrl: 'https://testnet.vechain.org',
    nativeCurrency: {
      name: 'VeChain',
      symbol: 'VET',
      decimals: 18,
    },
    blockExplorer: 'https://explore-testnet.vechain.org',
  },
} as const;

export type NetworkType = keyof typeof VECHAIN_NETWORKS;

export function getNetwork(network: NetworkType): Chain & { rpcUrl: string; blockExplorer: string } {
  return VECHAIN_NETWORKS[network];
}


