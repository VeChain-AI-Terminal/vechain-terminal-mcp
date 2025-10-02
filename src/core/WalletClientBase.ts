import { z } from 'zod';
import type { Chain, Balance, Signature, TransactionClause, TransactionResult } from './types.js';
import { type ToolBase, createTool } from './ToolBase.js';

/**
 * Abstract base class for wallet clients
 * All blockchain-specific wallet implementations must extend this
 * Based on GOAT SDK's WalletClientBase pattern
 */
export abstract class WalletClientBase {
  /**
   * Get the wallet address
   */
  abstract getAddress(): string;

  /**
   * Get the chain this wallet is connected to
   */
  abstract getChain(): Chain;

  /**
   * Sign a message with the wallet
   */
  abstract signMessage(message: string): Promise<Signature>;

  /**
   * Get balance for an address
   */
  abstract balanceOf(address: string): Promise<Balance>;

  /**
   * Send a transaction (blockchain-specific implementation)
   */
  abstract sendTransaction(clauses: TransactionClause[]): Promise<TransactionResult>;

  /**
   * Get core tools that every wallet has
   * These tools are automatically available for any wallet
   */
  getCoreTools(): ToolBase[] {
    return [
      createTool(
        {
          name: 'get_wallet_address',
          description: 'Get the connected wallet address',
          parameters: z.object({}),
        },
        () => ({
          address: this.getAddress(),
          chain: this.getChain().name,
        })
      ),
      createTool(
        {
          name: 'get_chain_info',
          description: 'Get information about the connected blockchain',
          parameters: z.object({}),
        },
        () => this.getChain()
      ),
      createTool(
        {
          name: 'get_balance',
          description: 'Get VET and VTHO balance for an address',
          parameters: z.object({
            address: z.string().describe('VeChain address to check balance'),
          }),
        },
        (params) => this.balanceOf(params.address)
      ),
      createTool(
        {
          name: 'sign_message',
          description: 'Sign a message with the wallet',
          parameters: z.object({
            message: z.string().describe('Message to sign'),
          }),
        },
        (params) => this.signMessage(params.message)
      ),
    ];
  }
}


