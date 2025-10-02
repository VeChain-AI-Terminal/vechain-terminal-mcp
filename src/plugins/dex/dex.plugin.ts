import { PluginBase } from '../../core/PluginBase.js';
import { WalletClientBase } from '../../core/WalletClientBase.js';
import { DEXService } from './dex.service.js';
import type { Chain } from '../../core/types.js';

/**
 * DEX Plugin
 * Enables decentralized token swaps on VeChain
 * 
 * Supported DEXes (Uniswap V2-compatible):
 * - VeRocket - DEX aggregator
 * - VeSwap - Native VeChain DEX
 * - BetterSwap - Sustainable DEX
 * - Vexchange V1 - Original DEX
 * - Vexchange V2 - Updated version
 * - DThor Swap - Cross-chain focus
 * 
 * Features:
 * - Token swaps (VET <-> Tokens, Token <-> Token)
 * - Swap quotes with price impact
 * - Slippage protection
 * - Liquidity pool info
 * - Trade history (via VeChainStats)
 */
export class DEXPlugin extends PluginBase<WalletClientBase> {
  constructor() {
    super('dex', [new DEXService('testnet')]);
  }

  supportsChain(chain: Chain): boolean {
    // DEX plugin only works on VeChain
    return chain.type === 'vechain';
  }
}

/**
 * Factory function to create a new DEXPlugin instance
 */
export const dex = () => new DEXPlugin();

