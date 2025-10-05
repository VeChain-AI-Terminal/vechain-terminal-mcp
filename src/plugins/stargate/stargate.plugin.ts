import { PluginBase } from '../../core/PluginBase.js';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { StarGateService } from './stargate.service.js';
import type { Chain } from '../../core/types.js';

/**
 * StarGate Plugin
 * Provides tools for StarGate NFT staking, delegation, and management operations
 */
export class StarGatePlugin extends PluginBase<VeChainWalletClient> {
  constructor() {
    super('stargate', [new StarGateService()]);
  }

  supportsChain(chain: Chain): boolean {
    return chain.type === 'vechain';
  }
}

/**
 * Factory function to create a new StarGatePlugin instance
 */
export const stargate = () => new StarGatePlugin();