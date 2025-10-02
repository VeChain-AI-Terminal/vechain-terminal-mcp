import { Tool } from '../../core/Tool.decorator.js';
import { VeChainStatsClient } from '../../registry/vechainstats-client.js';
import {
  GetAccountInfoParameters,
  GetAccountStatsParameters,
  GetAccountTransactionsParameters,
  GetTokenTransfersParameters,
  GetDEXTradesParameters,
  GetHistoricBalanceParameters,
  GetVIP180BalanceParameters,
  GetTokenInfoParameters,
  GetTokenPriceParameters,
  GetTokenHoldersParameters,
  NoParameters,
  GetTransactionParameters,
  GetBlockInfoParameters,
  GetBlockByTimestampParameters,
  GetBlockStatsParameters,
  GetContractInfoParameters,
  GetNFTInfoParameters,
  GetNFTHoldersParameters,
  GetVIP181Parameters,
  GetCarbonEmissionsParameters,
  GetNetworkStatsParameters,
} from './parameters.js';

/**
 * VeChainStats Service
 * Provides comprehensive blockchain analytics and data
 * Similar to GOAT's CoinGecko and Dexscreener plugins
 * 
 * Powered by vechainstats.com APIs
 */
export class VeChainStatsService {
  private api: VeChainStatsClient;

  constructor() {
    this.api = new VeChainStatsClient();
  }

  // ==================== ACCOUNT TOOLS ====================

  @Tool({
    name: 'vechainstats_get_account_info',
    description: 'Get comprehensive account information including balances, transaction count, and more',
  })
  async getAccountInfo(parameters: GetAccountInfoParameters) {
    return this.api.getAccountInfo(parameters.params.address);
  }

  @Tool({
    name: 'vechainstats_get_account_daily_stats',
    description: 'Get daily statistics for accounts (new accounts, active accounts, etc.)',
  })
  async getAccountDailyStats(parameters: GetAccountStatsParameters) {
    return this.api.request('/account/stats', {
      date: parameters.params.date,
      expanded: parameters.params.expanded,
    });
  }

  @Tool({
    name: 'vechainstats_get_transactions_in',
    description: 'Get incoming transactions for an address with pagination',
  })
  async getTransactionsIn(parameters: GetAccountTransactionsParameters) {
    return this.api.getTransactionsIn(
      parameters.params.address,
      parameters.params.page,
      20
    );
  }

  @Tool({
    name: 'vechainstats_get_transactions_out',
    description: 'Get outgoing transactions for an address with pagination',
  })
  async getTransactionsOut(parameters: GetAccountTransactionsParameters) {
    return this.api.getTransactionsOut(
      parameters.params.address,
      parameters.params.page,
      20
    );
  }

  @Tool({
    name: 'vechainstats_get_token_transfers',
    description: 'Get token transfer history for an address (VET, VTHO, or VIP-180 tokens)',
  })
  async getTokenTransfers(parameters: GetTokenTransfersParameters) {
    return this.api.getTokenTransfers(
      parameters.params.address,
      parameters.params.page,
      20
    );
  }

  @Tool({
    name: 'vechainstats_get_nft_transfers',
    description: 'Get NFT transfer history for an address',
  })
  async getNFTTransfers(parameters: GetAccountTransactionsParameters) {
    return this.api.getNFTTransfers(
      parameters.params.address,
      parameters.params.page,
      20
    );
  }

  @Tool({
    name: 'vechainstats_get_dex_trades',
    description: 'Get DEX trading history for an address across all VeChain DEXes (VeSwap, Vexchange, etc.)',
  })
  async getDEXTrades(parameters: GetDEXTradesParameters) {
    return this.api.request('/account/dex-trades', {
      address: parameters.params.address,
      page: parameters.params.page,
      sort: parameters.params.sort,
    });
  }

  @Tool({
    name: 'vechainstats_get_historic_balance',
    description: 'Get historical VET/VTHO balance at a specific date or block',
  })
  async getHistoricBalance(parameters: GetHistoricBalanceParameters) {
    return this.api.getHistoricBalance(
      parameters.params.address,
      parameters.params.date || parameters.params.blocknum!
    );
  }

