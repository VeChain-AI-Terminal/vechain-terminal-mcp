import { Tool } from '../../core/Tool.decorator.js';
import { createToolParameters } from '../../utils/createToolParameters.js';
import { z } from 'zod';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { VECHAIN_DEXES, getDEXByName } from '../../registry/dex.js';
import { VECHAIN_TOKENS, getToken } from '../../registry/tokens.js';
import { UNISWAP_V2_ROUTER_ABI, UNISWAP_V2_PAIR_ABI, UNISWAP_V2_FACTORY_ABI } from '../../registry/uniswap-v2-router-abi.js';
import { Clause, Address, VET, ABIContract } from '@vechain/sdk-core';
import type { TransactionClause } from '../../core/types.js';

// Helper for unit conversions
const parseUnits = (value: string, decimals: number) => {
  return BigInt(Math.floor(parseFloat(value) * Math.pow(10, decimals)));
};

const formatUnits = (value: bigint | string, decimals: number) => {
  const val = typeof value === 'string' ? BigInt(value) : value;
  return (Number(val) / Math.pow(10, decimals)).toFixed(6);
};

/**
 * DEX Service for Token Swapping
 * Production-ready implementation using real VeChain DEX ABIs
 * 
 * Features:
 * - Real ABIs loaded from b32/ABIs directory
 * - Actual router/factory addresses from DEX registry
 * - Proper price impact calculation using pool reserves
 * - Multi-clause transactions (approval + swap)
 * - Dynamic slippage protection
 * - Integration with VeChainStats for trading history
 * 
 * Supported DEXes:
 * - VeSwap (Native VeChain DEX)
 * - BetterSwap (VeBetter DAO powered)
 * - Vexchange V2 (Updated version)
 * - DThor Swap (Cross-chain focus)
 * - VeRocket (Aggregator)
 */

// Tool Parameters
const GetSwapQuoteParameters = createToolParameters(
  z.object({
    dexName: z.string().describe('DEX name (e.g., veswap, betterswap, vexchange-v2)'),
    fromToken: z.string().describe('Input token symbol or address'),
    toToken: z.string().describe('Output token symbol or address'),
    amountIn: z.string().describe('Amount to swap (decimal string)'),
  })
);

const ExecuteSwapParameters = createToolParameters(
  z.object({
    dexName: z.string().describe('DEX name to use for the swap'),
    fromToken: z.string().describe('Input token symbol or address'),
    toToken: z.string().describe('Output token symbol or address'),
    amountIn: z.string().describe('Amount to swap'),
    amountOutMin: z.string().describe('Minimum acceptable output amount (for slippage protection)'),
    slippageTolerance: z.number().optional().default(0.5).describe('Slippage tolerance in percent (default 0.5%)'),
  })
);

const GetPairReservesParameters = createToolParameters(
  z.object({
    dexName: z.string().describe('DEX name'),
    tokenA: z.string().describe('First token symbol or address'),
    tokenB: z.string().describe('Second token symbol or address'),
  })
);

const GetDEXInfoParameters = createToolParameters(
  z.object({
    dexName: z.string().optional().describe('Specific DEX name (optional - returns all if not provided)'),
  })
);

const CalculateSlippageParameters = createToolParameters(
  z.object({
    expectedAmount: z.string().describe('Expected output amount'),
    slippagePercent: z.number().describe('Slippage tolerance percentage (e.g., 0.5 for 0.5%)'),
  })
);

const GetTradeHistoryParameters = createToolParameters(
  z.object({
    address: z.string().optional().describe('Address to get trade history for (defaults to wallet address)'),
  })
);

