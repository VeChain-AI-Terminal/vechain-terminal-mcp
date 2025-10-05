import { Tool } from '../../core/Tool.decorator.js';
import { createToolParameters } from '../../utils/createToolParameters.js';
import { z } from 'zod';

/**
 * WanBridge & XFlows API Client for Cross-Chain Operations
 * Based on official Wanchain documentation
 * 
 * Features:
 * - WanBridge: Direct cross-chain transfers (25+ chains)
 * - XFlows: Cross-chain swaps with DEX integration
 * - Full VeChain support with testnet gateway: 0xa1Dd5cBF77e1E78C307ecbD7c6AEea90FC71499e
 */

const WANBRIDGE_API = {
  mainnet: 'https://bridge-api.wanchain.org/api',
  testnet: 'https://bridge-api.wanchain.org/api/testnet'
};

const XFLOWS_API = 'https://xflows.wanchain.org/api/v3';

// Chain types from official documentation (section 2.2.1)
const CHAIN_TYPES = {
  BTC: 2147483648,
  LTC: 2147483650,
  DOGE: 2147483651,
  ETH: 2147483708,
  XRP: 2147483792,
  EOS: 2147483842,
  TRX: 2147483843,
  DOT: 2147484002,
  XDC: 2147484198,
  OETH: 2147484262,      // Optimism
  BNB: 2147484362,       // BSC
  ASTR: 2147484458,      // Astar
  VET: 2147484466,       // VeChain - KEY!
  MATIC: 2147484614,     // Polygon
  TLOS: 2147484625,      // Telos
  OKT: 2147484644,
  FTM: 2147484655,       // Fantom
  ADA: 2147485463,       // Cardano
  AVAX: 2147492648,      // Avalanche
  NRG: 2147493445,       // Energi
  WAN: 2153201998,       // Wanchain
  BROCK: 2154655314,     // Bitrock
  MOVR: 1073741825,      // Moonriver
  ARETH: 1073741826,     // Arbitrum
  GLMR: 1073741828,      // Moonbeam
  FX: 1073741830,
  GTH: 1073741833,       // Gather
  METIS: 1073741834,
  SGB: 1073741836,       // Songbird
  ZKETH: 1073741837,     // zkSync Era
  ZEN: 1073741839,       // Horizen EON
  VC: 1073741840,        // VinuChain
  BASEETH: 1073741841,   // Base
  LINEAETH: 1073741842   // Linea
};

// VeChain Gateway Address (from bridge.md section 3.2, line 3944)
const VECHAIN_GATEWAY = '0xa1Dd5cBF77e1E78C307ecbD7c6AEea90FC71499e';

// Tool Parameters
const GetTokenPairsParameters = createToolParameters(
  z.object({
    fromChain: z.string().optional().describe('Filter by source chain type (e.g., VET, ETH, BNB)'),
    toChain: z.string().optional().describe('Filter by destination chain type'),
  })
);

const GetQuotaAndFeeParameters = createToolParameters(
  z.object({
    fromChainType: z.string().describe('Source chain type (e.g., VET, ETH, BNB)'),
    toChainType: z.string().describe('Destination chain type'),
    symbol: z.string().describe('Token symbol (e.g., USDT, USDC, VTHO)'),
    tokenPairID: z.string().optional().describe('Token pair ID (optional, for fee query)'),
  })
);

const CreateBridgeTransactionParameters = createToolParameters(
  z.object({
    fromChain: z.string().describe('Source chain type (e.g., VET, ETH, BNB)'),
    toChain: z.string().describe('Destination chain type'),
    fromToken: z.string().describe('Token address on source chain (use 0x0000000000000000000000000000000000000000 for native coins)'),
    toToken: z.string().describe('Token address on destination chain'),
    fromAccount: z.string().describe('Sender address'),
    toAccount: z.string().describe('Recipient address'),
    amount: z.string().describe('Amount to bridge (decimal string, e.g., "100.5")'),
    partner: z.string().optional().default('vechain-ai-app').describe('Partner identifier for tracking'),
  })
);

const CheckBridgeStatusParameters = createToolParameters(
  z.object({
    txHash: z.string().describe('Transaction hash from source or destination chain'),
  })
);

const GetSmgIDParameters = createToolParameters(
  z.object({}) // No parameters needed
);