  @Tool({
    name: 'vechainstats_get_vip180_balance',
    description: 'Get VIP-180 token balance for a specific address and token contract',
  })
  async getVIP180Balance(parameters: GetVIP180BalanceParameters) {
    if (parameters.params.contract) {
      // Custom token contract
      return this.api.request('/token/vip180-custom', {
        address: parameters.params.address,
        contract: parameters.params.contract,
      });
    }
    // Standard VIP-180 tokens
    return this.api.request('/token/vip180', {
      address: parameters.params.address,
      expanded: parameters.params.expanded,
    });
  }

  @Tool({
    name: 'vechainstats_get_account_vtho_info',
    description: 'Get detailed VTHO information for an account (generation rate, accumulated, etc.)',
  })
  async getAccountVTHOInfo(parameters: GetAccountInfoParameters) {
    return this.api.request('/account/vtho-info', {
      address: parameters.params.address,
    });
  }

  // ==================== TOKEN TOOLS ====================

  @Tool({
    name: 'vechainstats_get_token_list',
    description: 'Get comprehensive list of all tokens on VeChain with metadata',
  })
  async getTokenList(parameters: NoParameters) {
    return this.api.getTokenList();
  }

  @Tool({
    name: 'vechainstats_get_token_info',
    description: 'Get detailed token information including supply, holders, and metadata',
  })
  async getTokenInfo(parameters: GetTokenInfoParameters) {
    return this.api.getTokenInfo(parameters.params.token);
  }

  @Tool({
    name: 'vechainstats_get_token_price',
    description: 'Get current token price in USD with 24h change and volume',
  })
  async getTokenPrice(parameters: GetTokenPriceParameters) {
    return this.api.getTokenPrice(parameters.params.token);
  }

  @Tool({
    name: 'vechainstats_get_all_token_prices',
    description: 'Get prices for all VeChain tokens in one call',
  })
  async getAllTokenPrices(parameters: NoParameters) {
    return this.api.getTokenPriceList();
  }

  @Tool({
    name: 'vechainstats_get_token_supply',
    description: 'Get token supply information (total, circulating)',
  })
  async getTokenSupply(parameters: GetTokenInfoParameters) {
    return this.api.getTokenSupply(parameters.params.token);
  }

  @Tool({
    name: 'vechainstats_get_token_holders',
    description: 'Get list of token holders with balances',
  })
  async getTokenHolders(parameters: GetTokenHoldersParameters) {
    return this.api.getTokenHolders(
      parameters.params.token,
      parameters.params.page,
      parameters.params.threshold
    );
  }

  // ==================== TRANSACTION TOOLS ====================

  @Tool({
    name: 'vechainstats_get_transaction_status',
    description: 'Get transaction status and confirmation info',
  })
  async getTransactionStatus(parameters: GetTransactionParameters) {
    return this.api.getTransactionStatus(parameters.params.txid);
  }

  @Tool({
    name: 'vechainstats_get_transaction_info',
    description: 'Get detailed transaction information including clauses, events, and gas used',
  })
  async getTransactionInfo(parameters: GetTransactionParameters) {
    return this.api.getTransactionInfo(parameters.params.txid);
  }

  // ==================== BLOCK TOOLS ====================

  @Tool({
    name: 'vechainstats_get_current_block',
    description: 'Get the current block height of VeChain',
  })
  async getCurrentBlock(parameters: NoParameters) {
    return this.api.getBlockHeight();
  }

  @Tool({
    name: 'vechainstats_get_block_info',
    description: 'Get detailed information about a specific block',
  })
  async getBlockInfo(parameters: GetBlockInfoParameters) {
    return this.api.getBlockInfo(parameters.params.blocknum);
  }

  @Tool({
    name: 'vechainstats_get_block_by_timestamp',
    description: 'Find block by timestamp',
  })
  async getBlockByTimestamp(parameters: GetBlockByTimestampParameters) {
    return this.api.getBlockByTimestamp(parameters.params.blockts);
  }

  @Tool({
    name: 'vechainstats_get_block_by_reference',
    description: 'Get block by block reference (8-byte hex string)',
  })
  async getBlockByReference(parameters: GetBlockInfoParameters) {
    return this.api.request('/block/blockref', {
      blockref: parameters.params.blocknum, // Reusing parameter but for blockref
    });
  }

  @Tool({
    name: 'vechainstats_get_block_daily_stats', 
    description: 'Get daily block statistics (gas used, transaction count, etc.)',
  })
  async getBlockDailyStats(parameters: GetBlockStatsParameters) {
    return this.api.request('/block/stats', {
      date: parameters.params.date,
      expanded: parameters.params.expanded,
    });
  }

