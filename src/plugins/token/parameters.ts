import { z } from 'zod';
import { createToolParameters } from '../../utils/createToolParameters.js';

/**
 * Parameters for transferring VET
 */
export class TransferVETParameters extends createToolParameters(
  z.object({
    to: z.string().describe('Recipient VeChain address (0x...)'),
    amount: z.string().describe('Amount of VET to send (in VET, not wei)'),
    memo: z.string().optional().describe('Optional transaction memo'),
  })
) {}

/**
 * Parameters for transferring VIP-180 tokens
 */
export class TransferTokenParameters extends createToolParameters(
  z.object({
    tokenSymbol: z.string().describe('Token symbol (VTHO, B3TR, etc.)'),
    tokenAddress: z.string().describe('Token contract address'),
    to: z.string().describe('Recipient VeChain address'),
    amount: z.string().describe('Amount of tokens to send'),
  })
) {}

/**
 * Parameters for checking token balance
 */
export class GetTokenBalanceParameters extends createToolParameters(
  z.object({
    address: z.string().describe('Address to check balance for'),
    tokenSymbol: z.string().describe('Token symbol (VET, VTHO, B3TR)'),
  })
) {}

/**
 * Parameters for getting token info
 */
export class GetTokenInfoParameters extends createToolParameters(
  z.object({
    tokenSymbol: z.string().describe('Token symbol (e.g., VET, VTHO, B3TR)'),
  })
) {}


