/**
 * WanBridge & XFlows Constants
 * From official Wanchain documentation
 */

/**
 * VeChain Cross-Chain Gateway Addresses
 * Source: bridge.md section 3.2, line 3944
 */
export const VECHAIN_GATEWAY = {
  mainnet: '0x7280E3b8c686c68207aCb1A4D656b2FC8079c033', // Same as other EVM chains (section 3.1)
  testnet: '0xa1Dd5cBF77e1E78C307ecbD7c6AEea90FC71499e'  // Testnet-specific gateway
};

/**
 * Supported Chain Types (BIP44 Chain IDs)
 * Source: bridge.md section 2.2.1
 */
export const WANBRIDGE_CHAINS = {
  // Major cryptocurrencies
  BTC: 2147483648,
  LTC: 2147483650,
  DOGE: 2147483651,
  ETH: 2147483708,
  XRP: 2147483792,
  EOS: 2147483842,
  TRX: 2147483843,
  DOT: 2147484002,
  
  // EVM chains
  XDC: 2147484198,
  OETH: 2147484262,      // Optimism
  BNB: 2147484362,       // BSC
  ASTR: 2147484458,      // Astar
  VET: 2147484466,       // VeChain ⭐
  MATIC: 2147484614,     // Polygon
  TLOS: 2147484625,      // Telos
  OKT: 2147484644,       // OKX Chain
  FTM: 2147484655,       // Fantom
  ADA: 2147485463,       // Cardano
  AVAX: 2147492648,      // Avalanche
  NRG: 2147493445,       // Energi
  WAN: 2153201998,       // Wanchain
  BROCK: 2154655314,     // Bitrock
  
  // Layer 2s and new chains
  MOVR: 1073741825,      // Moonriver
  ARETH: 1073741826,     // Arbitrum
  GLMR: 1073741828,      // Moonbeam
  FX: 1073741830,        // f(x)Core
  GTH: 1073741833,       // Gather
  METIS: 1073741834,     // Metis
  SGB: 1073741836,       // Songbird
  ZKETH: 1073741837,     // zkSync Era
  ZEN: 1073741839,       // Horizen EON
  VC: 1073741840,        // VinuChain
  BASEETH: 1073741841,   // Base
  LINEAETH: 1073741842   // Linea
};

/**
 * XFlows Work Modes
 * Source: bridge.md XFlows API section
 */
export const XFLOWS_WORK_MODES = {
  DIRECT_WANBRIDGE: 1,        // Direct cross-chain via WanBridge
  DIRECT_QUIX: 2,             // Direct cross-chain via QuiX (faster)
  BRIDGE_THEN_SWAP: 3,        // Bridge to destination, then swap
  BRIDGE_SWAP_BRIDGE: 4,      // Bridge to Wanchain, swap, bridge to destination
  SWAP_ONLY: 5,               // DEX swap on same chain
  SWAP_THEN_BRIDGE: 6         // Swap on source, then bridge
};

/**
 * Bridge Status Codes
 * Source: bridge.md section 4.1
 */
export const BRIDGE_STATUS = {
  SUCCESS: 'Success',
  FAILED: 'Failed',
  PROCESSING: 'Processing',
  REFUND: 'Refund',
  TRUSTEESHIP: 'Trusteeship',  // Manual intervention needed
  NOT_FOUND: 'NotFound'
};

/**
 * XFlows Status Codes
 * Source: bridge.md section 6.1
 */
export const XFLOWS_STATUS_CODES = {
  SUCCESS: 1,
  FAILED: 2,
  PROCESSING: 3,
  REFUND_TO_SOURCE: 4,
  REFUND_TO_WANCHAIN: 5,
  TRUSTEESHIP: 6,
  RISK_TRANSACTION: 7  // AML risk, refunded
};

/**
 * Get chain name from chain type
 */
export function getChainName(chainType: string): string {
  const names: Record<string, string> = {
    VET: 'VeChain',
    ETH: 'Ethereum',
    BNB: 'BNB Smart Chain',
    MATIC: 'Polygon',
    ARETH: 'Arbitrum',
    OETH: 'Optimism',
    BASEETH: 'Base',
    AVAX: 'Avalanche',
    WAN: 'Wanchain',
    FTM: 'Fantom',
    ADA: 'Cardano',
    DOT: 'Polkadot',
    SOL: 'Solana',
    BTC: 'Bitcoin'
  };
  return names[chainType] || chainType;
}


