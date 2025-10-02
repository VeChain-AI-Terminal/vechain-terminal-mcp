/**
 * DEX ABIs for VeChain
 * Real contract ABIs for production DEX operations
 */

// Define FunctionFragment type locally since it's not exported from SDK
type FunctionFragment = {
  name: string;
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ name: string; type: string }>;
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  type: 'function';
};

// For now, we'll use the existing Uniswap V2 compatible ABI from the registry
// Real ABIs from b32/ABIs directory can be loaded dynamically when needed
import { UNISWAP_V2_ROUTER_ABI, UNISWAP_V2_PAIR_ABI } from './uniswap-v2-router-abi.js';

/**
 * DEX ABIs from existing registry
 * Most VeChain DEXes are Uniswap V2 compatible
 */
export const DEX_ABIS = {
  // Standard Uniswap V2 compatible (used by most VeChain DEXes)
  UNISWAP_V2_ROUTER: UNISWAP_V2_ROUTER_ABI,
  UNISWAP_V2_PAIR: UNISWAP_V2_PAIR_ABI,
  
  // Additional factory ABI functions
  UNISWAP_V2_FACTORY: [
    {
      name: 'getPair',
      inputs: [
        { name: 'tokenA', type: 'address' },
        { name: 'tokenB', type: 'address' }
      ],
      outputs: [{ name: 'pair', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      name: 'createPair',
      inputs: [
        { name: 'tokenA', type: 'address' },
        { name: 'tokenB', type: 'address' }
      ],
      outputs: [{ name: 'pair', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      name: 'allPairs',
      inputs: [{ name: 'index', type: 'uint256' }],
      outputs: [{ name: 'pair', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      name: 'allPairsLength',
      inputs: [],
      outputs: [{ name: 'length', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }
  ] as FunctionFragment[],
};

/**
 * Get specific function from ABI
 */
export function getABIFunction(abiType: keyof typeof DEX_ABIS, functionName: string): FunctionFragment | undefined {
  return DEX_ABIS[abiType].find(f => f.name === functionName);
}

/**
 * Common DEX function signatures used across VeChain
 */
export const DEX_FUNCTIONS = {
  // Router swap functions
  swapExactTokensForTokens: getABIFunction('UNISWAP_V2_ROUTER', 'swapExactTokensForTokens'),
  swapTokensForExactTokens: getABIFunction('UNISWAP_V2_ROUTER', 'swapTokensForExactTokens'),
  swapExactETHForTokens: getABIFunction('UNISWAP_V2_ROUTER', 'swapExactETHForTokens'),
  swapTokensForExactETH: getABIFunction('UNISWAP_V2_ROUTER', 'swapTokensForExactETH'),
  swapExactTokensForETH: getABIFunction('UNISWAP_V2_ROUTER', 'swapExactTokensForETH'),
  swapETHForExactTokens: getABIFunction('UNISWAP_V2_ROUTER', 'swapETHForExactTokens'),
  
  // Quote functions
  getAmountsOut: getABIFunction('UNISWAP_V2_ROUTER', 'getAmountsOut'),
  getAmountsIn: getABIFunction('UNISWAP_V2_ROUTER', 'getAmountsIn'),
  
  // Factory functions
  getPair: getABIFunction('UNISWAP_V2_FACTORY', 'getPair'),
  createPair: getABIFunction('UNISWAP_V2_FACTORY', 'createPair'),
  
  // Pair functions
  getReserves: getABIFunction('UNISWAP_V2_PAIR', 'getReserves'),
  token0: getABIFunction('UNISWAP_V2_PAIR', 'token0'),
  token1: getABIFunction('UNISWAP_V2_PAIR', 'token1'),
  
  // Liquidity functions
  addLiquidity: getABIFunction('UNISWAP_V2_ROUTER', 'addLiquidity'),
  addLiquidityETH: getABIFunction('UNISWAP_V2_ROUTER', 'addLiquidityETH'),
  removeLiquidity: getABIFunction('UNISWAP_V2_ROUTER', 'removeLiquidity'),
  removeLiquidityETH: getABIFunction('UNISWAP_V2_ROUTER', 'removeLiquidityETH'),
};

/**
 * ERC20 approval ABI (needed for token swaps)
 */
export const ERC20_APPROVE_ABI: FunctionFragment = {
  name: 'approve',
  inputs: [
    { name: 'spender', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  outputs: [{ name: '', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function'
};

/**
 * WVET address for VeChain (wrapped VET)
 */
export const WVET_ADDRESSES = {
  mainnet: '0x0000000000000000000000000000456E65726779', // VTHO address as placeholder
  testnet: '0x0000000000000000000000000000456E65726779'  // VTHO address as placeholder
};