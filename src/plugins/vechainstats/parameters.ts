import { z } from 'zod';
import { createToolParameters } from '../../utils/createToolParameters.js';

/**
 * VeChainStats API Tool Parameters
 * Based on official Postman collection
 */

// ==================== ACCOUNT PARAMETERS ====================

export class GetAccountInfoParameters extends createToolParameters(
  z.object({
    address: z.string().describe('VeChain address'),
    expanded: z.boolean().optional().describe('Include expanded details'),
  })
) {}

export class GetAccountStatsParameters extends createToolParameters(
  z.object({
    date: z.string().describe('Date in YYYY-MM-DD format'),
    expanded: z.boolean().optional().describe('Include expanded details'),
  })
) {}

export class GetAccountTransactionsParameters extends createToolParameters(
  z.object({
    address: z.string().describe('VeChain address'),
    page: z.number().optional().default(1).describe('Page number'),
    sort: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort order'),
  })
) {}

export class GetVIP180BalanceParameters extends createToolParameters(
  z.object({
    address: z.string().describe('Wallet address'),
    contract: z.string().optional().describe('Token contract address for custom tokens'),
    expanded: z.boolean().optional().describe('Include expanded details'),
  })
) {}

export class GetTokenTransfersParameters extends createToolParameters(
  z.object({
    address: z.string().describe('VeChain address'),
    tokenType: z.enum(['vet', 'vtho', 'vip180']).optional().describe('Token type to filter'),
    page: z.number().optional().default(1),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
  })
) {}

export class GetDEXTradesParameters extends createToolParameters(
  z.object({
    address: z.string().describe('VeChain address'),
    page: z.number().optional().default(1),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
  })
) {}

export class GetHistoricBalanceParameters extends createToolParameters(
  z.object({
    address: z.string().describe('VeChain address'),
    date: z.string().optional().describe('Date in YYYY-MM-DD format'),
    blocknum: z.number().optional().describe('Block number'),
  })
) {}

// ==================== TOKEN PARAMETERS ====================

export class GetTokenInfoParameters extends createToolParameters(
  z.object({
    token: z.string().describe('Token symbol or contract address'),
    expanded: z.boolean().optional().describe('Include expanded details'),
  })
) {}

export class GetTokenPriceParameters extends createToolParameters(
  z.object({
    token: z.string().describe('Token symbol (e.g., vtho, b3tr)'),
    expanded: z.boolean().optional(),
  })
) {}

export class GetTokenHoldersParameters extends createToolParameters(
  z.object({
    token: z.string().describe('Token symbol or contract address'),
    threshold: z.number().optional().describe('Minimum token balance threshold'),
    page: z.number().optional().default(1),
  })
) {}

export class NoParameters extends createToolParameters(z.object({})) {}

// ==================== TRANSACTION PARAMETERS ====================

export class GetTransactionParameters extends createToolParameters(
  z.object({
    txid: z.string().describe('Transaction ID (hash)'),
  })
) {}

// ==================== BLOCK PARAMETERS ====================

export class GetBlockInfoParameters extends createToolParameters(
  z.object({
    blocknum: z.number().describe('Block number'),
  })
) {}

export class GetBlockByTimestampParameters extends createToolParameters(
  z.object({
    blockts: z.number().describe('Block timestamp (Unix timestamp)'),
  })
) {}

export class GetBlockByReferenceParameters extends createToolParameters(
  z.object({
    blockref: z.string().describe('Block reference (8-byte hex string)'),
  })
) {}

export class GetBlockStatsParameters extends createToolParameters(
  z.object({
    date: z.string().optional().describe('Date in YYYY-MM-DD format'),
    expanded: z.boolean().optional(),
  })
) {}

// ==================== CONTRACT PARAMETERS ====================

export class GetContractInfoParameters extends createToolParameters(
  z.object({
    address: z.string().describe('Contract address'),
    expanded: z.boolean().optional(),
  })
) {}

// ==================== NFT PARAMETERS ====================

export class GetNFTInfoParameters extends createToolParameters(
  z.object({
    id: z.string().describe('NFT collection ID or slug'),
    expanded: z.boolean().optional(),
  })
) {}

export class GetNFTHoldersParameters extends createToolParameters(
  z.object({
    id: z.string().describe('NFT collection ID'),
    threshold: z.number().optional().describe('Minimum NFT count'),
    page: z.number().optional().default(1),
  })
) {}

export class GetVIP181Parameters extends createToolParameters(
  z.object({
    address: z.string().describe('Wallet address'),
    id: z.string().optional().describe('NFT collection ID'),
    expanded: z.boolean().optional(),
  })
) {}

// ==================== CARBON PARAMETERS ====================

export class GetCarbonEmissionsParameters extends createToolParameters(
  z.object({
    address: z.string().optional().describe('Address for emissions'),
    txid: z.string().optional().describe('Transaction ID for emissions'),
    blocknum: z.number().optional().describe('Block number for emissions'),
    timeframe: z.string().optional().describe('Timeframe: YYYY or YYYY-MM or YYYY-MM-DD'),
  })
) {}

// ==================== NETWORK PARAMETERS ====================

export class GetNetworkStatsParameters extends createToolParameters(
  z.object({
    timeframe: z.string().optional().describe('Timeframe: YYYY or YYYY-MM or YYYY-MM-DD'),
  })
) {}

