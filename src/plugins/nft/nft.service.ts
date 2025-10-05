import { Tool } from '../../core/Tool.decorator.js';
import { createToolParameters } from '../../utils/createToolParameters.js';
import { z } from 'zod';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { VIP181_FUNCTIONS } from '../../registry/vip181-abi.js';
import { Clause, Address, ABIContract } from '@vechain/sdk-core';

/**
 * NFT Service for VIP-181 (VeChain NFT Standard)
 * 
 * Features:
 * - Query NFT data via VeChainStats API
 * - Mint NFTs (VIP-181 standard)
 * - Transfer NFTs
 * - Get NFT metadata
 * - Get collection information
 * 
 * Data Source: VeChainStats API tracks ALL NFT collections on VeChain
 * Minting: Uses VIP-181 standard (VeChain's ERC-721 equivalent)
 */

// Tool Parameters
const GetNFTCollectionInfoParameters = createToolParameters(
  z.object({
    collectionId: z.string().describe('NFT collection ID or contract address'),
  })
);

const GetNFTsByOwnerParameters = createToolParameters(
  z.object({
    address: z.string().describe('Wallet address to query NFTs for'),
    collectionAddress: z.string().optional().describe('Filter by specific collection contract'),
  })
);

const GetNFTMetadataParameters = createToolParameters(
  z.object({
    contractAddress: z.string().describe('NFT contract address'),
    tokenId: z.string().describe('Token ID'),
  })
);

const TransferNFTParameters = createToolParameters(
  z.object({
    contractAddress: z.string().describe('NFT contract address'),
    to: z.string().describe('Recipient address'),
    tokenId: z.string().describe('Token ID to transfer'),
    safe: z.boolean().optional().default(true).describe('Use safe transfer (recommended)'),
  })
);

const MintNFTParameters = createToolParameters(
  z.object({
    contractAddress: z.string().describe('NFT contract address (must support minting)'),
    to: z.string().optional().describe('Recipient address (defaults to wallet address)'),
    tokenId: z.string().optional().describe('Token ID (optional for auto-incrementing collections)'),
    tokenURI: z.string().optional().describe('Metadata URI (IPFS or HTTP URL)'),
  })
);

const GetNFTTransferHistoryParameters = createToolParameters(
  z.object({
    address: z.string().describe('Wallet address'),
    page: z.number().optional().default(1).describe('Page number'),
  })
);

const EmptyParameters = createToolParameters(
  z.object({}) // No parameters needed
);

const ApproveNFTParameters = createToolParameters(
  z.object({
    contractAddress: z.string().describe('NFT contract address'),
    tokenId: z.string().describe('Token ID to approve'),
    operator: z.string().describe('Address to approve for transfer'),
  })
);

