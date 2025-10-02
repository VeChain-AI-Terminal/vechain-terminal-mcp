import { PluginBase } from '../../core/PluginBase.js';
import { WalletClientBase } from '../../core/WalletClientBase.js';
import { NFTService } from './nft.service.js';
import type { Chain } from '../../core/types.js';

/**
 * NFT Plugin
 * Enables VIP-181 NFT operations on VeChain
 * 
 * Features:
 * - Query NFT collections (via VeChainStats)
 * - Mint NFTs (VIP-181 standard)
 * - Transfer NFTs
 * - Get metadata and ownership info
 * - Track transfer history
 * - Get floor prices and market data
 * 
 * Data Sources:
 * - VeChainStats API: Collection data, floor prices, trading stats
 * - On-chain queries: Ownership, metadata, token URIs
 * - B32 ABIs: VIP-181 standard functions
 */
export class NFTPlugin extends PluginBase<WalletClientBase> {
  constructor() {
    super('nft', [new NFTService('testnet')]);
  }

  supportsChain(chain: Chain): boolean {
    // NFT plugin only works on VeChain
    return chain.type === 'vechain';
  }
}

/**
 * Factory function to create a new NFTPlugin instance
 */
export const nft = () => new NFTPlugin();


