import { PluginBase } from '../../core/PluginBase.js';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { TokenService } from './token.service.js';
import type { Chain } from '../../core/types.js';

/**
 * Token Plugin
 * Provides tools for VET and VIP-180 token operations
 */
export class TokenPlugin extends PluginBase<VeChainWalletClient> {
  constructor() {
    super('token', [new TokenService()]);
  }

  supportsChain(chain: Chain): boolean {
    return chain.type === 'vechain';
  }
}

/**
 * Factory function to create a new TokenPlugin instance
 */
export const token = () => new TokenPlugin();