export class NFTService {
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
  }

  // ==================== QUERY TOOLS (Using VeChainStats) ====================

  @Tool({
    name: 'nft_get_all_collections',
    description: 'Get all NFT collections on VeChain (uses VeChainStats API)',
  })
  async getAllCollections(parameters: EmptyParameters) {
    return {
      success: true,
      message: 'Use vechainstats_get_nft_list tool for complete collection data',
      note: 'VeChainStats tracks all NFT collections with metadata, floor prices, and statistics',
      tool: 'vechainstats_get_nft_list',
      helpfulTools: [
        'vechainstats_get_nft_info - Get specific collection details',
        'vechainstats_get_nft_holders - Get holder distribution'
      ]
    };
  }

  @Tool({
    name: 'nft_get_collection_info',
    description: 'Get detailed information about an NFT collection',
  })
  async getCollectionInfo(
    walletClient: VeChainWalletClient,
    parameters: GetNFTCollectionInfoParameters
  ) {
    try {
      const { collectionId } = parameters.params;

      // ✅ MODERN APPROACH: Use executeCall for contract reads
      const vip181Abi = new ABIContract(VIP181_FUNCTIONS as any);
      const nameFunction = vip181Abi.getFunction('name');
      const symbolFunction = vip181Abi.getFunction('symbol');
      const totalSupplyFunction = vip181Abi.getFunction('totalSupply');

      const [nameResult, symbolResult, totalSupplyResult] = await Promise.all([
        walletClient.executeCall(collectionId, nameFunction, []),
        walletClient.executeCall(collectionId, symbolFunction, []),
        walletClient.executeCall(collectionId, totalSupplyFunction, [])
      ]);

      return {
        success: true,
        collection: {
          address: collectionId,
          name: nameResult.result.plain as string,
          symbol: symbolResult.result.plain as string,
          totalSupply: (totalSupplyResult.result.plain as bigint).toString(),
          standard: 'VIP-181',
          network: this.network
        },
        note: 'Use vechainstats_get_nft_info for market data, floor price, and holder statistics'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get collection info',
        suggestion: 'Use vechainstats_get_nft_list to discover valid collection IDs'
      };
    }
  }

  @Tool({
    name: 'nft_get_owned_tokens',
    description: 'Get all NFTs owned by a specific address',
  })
  async getOwnedTokens(
    walletClient: VeChainWalletClient,
    parameters: GetNFTsByOwnerParameters
  ) {
    try {
      const { address, collectionAddress } = parameters.params;

      if (!collectionAddress) {
        // Use VeChainStats to get all NFTs
        return {
          success: true,
          message: 'Use vechainstats_get_vip181 tool to get all NFTs owned by address',
          tool: 'vechainstats_get_vip181',
          parameters: { address, expanded: true },
          note: 'VeChainStats provides complete NFT ownership data across all collections'
        };
      }

      // Query specific collection
      const thor = (walletClient as any).thor;
      const contract = thor.contracts.get(collectionAddress, [
        VIP181_FUNCTIONS.balanceOf
      ]);

      const balanceResult = await contract.methods.balanceOf(address).call();
      const balance = parseInt(balanceResult.decoded[0]);

      if (balance === 0) {
        return {
          success: true,
          owned: [],
          message: `Address owns 0 NFTs from this collection`,
          totalOwned: 0
        };
      }

      // Get token IDs (requires tokenOfOwnerByIndex function)
      const tokenIds = [];
      for (let i = 0; i < Math.min(balance, 100); i++) {
        try {
          const contractWithEnum = thor.contracts.get(collectionAddress, [
            VIP181_FUNCTIONS.balanceOf,
            {
              name: 'tokenOfOwnerByIndex',
              inputs: [
                { name: 'owner', type: 'address' },
                { name: 'index', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function'
            }
          ]);
          
          const tokenIdResult = await contractWithEnum.methods.tokenOfOwnerByIndex(address, i).call();
          tokenIds.push(tokenIdResult.decoded[0].toString());
        } catch {
          // Collection might not support enumeration
          break;
        }
      }

      return {
        success: true,
        collection: collectionAddress,
        owner: address,
        totalOwned: balance,
        tokenIds: tokenIds,
        note: tokenIds.length === 0 ? 
          'Collection does not support enumeration. Use vechainstats_get_vip181 instead.' :
          `Showing first ${tokenIds.length} of ${balance} NFTs`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get owned NFTs',
        alternative: 'Use vechainstats_get_vip181 tool for comprehensive NFT ownership data'
      };
    }
  }

  @Tool({
    name: 'nft_get_metadata',
    description: 'Get metadata for a specific NFT token',
  })
  async getNFTMetadata(
    walletClient: VeChainWalletClient,
    parameters: GetNFTMetadataParameters
  ) {
    try {
      const { contractAddress, tokenId } = parameters.params;
      const thor = (walletClient as any).thor;

      const contract = thor.contracts.get(contractAddress, [
        VIP181_FUNCTIONS.tokenURI,
        VIP181_FUNCTIONS.ownerOf
      ]);

      const [uriResult, ownerResult] = await Promise.all([
        contract.methods.tokenURI(tokenId).call(),
        contract.methods.ownerOf(tokenId).call()
      ]);

      const tokenURI = uriResult.decoded[0];
      const owner = ownerResult.decoded[0];

      // Fetch metadata from URI if it's HTTP/IPFS
      let metadata = null;
      if (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs://')) {
        try {
          const metadataUrl = tokenURI.startsWith('ipfs://') 
            ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
            : tokenURI;
          
          const response = await fetch(metadataUrl);
          metadata = await response.json();
        } catch (error) {
          metadata = { error: 'Failed to fetch metadata from URI' };
        }
      }

      return {
        success: true,
        nft: {
          contractAddress,
          tokenId,
          owner,
          tokenURI,
          metadata,
          network: this.network
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get NFT metadata'
      };
    }
  }

  @Tool({
    name: 'nft_get_transfer_history',
    description: 'Get NFT transfer history for an address (uses VeChainStats)',
  })
  async getTransferHistory(parameters: GetNFTTransferHistoryParameters) {
    const { address, page } = parameters.params;

    return {
      success: true,
      message: 'Use vechainstats_get_nft_transfers tool for NFT transfer history',
      tool: 'vechainstats_get_nft_transfers',
      parameters: { address, page, sort: 'desc' },
      note: 'VeChainStats tracks all NFT transfers across all collections'
    };
  }

  // ==================== MINTING & TRANSFER TOOLS ====================

  @Tool({
    name: 'nft_mint',
    description: 'Mint a new NFT token (requires minter role on contract)',
  })
  async mintNFT(
    walletClient: VeChainWalletClient,
    parameters: MintNFTParameters
  ) {
    try {
      const { contractAddress, to, tokenId, tokenURI } = parameters.params;
      const recipient = to || await walletClient.getAddress();

      // Determine which mint function to use
      let mintFunction;
      let mintParams;

      if (tokenURI) {
        // Mint with URI if provided
        mintFunction = VIP181_FUNCTIONS.mintWithURI;
        if (!tokenId) {
          return {
            success: false,
            error: 'tokenId is required when minting with URI'
          };
        }
        mintParams = [recipient, tokenId, tokenURI];
      } else if (tokenId) {
        // Mint with specific token ID
        mintFunction = VIP181_FUNCTIONS.safeMint;
        mintParams = [recipient, tokenId];
      } else {
        return {
          success: false,
          error: 'Either tokenId or auto-incrementing contract required',
          suggestion: 'Provide tokenId parameter or use a contract with automatic ID generation'
        };
      }

      // Build mint clause
      const abi = new ABIContract([mintFunction]);
      const mintClause = Clause.callFunction(
        Address.of(contractAddress),
        abi.getFunction(mintFunction.name!),
        mintParams
      );

      // Send transaction
      const { hash } = await walletClient.sendTransaction([{
        to: mintClause.to!,
        value: mintClause.value!,
        data: mintClause.data!
      }]);

      return {
        success: true,
        txHash: hash,
        nft: {
          contractAddress,
          tokenId: tokenId || 'Auto-generated',
          owner: recipient,
          tokenURI: tokenURI || 'Set by contract',
        },
        message: `NFT minted successfully to ${recipient}`,
        explorer: `https://${this.network === 'testnet' ? 'explore-testnet' : 'explore'}.vechain.org/transactions/${hash}`,
        note: 'Transaction must be confirmed before NFT is available'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to mint NFT',
        possibleReasons: [
          'Wallet does not have minter role',
          'Token ID already exists',
          'Contract does not support this mint function',
          'Insufficient VTHO for gas'
        ]
      };
    }
  }

  @Tool({
    name: 'nft_transfer',
    description: 'Transfer an NFT to another address',
  })
  async transferNFT(
    walletClient: VeChainWalletClient,
    parameters: TransferNFTParameters
  ) {
    try {
      const { contractAddress, to, tokenId, safe } = parameters.params;
      const from = await walletClient.getAddress();

      // Use safe or regular transfer
      const transferFunction = safe 
        ? VIP181_FUNCTIONS.safeTransferFrom
        : VIP181_FUNCTIONS.transferFrom;

      // Build transfer clause
      const abi = new ABIContract([transferFunction]);
      const transferClause = Clause.callFunction(
        Address.of(contractAddress),
        abi.getFunction(transferFunction.name!),
        [from, to, tokenId]
      );

      // Send transaction
      const { hash } = await walletClient.sendTransaction([{
        to: transferClause.to!,
        value: transferClause.value!,
        data: transferClause.data!
      }]);

      return {
        success: true,
        txHash: hash,
        transfer: {
          from,
          to,
          tokenId,
          contractAddress,
          safeTransfer: safe
        },
        message: `NFT #${tokenId} transferred to ${to}`,
        explorer: `https://${this.network === 'testnet' ? 'explore-testnet' : 'explore'}.vechain.org/transactions/${hash}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to transfer NFT',
        possibleReasons: [
          'You do not own this NFT',
          'Token ID does not exist',
          'Recipient address is invalid',
          'NFT is approved to another address'
        ]
      };
    }
  }

  @Tool({
    name: 'nft_approve',
    description: 'Approve another address to transfer a specific NFT',
  })
  async approveNFT(
    walletClient: VeChainWalletClient,
    parameters: ApproveNFTParameters
  ) {
    try {
      const { contractAddress, tokenId, operator } = parameters.params;

      if (!operator) {
        return {
          success: false,
          error: 'operator parameter is required for approval'
        };
      }

      // Build approval clause
      const abi = new ABIContract([VIP181_FUNCTIONS.approve]);
      const approvalClause = Clause.callFunction(
        Address.of(contractAddress),
        abi.getFunction('approve'),
        [operator, tokenId]
      );

      // Send transaction
      const { hash } = await walletClient.sendTransaction([{
        to: approvalClause.to!,
        value: approvalClause.value!,
        data: approvalClause.data!
      }]);

      return {
        success: true,
        txHash: hash,
        approval: {
          contractAddress,
          tokenId,
          operator
        },
        message: `NFT #${tokenId} approved for ${operator}`,
        explorer: `https://${this.network === 'testnet' ? 'explore-testnet' : 'explore'}.vechain.org/transactions/${hash}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to approve NFT'
      };
    }
  }

  @Tool({
    name: 'nft_check_ownership',
    description: 'Check who owns a specific NFT token',
  })
  async checkOwnership(
    walletClient: VeChainWalletClient,
    parameters: GetNFTMetadataParameters
  ) {
    try {
      const { contractAddress, tokenId } = parameters.params;
      const thor = (walletClient as any).thor;

      const contract = thor.contracts.get(contractAddress, [
        VIP181_FUNCTIONS.ownerOf
      ]);

      const ownerResult = await contract.methods.ownerOf(tokenId).call();
      const owner = ownerResult.decoded[0];

      const walletAddress = await walletClient.getAddress();
      const isOwner = owner.toLowerCase() === walletAddress.toLowerCase();

      return {
        success: true,
        nft: {
          contractAddress,
          tokenId,
          owner,
          isOwnedByYou: isOwner
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check NFT ownership',
        note: 'Token might not exist or contract address is invalid'
      };
    }
  }

  @Tool({
    name: 'nft_get_floor_price',
    description: 'Get floor price and market data for an NFT collection (uses VeChainStats)',
  })
  async getFloorPrice(parameters: GetNFTCollectionInfoParameters) {
    const { collectionId } = parameters.params;

    return {
      success: true,
      message: 'Use vechainstats_get_nft_info for floor price and market data',
      tool: 'vechainstats_get_nft_info',
      parameters: { id: collectionId, expanded: true },
      note: 'VeChainStats provides floor price, volume, and trading statistics'
    };
  }

  @Tool({
    name: 'nft_burn',
    description: 'Burn (destroy) an NFT token',
  })
  async burnNFT(
    walletClient: VeChainWalletClient,
    parameters: GetNFTMetadataParameters
  ) {
    try {
      const { contractAddress, tokenId } = parameters.params;

      // Build burn clause
      const abi = new ABIContract([VIP181_FUNCTIONS.burn]);
      const burnClause = Clause.callFunction(
        Address.of(contractAddress),
        abi.getFunction('burn'),
        [tokenId]
      );

      // Send transaction
      const { hash } = await walletClient.sendTransaction([{
        to: burnClause.to!,
        value: burnClause.value!,
        data: burnClause.data!
      }]);

      return {
        success: true,
        txHash: hash,
        burned: {
          contractAddress,
          tokenId
        },
        message: `NFT #${tokenId} burned successfully`,
        explorer: `https://${this.network === 'testnet' ? 'explore-testnet' : 'explore'}.vechain.org/transactions/${hash}`,
        warning: 'This action is irreversible. The NFT is permanently destroyed.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to burn NFT',
        possibleReasons: [
          'You do not own this NFT',
          'Contract does not support burning',
          'Token ID does not exist'
        ]
      };
    }
  }
}

