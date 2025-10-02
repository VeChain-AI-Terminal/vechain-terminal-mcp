import { PluginBase } from '../../core/PluginBase.js';
import { WalletClientBase } from '../../core/WalletClientBase.js';
import { VeChainStatsService } from './vechainstats.service.js';
import type { Chain } from '../../core/types.js';

/**
 * VeChainStats Plugin
 * Provides comprehensive blockchain analytics and data from vechainstats.com
 * 
 * Features:
 * - Account info and transaction history
 * - Token prices and holder lists
 * - DEX trade history (all 6 DEXes)
 * - NFT information
 * - Carbon emissions tracking
 * - Network statistics
 * 
 * Attribution Required: "Powered by vechainstats.com APIs"
 */
export class VeChainStatsPlugin extends PluginBase<WalletClientBase> {
  constructor() {
    super('vechainstats', [new VeChainStatsService()]);
  }

  supportsChain(chain: Chain): boolean {
    return chain.type === 'vechain';
  }
}

/**
 * Factory function to create a new VeChainStatsPlugin instance
 */
export const vechainstats = () => new VeChainStatsPlugin();