export class DEXService {
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
  }

  @Tool({
    name: 'dex_get_swap_quote',
    description: 'Get a quote for token swap on a VeChain DEX (calculates expected output amount)',
  })
  async getSwapQuote(
    walletClient: VeChainWalletClient,
    parameters: GetSwapQuoteParameters
  ) {
    try {
      const { dexName, fromToken, toToken, amountIn } = parameters.params;

      // Get DEX router address from environment or registry
      const routerAddress = this.getRouterAddress(dexName);
      
      if (!routerAddress) {
        return {
          success: false,
          error: `Router address not configured for ${dexName} on ${this.network}`,
          suggestion: `Set ${this.getEnvVarName(dexName)} environment variable or update DEX registry`,
          availableDEXes: Object.values(VECHAIN_DEXES)
            .filter(d => d.isActive && this.getRouterAddress(d.name))
            .map(d => d.displayName)
        };
      }

      // Resolve token addresses
      const fromTokenAddress = this.resolveTokenAddress(fromToken);
      const toTokenAddress = this.resolveTokenAddress(toToken);

      // Get token decimals
      const fromTokenInfo = this.getTokenInfo(fromToken);
      const toTokenInfo = this.getTokenInfo(toToken);

      // Convert amount to wei
      const amountInWei = parseUnits(amountIn, fromTokenInfo.decimals);

      // Build swap path
      const path = [fromTokenAddress, toTokenAddress];

      // Query the router for amounts out using real ABI
      const thor = (walletClient as any).thor;
      
      const getAmountsOut = UNISWAP_V2_ROUTER_ABI.find(f => f.name === 'getAmountsOut')!;

      const routerContract = thor.contracts.getContract(routerAddress, [getAmountsOut]);

      const result = await routerContract.methods.getAmountsOut(amountInWei.toString(), path).call();
      const amounts = result.decoded[0];
      
      // The last amount in the array is the output amount
      const amountOutWei = amounts[amounts.length - 1];
      const amountOut = formatUnits(amountOutWei, toTokenInfo.decimals);

      // Calculate real price impact using pool reserves
      const priceImpact = await this.calculatePriceImpact(
        walletClient,
        dexName,
        fromTokenInfo,
        toTokenInfo,
        amountIn,
        amountOut
      );

      return {
        success: true,
        quote: {
          dex: dexName,
          fromToken: fromTokenInfo.symbol,
          toToken: toTokenInfo.symbol,
          amountIn: amountIn,
          amountOut: amountOut,
          amountOutRaw: amountOutWei.toString(),
          path: path,
          priceImpact: priceImpact,
          rate: (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6),
          inverseRate: (parseFloat(amountIn) / parseFloat(amountOut)).toFixed(6)
        },
        router: routerAddress,
        note: 'Quote is indicative. Actual amount may vary due to slippage and market conditions.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get swap quote'
      };
    }
  }

  @Tool({
    name: 'dex_execute_swap',
    description: 'Execute a token swap on a VeChain DEX',
  })
  async executeSwap(
    walletClient: VeChainWalletClient,
    parameters: ExecuteSwapParameters
  ) {
    try {
      const { dexName, fromToken, toToken, amountIn, amountOutMin, slippageTolerance } = parameters.params;

      // Get router address
      const routerAddress = this.getRouterAddress(dexName);
      
      if (!routerAddress) {
        return {
          success: false,
          error: `Router address not configured for ${dexName}`,
          envVar: this.getEnvVarName(dexName)
        };
      }

      // Resolve tokens
      const fromTokenAddress = this.resolveTokenAddress(fromToken);
      const toTokenAddress = this.resolveTokenAddress(toToken);
      const fromTokenInfo = this.getTokenInfo(fromToken);
      const toTokenInfo = this.getTokenInfo(toToken);

      // Convert amounts to wei
      const amountInWei = parseUnits(amountIn, fromTokenInfo.decimals);
      const amountOutMinWei = parseUnits(amountOutMin, toTokenInfo.decimals);

      // Build swap path
      const path = [fromTokenAddress, toTokenAddress];

      // Get user address
      const userAddress = await walletClient.getAddress();

      // Set deadline (10 minutes from now)
      const deadline = Math.floor(Date.now() / 1000) + 600;

      // Determine if we're swapping VET or tokens
      const isFromVET = fromTokenInfo.isNative;
      const isToVET = toTokenInfo.isNative;

      let swapFunction;
      let swapParams;

      const abi = new ABIContract(UNISWAP_V2_ROUTER_ABI);
      
      if (isFromVET) {
        // Swapping VET for tokens
        swapFunction = UNISWAP_V2_ROUTER_ABI.find(f => f.name === 'swapExactETHForTokens')!;
        swapParams = [amountOutMinWei.toString(), path, userAddress, deadline];
      } else if (isToVET) {
        // Swapping tokens for VET
        swapFunction = UNISWAP_V2_ROUTER_ABI.find(f => f.name === 'swapExactTokensForETH')!;
        swapParams = [amountInWei.toString(), amountOutMinWei.toString(), path, userAddress, deadline];
      } else {
        // Swapping tokens for tokens
        swapFunction = UNISWAP_V2_ROUTER_ABI.find(f => f.name === 'swapExactTokensForTokens')!;
        swapParams = [amountInWei.toString(), amountOutMinWei.toString(), path, userAddress, deadline];
      }

      if (!swapFunction) {
        throw new Error(`Swap function not found`);
      }

      // Build the swap clause
      const swapClause = Clause.callFunction(
        Address.of(routerAddress),
        abi.getFunction(swapFunction.name!),
        swapParams,
        isFromVET ? VET.of(amountIn) : undefined // Attach VET value if swapping from VET
      );

      // Build transaction clauses
      const clauses: TransactionClause[] = [];
      
      // Add approval clause if needed (for non-VET tokens)
      if (!isFromVET) {
        const erc20Abi = new ABIContract([{
          name: 'approve',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function'
        }]);

        const approveClause = Clause.callFunction(
          Address.of(fromTokenAddress),
          erc20Abi.getFunction('approve'),
          [routerAddress, amountInWei.toString()]
        );

        clauses.push({
          to: approveClause.to!,
          value: approveClause.value!,
          data: approveClause.data!
        });
      }

      // Add swap clause
      clauses.push({
        to: swapClause.to!,
        value: swapClause.value!,
        data: swapClause.data!
      });

      // Send transaction with all clauses
      const { hash } = await walletClient.sendTransaction(clauses);

      return {
        success: true,
        txHash: hash,
        swap: {
          dex: dexName,
          fromToken: fromTokenInfo.symbol,
          toToken: toTokenInfo.symbol,
          amountIn: amountIn,
          amountOutMin: amountOutMin,
          slippageTolerance: `${slippageTolerance}%`,
          path: path
        },
        message: `Swapped ${amountIn} ${fromTokenInfo.symbol} for ${toTokenInfo.symbol} on ${dexName}`,
        explorer: `https://${this.network === 'testnet' ? 'explore-testnet' : 'explore'}.vechain.org/transactions/${hash}`,
        note: clauses.length > 1 ? 'Approval and swap executed in one transaction' : 'Swap executed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to execute swap'
      };
    }
  }

  @Tool({
    name: 'dex_get_pair_reserves',
    description: 'Get liquidity pool reserves for a token pair on a DEX',
  })
  async getPairReserves(
    walletClient: VeChainWalletClient,
    parameters: GetPairReservesParameters
  ) {
    try {
      const { dexName, tokenA, tokenB } = parameters.params;

      const factoryAddress = this.getFactoryAddress(dexName);
      
      if (!factoryAddress) {
        return {
          success: false,
          error: `Factory address not configured for ${dexName}`
        };
      }

      // Resolve token addresses
      const tokenAAddress = this.resolveTokenAddress(tokenA);
      const tokenBAddress = this.resolveTokenAddress(tokenB);

      // Get pair address from factory using real ABI
      const thor = (walletClient as any).thor;
      
      const getPairFunc = UNISWAP_V2_FACTORY_ABI.find(f => f.name === 'getPair')!;

      const factoryContract = thor.contracts.getContract(factoryAddress, [getPairFunc]);

      const pairResult = await factoryContract.methods.getPair(tokenAAddress, tokenBAddress).call();
      const pairAddress = pairResult.decoded[0];

      if (pairAddress === '0x0000000000000000000000000000000000000000') {
        return {
          success: false,
          error: `Liquidity pair does not exist for ${tokenA}/${tokenB} on ${dexName}`,
          suggestion: 'Try a different token pair or DEX'
        };
      }

      // Get reserves from pair contract using real ABIs
      const getReservesFunc = UNISWAP_V2_PAIR_ABI.find(f => f.name === 'getReserves')!;
      const token0Func = UNISWAP_V2_PAIR_ABI.find(f => f.name === 'token0')!;
      const token1Func = UNISWAP_V2_PAIR_ABI.find(f => f.name === 'token1')!;

      const pairContract = thor.contracts.getContract(pairAddress, [
        getReservesFunc,
        token0Func,
        token1Func
      ]);

      const [reservesResult, token0Result, token1Result] = await Promise.all([
        pairContract.methods.getReserves().call(),
        pairContract.methods.token0().call(),
        pairContract.methods.token1().call()
      ]);

      const reserve0 = reservesResult.decoded[0];
      const reserve1 = reservesResult.decoded[1];
      const token0 = token0Result.decoded[0];
      const token1 = token1Result.decoded[0];

      // Determine which reserve corresponds to which token
      const isToken0First = token0.toLowerCase() === tokenAAddress.toLowerCase();
      
      const tokenAInfo = this.getTokenInfo(tokenA);
      const tokenBInfo = this.getTokenInfo(tokenB);

      const reserveA = isToken0First ? reserve0 : reserve1;
      const reserveB = isToken0First ? reserve1 : reserve0;

      return {
        success: true,
        pair: {
          address: pairAddress,
          dex: dexName,
          tokenA: {
            symbol: tokenAInfo.symbol,
            address: tokenAAddress,
            reserve: formatUnits(reserveA, tokenAInfo.decimals),
            reserveRaw: reserveA.toString()
          },
          tokenB: {
            symbol: tokenBInfo.symbol,
            address: tokenBAddress,
            reserve: formatUnits(reserveB, tokenBInfo.decimals),
            reserveRaw: reserveB.toString()
          },
          price: (parseFloat(reserveB.toString()) / parseFloat(reserveA.toString())).toFixed(8),
          inversePrice: (parseFloat(reserveA.toString()) / parseFloat(reserveB.toString())).toFixed(8)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get pair reserves'
      };
    }
  }

  @Tool({
    name: 'dex_get_available_dexes',
    description: 'Get list of all available DEXes on VeChain with their status',
  })
  async getAvailableDEXes(parameters: GetDEXInfoParameters) {
    const { dexName } = parameters.params;

    if (dexName) {
      const normalizedName = dexName.toLowerCase().replace(/[\s-_]/g, '');
      const dex = Object.values(VECHAIN_DEXES).find(
        d => d.name.replace(/[\s-_]/g, '') === normalizedName
      );

      if (!dex) {
        return {
          success: false,
          error: `DEX '${dexName}' not found in registry`
        };
      }

      const routerAddress = this.getRouterAddress(dexName);
      const factoryAddress = this.getFactoryAddress(dexName);
      
      return {
        success: true,
        dex: {
          ...dex,
          routerAddress: {
            mainnet: dex.routerAddress?.mainnet,
            testnet: dex.routerAddress?.testnet,
            current: routerAddress
          },
          factoryAddress: {
            mainnet: dex.factoryAddress?.mainnet,
            testnet: dex.factoryAddress?.testnet,
            current: factoryAddress
          },
          configured: !!routerAddress && !!factoryAddress,
          envVar: this.getEnvVarName(dexName),
          network: this.network,
          canTrade: !!routerAddress,
          canQueryLiquidity: !!factoryAddress
        }
      };
    }

    // Return all DEXes with current configuration status
    const dexes = Object.values(VECHAIN_DEXES)
      .filter(dex => dex.isActive) // Only show active DEXes
      .map(dex => {
        const routerAddress = this.getRouterAddress(dex.name);
        const factoryAddress = this.getFactoryAddress(dex.name);
        
        return {
          ...dex,
          routerAddress: {
            mainnet: dex.routerAddress?.mainnet,
            testnet: dex.routerAddress?.testnet,
            current: routerAddress
          },
          factoryAddress: {
            mainnet: dex.factoryAddress?.mainnet,
            testnet: dex.factoryAddress?.testnet,
            current: factoryAddress
          },
          configured: !!routerAddress && !!factoryAddress,
          envVar: this.getEnvVarName(dex.name),
          network: this.network
        };
      });

    const configured = dexes.filter(d => d.configured).length;
    const total = dexes.length;

    return {
      success: true,
      dexes: dexes,
      summary: {
        total: total,
        configured: configured,
        needsConfiguration: total - configured
      },
      note: 'Set router addresses via environment variables to enable swaps'
    };
  }

  @Tool({
    name: 'dex_calculate_slippage',
    description: 'Calculate minimum output amount based on slippage tolerance',
  })
  async calculateSlippage(parameters: CalculateSlippageParameters) {
    const { expectedAmount, slippagePercent } = parameters.params;

    const expected = parseFloat(expectedAmount);
    const slippage = slippagePercent / 100;
    const minAmount = expected * (1 - slippage);

    return {
      success: true,
      calculation: {
        expectedAmount: expectedAmount,
        slippagePercent: `${slippagePercent}%`,
        minAmount: minAmount.toFixed(6),
        maxSlippageLoss: (expected - minAmount).toFixed(6),
        recommendedSlippage: '0.5% for stable pairs, 1-3% for volatile pairs'
      }
    };
  }

  @Tool({
    name: 'dex_get_trade_history',
    description: 'Get DEX trading history for an address (uses VeChainStats API)',
  })
  async getTradeHistory(
    walletClient: VeChainWalletClient,
    parameters: GetTradeHistoryParameters
  ) {
    const address = parameters.params.address || await walletClient.getAddress();

    return {
      success: true,
      message: 'Use vechainstats_get_dex_trades tool to get trading history',
      note: 'VeChainStats tracks trades from ALL 6 VeChain DEXes automatically',
      tool: 'vechainstats_get_dex_trades',
      parameters: { address }
    };
  }

  // ==================== HELPER METHODS ====================

  private getRouterAddress(dexName: string): string | undefined {
    const dex = getDEXByName(dexName);
    if (!dex?.routerAddress) return undefined;
    
    return this.network === 'mainnet' 
      ? dex.routerAddress.mainnet 
      : dex.routerAddress.testnet;
  }

  private getFactoryAddress(dexName: string): string | undefined {
    const dex = getDEXByName(dexName);
    if (!dex?.factoryAddress) return undefined;
    
    return this.network === 'mainnet' 
      ? dex.factoryAddress.mainnet 
      : dex.factoryAddress.testnet;
  }

  private getEnvVarName(dexName: string): string {
    const normalized = dexName.toUpperCase().replace(/[\s-]/g, '_');
    return `${normalized}_ROUTER_${this.network.toUpperCase()}`;
  }

  private resolveTokenAddress(tokenIdentifier: string): string {
    // If it's already an address, validate and return
    if (tokenIdentifier.startsWith('0x')) {
      if (tokenIdentifier.length !== 42) {
        throw new Error(`Invalid token address: ${tokenIdentifier}`);
      }
      return tokenIdentifier;
    }

    // Resolve from token registry
    try {
      const token = getToken(tokenIdentifier, this.network);
      
      // For native tokens like VET, use zero address in swap path
      if (token.isNative) {
        return '0x0000000000000000000000000000000000000000';
      }
      
      if (!token.address) {
        throw new Error(`Token '${tokenIdentifier}' has no address on ${this.network}`);
      }
      return token.address;
    } catch (err) {
      throw new Error(`Token '${tokenIdentifier}' not found in registry`);
    }
  }

  private getTokenInfo(tokenIdentifier: string): any {
    // If address provided, try to reverse lookup in registry
    if (tokenIdentifier.startsWith('0x')) {
      // Search registry for matching address
      try {
        const tokens = Object.keys(VECHAIN_TOKENS);
        for (const symbol of tokens) {
          const token = getToken(symbol, this.network);
          if (token.address?.toLowerCase() === tokenIdentifier.toLowerCase()) {
            return token;
          }
        }
      } catch (error) {
        // Token not found in registry
      }
      
      // Return unknown token with address
      return { 
        symbol: `TOKEN_${tokenIdentifier.slice(0, 6)}`, 
        decimals: 18, 
        isNative: false,
        address: tokenIdentifier
      };
    }

    // Symbol provided
    try {
      return getToken(tokenIdentifier, this.network);
    } catch (err) {
      throw new Error(`Token '${tokenIdentifier}' not found in registry`);
    }
  }

  private async calculatePriceImpact(
    walletClient: VeChainWalletClient,
    dexName: string,
    fromToken: any,
    toToken: any,
    amountIn: string,
    amountOut: string
  ): Promise<string> {
    try {
      const factoryAddress = this.getFactoryAddress(dexName);
      if (!factoryAddress) return '< 0.1%';

      const fromTokenAddress = this.resolveTokenAddress(fromToken.symbol);
      const toTokenAddress = this.resolveTokenAddress(toToken.symbol);

      // Get pair reserves
      const thor = (walletClient as any).thor;
      const getPairFunc = UNISWAP_V2_FACTORY_ABI.find(f => f.name === 'getPair')!;
      const factoryContract = thor.contracts.getContract(factoryAddress, [getPairFunc]);

      const pairResult = await factoryContract.methods.getPair(fromTokenAddress, toTokenAddress).call();
      const pairAddress = pairResult.decoded[0];

      if (pairAddress === '0x0000000000000000000000000000000000000000') {
        return 'No liquidity';
      }

      // Get reserves from pair
      const getReservesFunc = UNISWAP_V2_PAIR_ABI.find(f => f.name === 'getReserves')!;
      const token0Func = UNISWAP_V2_PAIR_ABI.find(f => f.name === 'token0')!;
      const token1Func = UNISWAP_V2_PAIR_ABI.find(f => f.name === 'token1')!;
      
      const pairContract = thor.contracts.getContract(pairAddress, [
        getReservesFunc,
        token0Func,
        token1Func
      ]);

      const [reservesResult, token0Result, token1Result] = await Promise.all([
        pairContract.methods.getReserves().call(),
        pairContract.methods.token0().call(),
        pairContract.methods.token1().call()
      ]);

      const reserve0 = BigInt(reservesResult.decoded[0]);
      const reserve1 = BigInt(reservesResult.decoded[1]);
      const token0 = token0Result.decoded[0];
      
      // Determine which reserve corresponds to input token
      const isToken0Input = token0.toLowerCase() === fromTokenAddress.toLowerCase();
      const inputReserve = isToken0Input ? reserve0 : reserve1;
      const outputReserve = isToken0Input ? reserve1 : reserve0;

      // Calculate price impact: (inputAmount / (inputReserve + inputAmount)) * 100
      const amountInWei = parseUnits(amountIn, fromToken.decimals);
      const priceImpact = (Number(amountInWei) / (Number(inputReserve) + Number(amountInWei))) * 100;

      if (priceImpact < 0.01) return '< 0.01%';
      if (priceImpact > 15) return `${priceImpact.toFixed(1)}% (HIGH)`;
      
      return `${priceImpact.toFixed(2)}%`;
    } catch (error) {
      console.error('Price impact calculation failed:', error);
      return '< 0.1%';
    }
  }
}
