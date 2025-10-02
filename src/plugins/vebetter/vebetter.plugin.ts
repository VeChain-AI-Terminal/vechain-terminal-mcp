import { PluginBase } from '../../core/PluginBase.js';
import { WalletClientBase } from '../../core/WalletClientBase.js';
import { VeBetterService } from './vebetter.service.js';
import type { Chain } from '../../core/types.js';

/**
 * VeBetter Plugin
 * Enables integration with VeBetter DAO for sustainability rewards
 * 
 * Features:
 * - Submit sustainable actions for B3TR rewards
 * - Track available funds in rewards pool
 * - Claim accumulated rewards
 * - Support for various impact categories
 */
export class VeBetterPlugin extends PluginBase<WalletClientBase> {
  constructor() {
    super('vebetter', [new VeBetterService('testnet')]);
  }

  supportsChain(chain: Chain): boolean {
    // VeBetter only works on VeChain
    return chain.type === 'vechain';
  }
}

/**
 * Factory function to create a new VeBetterPlugin instance
 */
export const vebetter = () => new VeBetterPlugin();
