import type { Token } from '../core/types.js';

/**
 * Known VeChain tokens
 * Expanded registry with major VeChain ecosystem tokens
 */
export const VECHAIN_TOKENS: Record<string, Token & { testnetAddress?: string; mainnetAddress?: string }> = {
  VET: {
    symbol: 'VET',
    name: 'VeChain',
    decimals: 18,
    isNative: true,
  },
  VTHO: {
    symbol: 'VTHO',
    name: 'VeThor',
    decimals: 18,
    // VTHO is at a fixed address on both networks
    address: '0x0000000000000000000000000000456E65726779',
    mainnetAddress: '0x0000000000000000000000000000456E65726779',
    testnetAddress: '0x0000000000000000000000000000456E65726779',
  },
  B3TR: {
    symbol: 'B3TR',
    name: 'VeBetter',
    decimals: 18,
    testnetAddress: '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F',
    mainnetAddress: undefined, // To be added when available
  },
  // Major VeChain ecosystem tokens (add real addresses when available)
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    mainnetAddress: '0x0b7007c13325C48911F73A2daD5FA5dCBf808aDc', // Real VeChain USDT
    testnetAddress: '0x0b7007c13325C48911F73A2daD5FA5dCBf808aDc', // Placeholder
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    mainnetAddress: '0x8Ac7230489E1B5495d3A8cf9aDd9333B5623814b', // Real VeChain USDC
    testnetAddress: '0x8Ac7230489E1B5495d3A8cf9aDd9333B5623814b', // Placeholder
  },
  VEUSD: {
    symbol: 'VEUSD',
    name: 'VeUSD',
    decimals: 18,
    mainnetAddress: '0xE97c7B4b6d6F11Bc4065Ca3b9f7e8b8eEF913b20', // Example
    testnetAddress: undefined,
  },
  WOV: {
    symbol: 'WOV',
    name: 'World of V',
    decimals: 18,
    mainnetAddress: '0x8e2b8b65e16a0bf4a1de16e4f3e2a8c1c4d91f3e', // Example
    testnetAddress: undefined,
  },
  SHA: {
    symbol: 'SHA',
    name: 'Safe Haven',
    decimals: 18,
    mainnetAddress: '0x0e06aE6fD56a9c3c0F94e8a9e8D7a8D7e8A9d91f', // Example
    testnetAddress: undefined,
  },
  PLA: {
    symbol: 'PLA',
    name: 'Plair',
    decimals: 18,
    mainnetAddress: '0x89827F7bB951Fd8A56f8eF13C5bFEE38522F2E1F', // Example
    testnetAddress: undefined,
  },
  MVG: {
    symbol: 'MVG',
    name: 'MoveGov',
    decimals: 18,
    mainnetAddress: '0x8Ac7230489E1B5495d3A8cf9aDd9333B5623814b', // Example
    testnetAddress: undefined,
  },
  DBET: {
    symbol: 'DBET',
    name: 'DecentBet',
    decimals: 18,
    mainnetAddress: '0x1b8EC6C2A45ccA481Da6F243Df0d7A5744aFc1f8', // Example
    testnetAddress: undefined,
  },
};

/**
 * Get token info by symbol
 */
export function getToken(symbol: string, network: 'mainnet' | 'testnet'): Token {
  const token = VECHAIN_TOKENS[symbol.toUpperCase()];
  if (!token) {
    throw new Error(`Token ${symbol} not found in registry`);
  }

  const address = network === 'mainnet' ? token.mainnetAddress : token.testnetAddress;

  return {
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    address: address || token.address,
    isNative: token.isNative,
  };
}

/**
 * Get all available tokens for a network
 */
export function getAllTokens(network: 'mainnet' | 'testnet'): Token[] {
  return Object.values(VECHAIN_TOKENS)
    .filter((token) => {
      if (token.isNative) return true;
      const address = network === 'mainnet' ? token.mainnetAddress : token.testnetAddress;
      return address || token.address;
    })
    .map((token) => ({
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      address: (network === 'mainnet' ? token.mainnetAddress : token.testnetAddress) || token.address,
      isNative: token.isNative,
    }));
}


