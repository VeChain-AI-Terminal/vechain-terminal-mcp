import { Tool } from '../../core/Tool.decorator.js';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { Clause, Address, VET, ABIContract } from '@vechain/sdk-core';
import {
  TransferVETParameters,
  TransferTokenParameters,
  GetTokenBalanceParameters,
  GetTokenInfoParameters,
} from './parameters.js';
import { getToken } from '../../registry/tokens.js';
import { ERC20_ABI } from '../../registry/erc20-abi.js';
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

    try {
      const token = getToken(tokenSymbol || 'UNKNOWN', walletClient.getNetwork());
      const decimals = token.decimals;
      const amountInBaseUnits = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

      // ✅ MODERN APPROACH: Use ABIContract and Clause.callFunction
      const erc20Abi = new ABIContract(ERC20_ABI as any);
      const transferFunction = erc20Abi.getFunction('transfer');
      
      const clause = Clause.callFunction(
        Address.of(tokenAddress),
        transferFunction,
        [Address.of(to), amountInBaseUnits]
      );

      // Send transaction using modern VeChain SDK
      const { hash } = await walletClient.sendTransaction([{
        to: clause.to!,
        value: clause.value!,
        data: clause.data!
      }]);

      return {
        success: true,
        txHash: hash,
        txId: hash,
        from: walletClient.getAddress(),
        to,
        amount,
        tokenAddress,
        tokenSymbol: token.symbol,
        explorer: walletClient.getExplorerUrl(hash),
        message: `Successfully transferred ${amount} ${token.symbol} to ${to}`,
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

    // ✅ MODERN APPROACH: Use executeCall for token balance queries
    try {
      const token = getToken(tokenSymbol, walletClient.getNetwork());
      const erc20Abi = new ABIContract(ERC20_ABI as any);
      const balanceOfFunction = erc20Abi.getFunction('balanceOf');
      
      const result = await walletClient.executeCall(
        token.address!,
        balanceOfFunction,
        [Address.of(address)]
      );

      const balanceWei = result.result.plain as bigint;
      const balance = (Number(balanceWei) / Math.pow(10, token.decimals)).toString();

      return {
        address,
        token: token.symbol,
        balance: balance,
        balanceWei: balanceWei.toString(),
        decimals: token.decimals,
        contractAddress: token.address
      };
    } catch (error: any) {
      return {
        address,
        token: tokenSymbol,
        error: `Failed to get balance: ${error.message}`,
        suggestion: 'Use vechainstats_get_vip180_balance for reliable token balance data'
      };
    }
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


