import type { z } from 'zod';

/**
 * Chain type definition
 */
export type Chain = {
  type: 'vechain';
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

/**
 * Balance information
 */
export type Balance = {
  vet: string;
  vtho: string;
  raw: {
    vet: string;
    vtho: string;
  };
};

/**
 * Signature result
 */
export type Signature = {
  signature: string;
};

/**
 * Token information
 */
export type Token = {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  isNative?: boolean;
};

/**
 * Transaction clause (VeChain specific)
 */
export type TransactionClause = {
  to: string;
  value: string | bigint;
  data: string;
};

/**
 * Transaction result
 */
export type TransactionResult = {
  hash: string;
  id: string;
};

/**
 * Tool configuration
 */
export type ToolConfig<TParameters extends z.ZodSchema = z.ZodSchema> = {
  name: string;
  description: string;
  parameters: TParameters;
};


