import { Tool } from '../../core/Tool.decorator.js';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { Clause, Address, VET } from '@vechain/sdk-core';
import {
  TransferVETParameters,
  TransferTokenParameters,
  GetTokenBalanceParameters,
  GetTokenInfoParameters,
} from './parameters.js';
import { getToken } from '../../registry/tokens.js';
import type { TransactionClause } from '../../core/types.js';

/**
 * Token operations service
 * Provides tools for VET and VIP-180 token operations
 */
export class TokenService {
  @Tool({
    name: 'transfer_vet',
    description: 'Transfer VET (native VeChain tokens) to another address',
  })
  async transferVET(walletClient: VeChainWalletClient, parameters: TransferVETParameters) {
    const amountInWei = BigInt(Math.floor(parseFloat(parameters.params.amount) * 1e18));

    // Build VET transfer clause
    const clause: TransactionClause = {
      to: parameters.params.to,
      value: `0x${amountInWei.toString(16)}`,
      data: '0x'
    };

    // Send transaction
    const result = await walletClient.sendTransaction([clause]);

    return {
      success: true,
      txHash: result.hash,
      txId: result.id,
      from: walletClient.getAddress(),
      to: parameters.params.to,
      amount: parameters.params.amount,
      token: 'VET',
      explorer: walletClient.getExplorerUrl(result.hash),
      message: `Successfully transferred ${parameters.params.amount} VET to ${parameters.params.to}`,
    };
  }

  @Tool({
    name: 'transfer_token',
    description: 'Transfer VIP-180 tokens (like VTHO, B3TR) to another address',
  })
  async transferToken(walletClient: VeChainWalletClient, parameters: TransferTokenParameters) {
    const { tokenAddress, to, amount, tokenSymbol } = parameters.params;

    // Use wallet client's method for token info
    try {
      const token = getToken(tokenSymbol || 'UNKNOWN', walletClient.getNetwork());
      const decimals = token.decimals;
      const amountInBaseUnits = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

      // Build ERC20 transfer data
      // transfer(address,uint256) = 0xa9059cbb
      const methodId = '0xa9059cbb';
      const addressPadded = to.slice(2).padStart(64, '0');
      const amountPadded = amountInBaseUnits.toString(16).padStart(64, '0');
      const data = methodId + addressPadded + amountPadded;

      const clause: TransactionClause = {
        to: tokenAddress,
        value: '0x0',
        data: data,
      };

      // Send transaction
      const result = await walletClient.sendTransaction([clause]);

      return {
        success: true,
        txHash: result.hash,
        txId: result.id,
        from: walletClient.getAddress(),
        to,
        amount,
        tokenAddress,
        explorer: walletClient.getExplorerUrl(result.hash),
        message: `Successfully transferred ${amount} tokens to ${to}`,
      };
    } catch (error: any) {
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  }

  @Tool({
    name: 'get_balance',
    description: 'Get VET and VTHO balance for an address',
  })
  async getBalance(walletClient: VeChainWalletClient, parameters: GetTokenBalanceParameters) {
    const { address, tokenSymbol } = parameters.params;

    // If checking VET balance, use wallet client's balanceOf
    if (tokenSymbol.toUpperCase() === 'VET') {
      const balance = await walletClient.balanceOf(address);
      return {
        address,
        token: 'VET',
        balance: balance.vet,
        vtho: balance.vtho,
      };
    }

    // Use token registry
    const token = getToken(tokenSymbol, walletClient.getNetwork());
    
    // For now, return placeholder - full implementation would query contract
    return {
      address,
      token: token.symbol,
      message: 'Use vechainstats_get_vip180_balance for token balances',
      suggestion: 'VeChainStats provides accurate token balance data'
    };
  }

  @Tool({
    name: 'get_token_info',
    description: 'Get information about a token by its symbol (VET, VTHO, B3TR, etc)',
  })
  async getTokenInfo(walletClient: VeChainWalletClient, parameters: GetTokenInfoParameters) {
    const { tokenSymbol } = parameters.params;
    const network = walletClient.getNetwork();

    try {
      const token = getToken(tokenSymbol, network);
      return {
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        address: token.address || 'native',
        isNative: token.isNative || false,
        network,
      };
    } catch (error) {
      throw new Error(`Token ${tokenSymbol} not found. Available tokens: VET, VTHO, B3TR`);
    }
  }
}