  // ==================== CONTRACT TOOLS ====================

  @Tool({
    name: 'vechainstats_get_contract_info',
    description: 'Get contract information including verification status and metadata',
  })
  async getContractInfo(parameters: GetContractInfoParameters) {
    return this.api.getContractInfo(parameters.params.address);
  }

  @Tool({
    name: 'vechainstats_get_contract_code',
    description: 'Get verified contract source code',
  })
  async getContractCode(parameters: GetContractInfoParameters) {
    return this.api.getContractCode(parameters.params.address);
  }

  // ==================== NFT TOOLS ====================

  @Tool({
    name: 'vechainstats_get_nft_list',
    description: 'Get list of all NFT collections on VeChain',
  })
  async getNFTList(parameters: NoParameters) {
    return this.api.getNFTList();
  }

  @Tool({
    name: 'vechainstats_get_nft_info',
    description: 'Get NFT collection information including floor price, volume, and holder count',
  })
  async getNFTInfo(parameters: GetNFTInfoParameters) {
    return this.api.getNFTInfo(parameters.params.id);
  }

  @Tool({
    name: 'vechainstats_get_nft_holders',
    description: 'Get list of NFT holders for a collection',
  })
  async getNFTHolders(parameters: GetNFTHoldersParameters) {
    return this.api.getNFTHolders(
      parameters.params.id,
      parameters.params.page,
      parameters.params.threshold
    );
  }

  // ==================== NETWORK TOOLS ====================

  @Tool({
    name: 'vechainstats_get_network_totals',
    description: 'Get network-wide totals (accounts, transactions, contracts, blocks)',
  })
  async getNetworkTotals(parameters: NoParameters) {
    return this.api.getNetworkTotals();
  }

  @Tool({
    name: 'vechainstats_get_network_stats',
    description: 'Get network statistics for a specific timeframe',
  })
  async getNetworkStats(parameters: GetNetworkStatsParameters) {
    return this.api.getNetworkStats();
  }

  @Tool({
    name: 'vechainstats_get_gas_stats',
    description: 'Get gas price statistics and trends',
  })
  async getGasStats(parameters: NoParameters) {
    return this.api.getGasStats();
  }

  @Tool({
    name: 'vechainstats_get_mempool',
    description: 'Get current mempool information (pending transactions)',
  })
  async getMempool(parameters: NoParameters) {
    return this.api.getMempool();
  }

  @Tool({
    name: 'vechainstats_get_authority_nodes',
    description: 'Get list of authority nodes (validators) on VeChain',
  })
  async getAuthorityNodes(parameters: NoParameters) {
    return this.api.request('/network/authority-nodes', { expanded: true });
  }

  @Tool({
    name: 'vechainstats_get_xnode_list',
    description: 'Get list of X-Nodes (economic nodes) on VeChain',
  })
  async getXNodeList(parameters: NoParameters) {
    return this.api.request('/network/xnode-list', { expanded: true });
  }

  @Tool({
    name: 'vechainstats_get_node_token_stats',
    description: 'Get VeChain node token statistics',
  })
  async getNodeTokenStats(parameters: NoParameters) {
    return this.api.request('/network/node-token-stats');
  }

  // ==================== CARBON TOOLS ====================

  @Tool({
    name: 'vechainstats_get_address_emissions',
    description: 'Get carbon emissions (CO2e) for an address - perfect for VeBetter sustainability tracking!',
  })
  async getAddressEmissions(parameters: GetCarbonEmissionsParameters) {
    if (!parameters.params.address) {
      throw new Error('Address is required for address emissions');
    }
    return this.api.getAddressEmissions(parameters.params.address);
  }

  @Tool({
    name: 'vechainstats_get_transaction_emissions',
    description: 'Get carbon emissions for a specific transaction',
  })
  async getTransactionEmissions(parameters: GetCarbonEmissionsParameters) {
    if (!parameters.params.txid) {
      throw new Error('Transaction ID is required');
    }
    return this.api.getTransactionEmissions(parameters.params.txid);
  }

  @Tool({
    name: 'vechainstats_get_network_emissions',
    description: 'Get total network carbon emissions - VeChain is carbon-neutral!',
  })
  async getNetworkEmissions(parameters: NoParameters) {
    return this.api.getNetworkEmissions();
  }
}

