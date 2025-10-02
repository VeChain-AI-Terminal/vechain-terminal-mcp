/**
 * VeChainStats API Client
 * Official VeChain blockchain explorer API
 * 
 * Documentation: https://docs.vechainstats.com
 * Swagger: https://swagger.vechainstats.com
 * 
 * This API provides comprehensive blockchain data including:
 * - Account info, balances, transaction history
 * - Token prices, supply, holder lists
 * - DEX trades and liquidity
 * - NFT information
 * - Network statistics
 */

const VECHAINSTATS_API_URL = 'https://api.vechainstats.com/v2';

export interface VeChainStatsConfig {
  apiKey?: string; // Optional API key for higher rate limits
}

export class VeChainStatsClient {
  private apiKey?: string;
  private baseUrl: string;

  constructor(config?: VeChainStatsConfig) {
    this.apiKey = config?.apiKey || process.env.VECHAINSTATS_API_KEY;
    this.baseUrl = VECHAINSTATS_API_URL;
  }

  async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    try {
      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        throw new Error(`VeChainStats API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (!data.status?.success) {
        throw new Error(`VeChainStats API error: ${data.status?.message || 'Unknown error'}`);
      }

      return data as T;
    } catch (error) {
      console.error(`VeChainStats API request failed:`, error);
      throw error;
    }
  }

  // ==================== ACCOUNT ENDPOINTS ====================

  /**
   * Get account information including balances
   */
  async getAccountInfo(address: string) {
    return this.request<any>('/account/info', { address });
  }

  /**
   * Get VET and VTHO balances
   */
  async getVETVTHO(address: string) {
    return this.request<any>('/account/vet-vtho', { address });
  }

  /**
   * Get historic VET/VTHO balance at a specific block or date
   */
  async getHistoricBalance(address: string, blockOrDate: string | number) {
    const params = typeof blockOrDate === 'number' 
      ? { address, block: blockOrDate }
      : { address, date: blockOrDate };
    return this.request<any>('/account/historic-vet-vtho', params);
  }

  /**
   * Get incoming transactions
   */
  async getTransactionsIn(address: string, page = 1, sort: 'asc' | 'desc' = 'desc') {
    return this.request<any>('/account/txin', { address, page, sort });
  }

  /**
   * Get outgoing transactions
   */
  async getTransactionsOut(address: string, page = 1, sort: 'asc' | 'desc' = 'desc') {
    return this.request<any>('/account/txout', { address, page, sort });
  }

  /**
   * Get token transfers for an address
   */
  async getTokenTransfers(address: string, page = 1, tokenType: string = 'vip180', sort: 'asc' | 'desc' = 'desc') {
    return this.request<any>('/account/token-transfers', { address, page, token_type: tokenType, sort });
  }

  /**
   * Get NFT transfers for an address
   */
  async getNFTTransfers(address: string, page = 1, sort: 'asc' | 'desc' = 'desc') {
    return this.request<any>('/account/nft-transfers', { address, page, sort });
  }

  /**
   * Get DEX trades for an address (across all VeChain DEXes)
   */
  async getDEXTrades(address: string, page = 1, sort: 'asc' | 'desc' = 'desc') {
    return this.request<any>('/account/dex-trades', { address, page, sort });
  }

  // ==================== TOKEN ENDPOINTS ====================

  /**
   * Get comprehensive list of all tokens on VeChain
   */
  async getTokenList() {
    return this.request<any>('/token/list');
  }

  /**
   * Get token information
   */
  async getTokenInfo(token: string) {
    return this.request<any>('/token/info', { token });
  }

  /**
   * Get current token price in USD
   */
  async getTokenPrice(token: string) {
    return this.request<any>('/token/price', { token });
  }

  /**
   * Get prices for all tokens
   */
  async getTokenPriceList() {
    return this.request<any>('/token/price-list');
  }

  /**
   * Get token supply
   */
  async getTokenSupply(token: string) {
    return this.request<any>('/token/supply', { token });
  }

  /**
   * Get token holder list
   */
  async getTokenHolders(token: string, page = 1, threshold?: number) {
    return this.request<any>('/token/holder-list', { token, page, threshold });
  }

  // ==================== TRANSACTION ENDPOINTS ====================

  /**
   * Get transaction status and info
   */
  async getTransactionStatus(txid: string) {
    return this.request<any>('/transaction/status', { txid });
  }

  /**
   * Get detailed transaction information
   */
  async getTransactionInfo(txid: string) {
    return this.request<any>('/transaction/info', { txid });
  }

  // ==================== BLOCK ENDPOINTS ====================

  /**
   * Get current block height
   */
  async getBlockHeight() {
    return this.request<any>('/block/height');
  }

  /**
   * Get block information
   */
  async getBlockInfo(blocknum: number) {
    return this.request<any>('/block/info', { blocknum });
  }

  /**
   * Get block by timestamp
   */
  async getBlockByTimestamp(blockts: number) {
    return this.request<any>('/block/blocktime', { blockts });
  }

  /**
   * Get block by reference (8-byte hex string)
   */
  async getBlockByReference(blockref: string) {
    return this.request<any>('/block/blockref', { blockref });
  }

  // ==================== CONTRACT ENDPOINTS ====================

  /**
   * Get contract information
   */
  async getContractInfo(address: string) {
    return this.request<any>('/contract/info', { address });
  }

  /**
   * Get contract code
   */
  async getContractCode(contract: string) {
    return this.request<any>('/contract/code', { contract });
  }

  // ==================== NFT ENDPOINTS ====================

  /**
   * Get NFT token list
   */
  async getNFTList() {
    return this.request<any>('/nft/list');
  }

  /**
   * Get NFT information
   */
  async getNFTInfo(id: string) {
    return this.request<any>('/nft/info', { id });
  }

  /**
   * Get NFT holder list
   */
  async getNFTHolders(id: string, page = 1, threshold?: number) {
    return this.request<any>('/nft/holder-list', { id, page, threshold });
  }

  // ==================== NETWORK ENDPOINTS ====================

  /**
   * Get network totals
   */
  async getNetworkTotals() {
    return this.request<any>('/network/totals');
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    return this.request<any>('/network/stats');
  }

  /**
   * Get gas statistics
   */
  async getGasStats(timeframe?: string) {
    const params = timeframe ? { timeframe } : {};
    return this.request<any>('/network/gas-stats', params);
  }

  /**
   * Get mempool information
   */
  async getMempool(expanded = true) {
    return this.request<any>('/network/mempool', { expanded });
  }

  // ==================== CARBON ENDPOINTS ====================

  /**
   * Get carbon emissions for an address
   */
  async getAddressEmissions(address: string) {
    return this.request<any>('/carbon/co2e-address', { address });
  }

  /**
   * Get carbon emissions for a transaction
   */
  async getTransactionEmissions(txid: string) {
    return this.request<any>('/carbon/co2e-transaction', { txid });
  }

  /**
   * Get network carbon emissions
   */
  async getNetworkEmissions() {
    return this.request<any>('/carbon/co2e-network');
  }
}

// Export singleton instance
export const vechainStatsClient = new VeChainStatsClient();