const XFlowsQuoteParameters = createToolParameters(
  z.object({
    fromChainId: z.number().describe('Source chain ID (e.g., 100010 for VeChain testnet)'),
    toChainId: z.number().describe('Destination chain ID'),
    fromTokenAddress: z.string().describe('Source token contract address'),
    toTokenAddress: z.string().describe('Destination token contract address'),
    fromAddress: z.string().describe('Sender wallet address'),
    toAddress: z.string().describe('Recipient wallet address'),
    fromAmount: z.string().describe('Amount to swap/bridge'),
    bridge: z.enum(['wanbridge', 'quix']).optional().default('wanbridge').describe('Bridge to use'),
    dex: z.enum(['wanchain', 'rubic']).optional().describe('DEX to use for swaps'),
    slippage: z.number().optional().default(0.01).describe('Slippage tolerance (e.g., 0.01 for 1%)'),
  })
);

const XFlowsStatusParameters = createToolParameters(
  z.object({
    hash: z.string().describe('Transaction hash to check status for'),
  })
);

const XFlowsTokensParameters = createToolParameters(
  z.object({
    chainId: z.number().optional().describe('Chain ID to filter tokens (optional)'),
  })
);

export class BridgeService {
  private wanbridgeApi: string;
  private xflowsApi: string;
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
    this.wanbridgeApi = WANBRIDGE_API[network];
    this.xflowsApi = XFLOWS_API;
  }

  // Method to switch networks dynamically
  setNetwork(network: 'mainnet' | 'testnet') {
    this.network = network;
    this.wanbridgeApi = WANBRIDGE_API[network];
  }

  getNetwork(): 'mainnet' | 'testnet' {
    return this.network;
  }

  // ==================== WANBRIDGE BASIC APIs ====================

  @Tool({
    name: 'bridge_get_token_pairs',
    description: 'Get all available cross-chain token pairs (300+ pairs across 25+ chains)',
  })
  async getTokenPairs(parameters: GetTokenPairsParameters) {
    try {
      const response = await fetch(`${this.wanbridgeApi}/tokenPairs`);
      const data = await response.json() as any;

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch token pairs');
      }

      let pairs = data.data || [];

      // Filter for specific chains if requested
      if (parameters.params.fromChain || parameters.params.toChain) {
        pairs = pairs.filter((pair: any) => {
          const fromMatch = !parameters.params.fromChain || 
            pair.fromChain?.chainType === parameters.params.fromChain;
          const toMatch = !parameters.params.toChain || 
            pair.toChain?.chainType === parameters.params.toChain;
          return fromMatch && toMatch;
        });
      }

      return {
        success: true,
        pairs: pairs.slice(0, 50).map((pair: any) => ({ // Limit to 50 for readability
          tokenPairID: pair.tokenPairID,
          symbol: pair.symbol,
          fromChain: {
            type: pair.fromChain?.chainType,
            name: pair.fromChain?.chainName,
            chainId: pair.fromChain?.chainId
          },
          toChain: {
            type: pair.toChain?.chainType,
            name: pair.toChain?.chainName,
            chainId: pair.toChain?.chainId
          },
          fromToken: {
            address: pair.fromToken?.address,
            symbol: pair.fromToken?.symbol,
            decimals: pair.fromToken?.decimals
          },
          toToken: {
            address: pair.toToken?.address,
            symbol: pair.toToken?.symbol,
            decimals: pair.toToken?.decimals
          }
        })),
        total: pairs.length,
        note: 'Showing first 50 pairs. Use fromChain/toChain filters to narrow results.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch token pairs'
      };
    }
  }

  @Tool({
    name: 'bridge_get_quota_and_fee',
    description: 'Get bridge quota (min/max limits) and fees in one call (section 1.2.3)',
  })
  async getQuotaAndFee(parameters: GetQuotaAndFeeParameters) {
    try {
      const { fromChainType, toChainType, symbol, tokenPairID } = parameters.params;

      const params = new URLSearchParams({
        fromChainType,
        toChainType,
        symbol,
        ...(tokenPairID && { tokenPairID })
      });

      const response = await fetch(`${this.wanbridgeApi}/quotaAndFee?${params}`);
      const result = await response.json() as any;

      if (!result.success) {
        throw new Error(result.error || 'Failed to get quota and fee');
      }

      const data = result.data;

      return {
        success: true,
        symbol: data.symbol,
        quota: {
          min: data.minQuota,
          max: data.maxQuota,
          unit: data.symbol
        },
        fees: {
          network: {
            value: data.networkFee.value,
            isPercent: data.networkFee.isPercent,
            description: 'Charged in native token of the blockchain'
          },
          operation: {
            value: data.operationFee.value,
            isPercent: data.operationFee.isPercent,
            minLimit: data.operationFee.minFeeLimit,
            maxLimit: data.operationFee.maxFeeLimit,
            description: 'Charged in the token being transferred'
          }
        },
        route: `${fromChainType} → ${toChainType}`,
        note: 'Amount must be within quota range'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get quota and fee'
      };
    }
  }

  @Tool({
    name: 'bridge_create_transaction',
    description: 'Create a cross-chain bridge transaction using WanBridge API (section 2.2). Returns transaction data ready for wallet signing.',
  })
  async createBridgeTransaction(parameters: CreateBridgeTransactionParameters) {
    try {
      const requestBody = {
        fromChain: parameters.params.fromChain,
        toChain: parameters.params.toChain,
        fromToken: parameters.params.fromToken,
        toToken: parameters.params.toToken,
        fromAccount: parameters.params.fromAccount,
        toAccount: parameters.params.toAccount,
        amount: parameters.params.amount,
        partner: parameters.params.partner || 'vechain-ai-app'
      };

      const response = await fetch(`${this.wanbridgeApi}/createTx2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json() as any;

      if (!result.success) {
        throw new Error(result.error || 'Bridge transaction creation failed');
      }

      const txData = result.data.tx;
      const approveCheck = result.data.approveCheck;

      // VeChain-specific response (section 2.2.6, lines 1710-1836)
      if (parameters.params.fromChain === 'VET') {
        return {
          success: true,
          platform: 'VeChain',
          gatewayAddress: VECHAIN_GATEWAY,
          transaction: {
            // VeChain uses clauses, not standard tx format
            to: txData.to,
            value: txData.value || '0x0',
            data: txData.data,
          },
          approveRequired: approveCheck ? {
            token: approveCheck.token,
            spender: approveCheck.to,
            amount: approveCheck.amount,
            note: 'Execute approval first using VeChain wallet'
          } : null,
          receiveAmount: result.data.receiveAmount,
          feeAndQuota: result.data.feeAndQuota,
          txDataDetail: result.data.txDataDetail,
          instructions: [
            approveCheck ? '1. First approve token spending (use VeWorld or wallet)' : null,
            approveCheck ? '2. Wait for approval confirmation' : null,
            `${approveCheck ? '3' : '1'}. Sign and send the bridge transaction`,
            `${approveCheck ? '4' : '2'}. Monitor status using the transaction hash`
          ].filter(Boolean),
          note: 'Use DAppKit or VeWorld to sign this transaction. The gateway contract handles the cross-chain logic.'
        };
      }

      // Standard EVM chains
      return {
        success: true,
        platform: 'EVM',
        transaction: {
          from: requestBody.fromAccount,
          to: txData.to,
          value: txData.value || '0x0',
          data: txData.data,
          chainId: result.data.chainId
        },
        approveRequired: approveCheck ? {
          token: approveCheck.token,
          spender: approveCheck.to,
          amount: approveCheck.amount
        } : null,
        receiveAmount: result.data.receiveAmount,
        feeAndQuota: result.data.feeAndQuota,
        txDataDetail: result.data.txDataDetail,
        message: `Bridge ${parameters.params.amount} from ${parameters.params.fromChain} to ${parameters.params.toChain}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create bridge transaction'
      };
    }
  }

  @Tool({
    name: 'bridge_check_status',
    description: 'Check cross-chain bridge transaction status (section 4.1). Accepts hash from either source or destination chain.',
  })
  async checkBridgeStatus(parameters: CheckBridgeStatusParameters) {
    try {
      const response = await fetch(`${this.wanbridgeApi}/status/${parameters.params.txHash}`);
      const result = await response.json() as any;

      if (!result.success && !result.data) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }

      const status = result.data.status;
      
      return {
        success: true,
        status: {
          txHash: parameters.params.txHash,
          status: status,
          statusCode: this.getStatusCode(status),
          tokenPair: result.data.tokenPair,
          lockHash: result.data.lockHash,
          redeemHash: result.data.redeemHash,
          sendAmount: result.data.sendAmount,
          receiveAmount: result.data.receiveAmount,
          timestamp: result.data.timestamp,
          isComplete: status === 'Success',
          isFailed: status === 'Failed',
          isPending: status === 'Processing',
          needsIntervention: status === 'Trusteeship',
          isRefunded: status === 'Refund',
          message: this.getStatusMessage(status),
          nextSteps: this.getNextSteps(status)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check bridge status'
      };
    }
  }

  @Tool({
    name: 'bridge_get_smg_id',
    description: 'Get current Storeman Group ID (smgID) for cross-chain operations (section 1.4)',
  })
  async getSmgID(parameters: GetSmgIDParameters) {
    try {
      const response = await fetch(`${this.wanbridgeApi}/smgID`);
      const result = await response.json() as any;

      if (!result.success) {
        throw new Error('Failed to fetch smgID');
      }

      return {
        success: true,
        smgID: result.data,
        note: 'smgID is updated on the 9th of each month',
        verifyUrl: `https://www.wanscan.org/osmgroupinfo/${result.data}`,
        recommendation: 'Cache this value and update monthly on the 9th'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get smgID'
      };
    }
  }

  @Tool({
    name: 'bridge_get_token_pairs_hash',
    description: 'Get hash of token pairs data to check if it changed (for caching optimization)',
  })
  async getTokenPairsHash(parameters: GetSmgIDParameters) {
    try {
      const response = await fetch(`${this.wanbridgeApi}/tokenPairsHash`);
      const result = await response.json() as any;

      if (!result.success) {
        throw new Error('Failed to fetch token pairs hash');
      }

      return {
        success: true,
        hash: result.data,
        note: 'Compare with cached hash. If unchanged, reuse cached tokenPairs data.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get token pairs hash'
      };
    }
  }

  // ==================== XFLOWS CROSS-CHAIN SWAP APIs ====================

  @Tool({
    name: 'xflows_get_quote',
    description: 'Get quote for cross-chain swap with DEX integration (XFlows API, section 4)',
  })
  async getXFlowsQuote(parameters: XFlowsQuoteParameters) {
    try {
      const response = await fetch(`${this.xflowsApi}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters.params)
      });

      const result = await response.json() as any;

      if (!result.success) {
        throw new Error(result.data?.error || 'Failed to get XFlows quote');
      }

      const data = result.data;

      return {
        success: true,
        quote: {
          amountOut: data.amountOut,
          amountOutRaw: data.amountOutRaw,
          amountOutMin: data.amountOutMin,
          amountOutMinRaw: data.amountOutMinRaw,
          priceImpact: data.priceImpact,
          slippage: data.slippage,
          workMode: this.getWorkModeDescription(data.workMode),
          bridge: data.bridge,
          dex: data.dex,
          approvalAddress: data.approvalAddress
        },
        fees: {
          native: data.nativeFees || [],
          token: data.tokenFees || []
        },
        extraData: data.extraData,
        note: 'XFlows supports 6 work modes: direct bridge, QuiX, bridge+swap, and more'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get XFlows quote'
      };
    }
  }

  @Tool({
    name: 'xflows_build_transaction',
    description: 'Build cross-chain swap transaction using XFlows (section 5)',
  })
  async buildXFlowsTransaction(parameters: XFlowsQuoteParameters) {
    try {
      const response = await fetch(`${this.xflowsApi}/buildTx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters.params)
      });

      const result = await response.json() as any;

      if (!result.success) {
        throw new Error(result.data?.error || 'Failed to build XFlows transaction');
      }

      return {
        success: true,
        chainId: result.data.chainId,
        transaction: result.data.tx,
        note: 'Sign this transaction with your wallet. For VeChain, use VeWorld or DAppKit.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to build XFlows transaction'
      };
    }
  }

  @Tool({
    name: 'xflows_check_status',
    description: 'Check XFlows cross-chain swap status (section 6)',
  })
  async checkXFlowsStatus(parameters: XFlowsStatusParameters) {
    try {
      const requestBody = {
        hash: parameters.params.hash
      };

      const response = await fetch(`${this.xflowsApi}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json() as any;

      if (!result.success) {
        throw new Error('Failed to check XFlows status');
      }

      const data = result.data;

      return {
        success: true,
        status: {
          statusCode: data.statusCode,
          statusMsg: data.statusMsg,
          workMode: this.getWorkModeDescription(data.workMode),
          sourceHash: data.sourceHash,
          destinationHash: data.destinationHash,
          swapHash: data.swapHash,
          refundHash: data.refundHash,
          receiveAmount: data.receiveAmount,
          receiveAmountRaw: data.receiveAmountRaw,
          timestamp: data.timestamp,
          isComplete: data.statusCode === 1,
          isFailed: data.statusCode === 2,
          isPending: data.statusCode === 3
        },
        extraData: data.extraData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check XFlows status'
      };
    }
  }

  @Tool({
    name: 'xflows_get_supported_chains',
    description: 'Get all chains supported by XFlows (section 3.1)',
  })
  async getXFlowsSupportedChains(parameters: GetSmgIDParameters) {
    try {
      const response = await fetch(`${this.xflowsApi}/supported/chains`);
      const result = await response.json() as any;

      if (!result.success) {
        throw new Error('Failed to fetch supported chains');
      }

      return {
        success: true,
        chains: result.data.map((chain: any) => ({
          chainId: chain.chainId,
          name: chain.chainName,
          symbol: chain.symbol,
          decimals: chain.decimals,
          chainType: chain.chainType,
          logo: chain.logo
        })),
        total: result.data.length
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get supported chains'
      };
    }
  }

  @Tool({
    name: 'xflows_get_supported_tokens',
    description: 'Get all tokens supported by XFlows for a specific chain (section 3.2)',
  })
  async getXFlowsSupportedTokens(parameters: XFlowsTokensParameters) {
    try {
      const chainId = parameters.params.chainId;
      const url = chainId ? 
        `${this.xflowsApi}/supported/tokens?chainId=${chainId}` :
        `${this.xflowsApi}/supported/tokens`;

      const response = await fetch(url);
      const result = await response.json() as any;

      if (!result.success) {
        throw new Error('Failed to fetch supported tokens');
      }

      return {
        success: true,
        tokens: result.data,
        note: chainId ? 
          `Tokens for chain ${chainId}` :
          'Tokens grouped by chain. Use chainId parameter to filter.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get supported tokens'
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private getStatusCode(status: string): number {
    const codes: Record<string, number> = {
      'Success': 1,
      'Failed': 2,
      'Processing': 3,
      'Refund': 4,
      'Trusteeship': 6
    };
    return codes[status] || 0;
  }

  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      'Success': '✅ Bridge transfer completed successfully',
      'Failed': '❌ Bridge transfer failed',
      'Processing': '⏳ Bridge validators processing your transfer',
      'Refund': '💸 Transfer was refunded (check refund transaction)',
      'Trusteeship': '⚠️ Manual intervention required - contact support@wanchain.org',
      'NotFound': '🔍 Transaction not found in bridge system yet'
    };
    return messages[status] || '❓ Unknown status';
  }

  private getNextSteps(status: string): string[] {
    const steps: Record<string, string[]> = {
      'Success': [
        'Transfer complete!',
        'Check destination wallet for tokens'
      ],
      'Failed': [
        'Transaction failed',
        'Check error details or contact support'
      ],
      'Processing': [
        'Wait for bridge validators to process',
        'Check status again in 5-10 minutes',
        'Typical completion time: 10-30 minutes'
      ],
      'Refund': [
        'Original tokens returned to source wallet',
        'Check refundHash for refund transaction'
      ],
      'Trusteeship': [
        'Manual intervention needed',
        'Contact techsupport@wanchain.org',
        'Provide transaction hash and details'
      ]
    };
    return steps[status] || ['Check status again later'];
  }

  private getWorkModeDescription(mode: number): string {
    const modes: Record<number, string> = {
      1: 'Direct WanBridge transfer',
      2: 'QuiX rapid cross-chain',
      3: 'Bridge then swap on destination',
      4: 'Bridge to Wanchain, swap, then bridge to destination',
      5: 'DEX swap only (same chain)',
      6: 'Swap then bridge to destination'
    };
    return modes[mode] || `Work mode ${mode}`;
  }
}
