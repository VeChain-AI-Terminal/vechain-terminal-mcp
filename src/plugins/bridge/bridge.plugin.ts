import { PluginBase } from '../../core/PluginBase.js';
import { WalletClientBase } from '../../core/WalletClientBase.js';
import { BridgeService } from './bridge.service.js';
import type { Chain } from '../../core/types.js';

/**
 * Bridge Plugin
 * Enables cross-chain token transfers using WanBridge API
 * 
 * Features:
 * - Cross-chain token transfers between 25+ blockchains
 * - Support for VET, ETH, BNB, MATIC, and more
 * - Real-time bridge quotes and fees
 * - Transaction status tracking
 */
export class BridgePlugin extends PluginBase<WalletClientBase> {
  constructor() {
    super('bridge', [new BridgeService('testnet')]);
  }

  supportsChain(chain: Chain): boolean {
    // Bridge supports multiple chains including VeChain
    return ['vechain', 'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'].includes(chain.type);
  }
}

/**
 * Factory function to create a new BridgePlugin instance
 */
export const bridge = () => new BridgePlugin();
