import { Tool } from '../../core/Tool.decorator.js';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { Clause, Address, ABIContract, VET } from '@vechain/sdk-core';
import {
  StakeVETParameters,
  GetUserStakesParameters,
  GetStakeInfoParameters,
  ClaimVTHORewardsParameters,
  GetStakingLevelsParameters,
  GetLevelSupplyParameters,
  GetIdsOwnedByParameters,
  CanTransferParameters,
  GetMaturityEndBlockParameters,
  IsUnderMaturityParameters,
  GetTokenLevelParameters,
  TokenExistsParameters,
  UnstakeParameters,
} from './parameters.js';
import { getStarGateContractAddress } from '../../registry/stargate-contracts.js';
import { STARGATE_NFT_ABI } from '../../registry/stargate-abi.js';
import { 
  getAllStarGateLevels, 
  getStarGateLevel, 
  TokenLevelId, 
  formatVETAmount,
  type TokenLevel 
} from '../../registry/stargate-levels.js';
import type { TransactionClause } from '../../core/types.js';

/**
 * Official StarGate Staking Service
 * Based on official StarGate contracts and configurations
 * Provides comprehensive VET staking and NFT management functionality
 */
export class StarGateService {

  /**
   * Stake VET to mint a StarGate NFT of specified level
   */
  @Tool({
    name: 'stake_vet',
    description: 'Stake VET to mint a StarGate NFT (Dawn, Lightning, Flash, Strength, Thunder, Mjolnir levels)',
  })
  async stakeVET(walletClient: VeChainWalletClient, parameters: StakeVETParameters) {
    const { levelId, autoDelegate } = parameters.params;
    
    try {
      // Get contract address for current network
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      // Create ABI contract instance
      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      
      // Get level configuration from contract
      const getLevelFunction = stargateContract.getFunction('getLevel');
      const levelResult = await walletClient.executeCall(
        contractAddress,
        getLevelFunction,
        [levelId]
      );
      
      const level = levelResult.result.plain as any;
      if (!level) {
        throw new Error(`Invalid level ID: ${levelId}`);
      }

      const stakeFunction = autoDelegate 
        ? stargateContract.getFunction('stakeAndDelegate')
        : stargateContract.getFunction('stake');

      // Build transaction clause with VET value
      const vetAmount = VET.of((level.vetRequired / BigInt(1e18)).toString());
      const clause = autoDelegate
        ? Clause.callFunction(
            Address.of(contractAddress),
            stakeFunction,
            [levelId, true], // levelId, autorenew
            vetAmount
          )
        : Clause.callFunction(
            Address.of(contractAddress),
            stakeFunction,
            [levelId],
            vetAmount
          );

      // Send transaction
      const result = await walletClient.sendTransaction([{
        to: clause.to!,
        value: clause.value!,
        data: clause.data!
      }]);

      return {
        success: true,
        txHash: result.hash,
        txId: result.id,
        level: level.name,
        levelId: Number(level.id),
        vetStaked: formatVETAmount(level.vetRequired.toString()),
        isX: level.isX,
        maturityBlocks: Number(level.maturityBlocks),
        autoDelegate,
        explorer: walletClient.getExplorerUrl(result.hash),
        message: `Successfully staked ${formatVETAmount(level.vetRequired.toString())} VET for ${level.name} NFT${autoDelegate ? ' with auto-delegation' : ''}`,
      };
    } catch (error: any) {
      throw new Error(`StarGate staking failed: ${error.message}`);
    }
  }

  /**
   * Get all StarGate NFTs owned by an address
   */
  @Tool({
    name: 'get_user_stakes',
    description: 'Get all StarGate NFTs owned by an address with detailed information',
  })
  async getUserStakes(walletClient: VeChainWalletClient, parameters: GetUserStakesParameters) {
    const { address } = parameters.params;
    
    try {
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );


      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      
      // Use tokensOwnedBy which returns full token data directly
      const tokensOwnedByFunction = stargateContract.getFunction('tokensOwnedBy');
      
      const tokensResult = await walletClient.executeCall(
        contractAddress,
        tokensOwnedByFunction,
        [address]
      );


      const tokenData = tokensResult.result.plain as any;
      
      // Handle both single token and array of tokens
      let tokens = [];
      if (Array.isArray(tokenData)) {
        tokens = tokenData;
      } else if (tokenData && typeof tokenData === 'object') {
        // Single token object
        tokens = [tokenData];
      }
      
      if (!tokens || tokens.length === 0) {
        return {
          success: true,
          address,
          totalStakes: 0,
          stakes: [],
          message: `No StarGate NFTs found for address ${address}`,
        };
      }

      // Process the token data directly
      const stakes = [];
      
      for (const token of tokens) {
        try {
          const levelId = Number(token.levelId);
          
          // Get level info from contract
          const getLevelFunction = stargateContract.getFunction('getLevel');
          const levelResult = await walletClient.executeCall(
            contractAddress,
            getLevelFunction,
            [levelId]
          );
          
          const contractLevel = levelResult.result.plain as any;
          
          stakes.push({
            tokenId: token.tokenId.toString(),
            level: contractLevel.name,
            levelId: Number(contractLevel.id),
            isX: contractLevel.isX,
            vetStaked: formatVETAmount(token.vetAmountStaked.toString()),
            vetStakedWei: token.vetAmountStaked.toString(),
            mintedAtBlock: token.mintedAtBlock.toString(),
            lastVthoClaimTimestamp: token.lastVthoClaimTimestamp.toString(),
            maturityBlocks: Number(contractLevel.maturityBlocks),
            scaledRewardFactor: Number(contractLevel.scaledRewardFactor),
          });
        } catch (error) {
          throw error;
        }
      }

      return {
        success: true,
        address,
        totalStakes: stakes.length,
        stakes,
        message: `Found ${stakes.length} StarGate NFT${stakes.length !== 1 ? 's' : ''} for address ${address}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user stakes: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific StarGate NFT
   */
  @Tool({
    name: 'get_stake_info',
    description: 'Get detailed information about a specific StarGate NFT by token ID',
  })
  async getStakeInfo(walletClient: VeChainWalletClient, parameters: GetStakeInfoParameters) {
    try {
      // Robust parameter extraction and validation
      const rawTokenId = parameters?.params?.tokenId;
      
      // Handle null, undefined, and empty values with more specific error messages
      if (rawTokenId == null || rawTokenId === undefined) {
        throw new Error(`Token ID parameter is null or undefined. Please provide a valid token ID.`);
      }
      
      if (rawTokenId === '' || rawTokenId === 'null' || rawTokenId === 'undefined') {
        throw new Error(`Token ID cannot be empty string or the literal string "${rawTokenId}". Please provide a valid numeric token ID.`);
      }
      
      // Convert to string and then to number, handling various input types
      const tokenIdStr = String(rawTokenId).trim();
      const tokenIdNum = parseFloat(tokenIdStr);
      
      // Validate the number
      if (!Number.isFinite(tokenIdNum) || tokenIdNum < 0 || !Number.isInteger(tokenIdNum)) {
        throw new Error(`Invalid token ID: must be a positive integer, received "${rawTokenId}"`);
      }
      
      // Convert to BigInt safely
      const tokenIdBigInt = BigInt(Math.floor(tokenIdNum));
      
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      
      // First check if token exists
      const tokenExistsFunction = stargateContract.getFunction('tokenExists');
      const existsResult = await walletClient.executeCall(
        contractAddress,
        tokenExistsFunction,
        [tokenIdBigInt]
      );
      
      const tokenExists = existsResult.result.plain as boolean;
      if (!tokenExists) {
        throw new Error(`StarGate NFT #${tokenIdStr} does not exist`);
      }
      
      // Get token details
      const getTokenFunction = stargateContract.getFunction('getToken');
      const tokenResult = await walletClient.executeCall(
        contractAddress,
        getTokenFunction,
        [tokenIdBigInt]
      );

      const tokenData = tokenResult.result.plain as any;
      
      // Validate token data
      if (!tokenData || tokenData.levelId == null) {
        throw new Error(`Invalid token data returned for StarGate NFT #${tokenIdStr}`);
      }
      
      // Get level info from contract using the correct field name
      const getLevelFunction = stargateContract.getFunction('getLevel');
      const levelResult = await walletClient.executeCall(
        contractAddress,
        getLevelFunction,
        [Number(tokenData.levelId)] // Use 'levelId' from the actual struct
      );
      const level = levelResult.result.plain as any;

      // Get owner
      const ownerOfFunction = stargateContract.getFunction('ownerOf');
      const ownerResult = await walletClient.executeCall(
        contractAddress,
        ownerOfFunction,
        [tokenIdBigInt]
      );
      const owner = ownerResult.result.plain as string;

      // Get claimable VTHO
      const claimableVthoFunction = stargateContract.getFunction('claimableVetGeneratedVtho');
      const claimableVthoResult = await walletClient.executeCall(
        contractAddress,
        claimableVthoFunction,
        [tokenIdBigInt]
      );
      const claimableVtho = claimableVthoResult.result.plain as bigint;

      // Check if token can be transferred (maturity check)
      const canTransferFunction = stargateContract.getFunction('canTransfer');
      const canTransferResult = await walletClient.executeCall(
        contractAddress,
        canTransferFunction,
        [tokenIdBigInt]
      );
      const canTransfer = canTransferResult.result.plain as boolean;

      // Get maturity period end block
      const maturityFunction = stargateContract.getFunction('maturityPeriodEndBlock');
      const maturityResult = await walletClient.executeCall(
        contractAddress,
        maturityFunction,
        [tokenIdBigInt]
      );
      const maturityEndBlock = maturityResult.result.plain as bigint;

      return {
        success: true,
        tokenId: tokenIdStr,
        owner,
        level: level.name,
        levelId: Number(level.id),
        isX: level.isX,
        vetStaked: formatVETAmount(tokenData.vetAmountStaked.toString()), // Correct field name
        vetStakedWei: tokenData.vetAmountStaked.toString(),
        mintedAtBlock: tokenData.mintedAtBlock.toString(), // Correct field name
        lastVthoClaimTimestamp: tokenData.lastVthoClaimTimestamp.toString(), // Correct field name
        maturityBlocks: Number(level.maturityBlocks),
        scaledRewardFactor: Number(level.scaledRewardFactor),
        claimableVtho: (Number(claimableVtho) / 1e18).toFixed(4),
        claimableVthoWei: claimableVtho.toString(),
        canTransfer,
        maturityEndBlock: maturityEndBlock.toString(),
        message: `StarGate NFT #${tokenIdStr} - ${level.name} owned by ${owner}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get stake info: ${error.message}`);
    }
  }

  /**
   * Claim VTHO rewards for a StarGate NFT
   */
  @Tool({
    name: 'claim_vtho_rewards',
    description: 'Claim accumulated VTHO rewards for a StarGate NFT',
  })
  async claimVTHORewards(walletClient: VeChainWalletClient, parameters: ClaimVTHORewardsParameters) {
    const { tokenId } = parameters.params;
    
    try {
      // Validate tokenId parameter
      if (!tokenId || tokenId === null || tokenId === undefined) {
        throw new Error('Token ID is required');
      }
      
      const tokenIdNum = Number(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error(`Invalid token ID: ${tokenId}`);
      }
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const claimFunction = stargateContract.getFunction('claimVetGeneratedVtho');

      const clause = Clause.callFunction(
        Address.of(contractAddress),
        claimFunction,
        [BigInt(tokenIdNum)]
      );

      const result = await walletClient.sendTransaction([{
        to: clause.to!,
        value: clause.value!,
        data: clause.data!
      }]);

      return {
        success: true,
        txHash: result.hash,
        txId: result.id,
        tokenId,
        explorer: walletClient.getExplorerUrl(result.hash),
        message: `Successfully claimed VTHO rewards for StarGate NFT #${tokenId}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to claim VTHO rewards: ${error.message}`);
    }
  }

  /**
   * Get all available StarGate staking levels and their requirements
   */
  @Tool({
    name: 'get_staking_levels',
    description: 'Get all available StarGate staking levels with requirements and rewards',
  })
  async getStakingLevels(walletClient: VeChainWalletClient, parameters: GetStakingLevelsParameters) {
    try {
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      
      // Get levels directly from the contract
      const getLevelsFunction = stargateContract.getFunction('getLevels');
      const levelsResult = await walletClient.executeCall(
        contractAddress,
        getLevelsFunction,
        []
      );


      const contractLevels = levelsResult.result.plain as any[];
      
      if (!contractLevels || contractLevels.length === 0) {
        return {
          success: true,
          network: walletClient.getNetwork(),
          totalLevels: 0,
          levels: [],
          message: `No StarGate staking levels found on ${walletClient.getNetwork()}`,
        };
      }

      const formattedLevels = contractLevels.map((level: any) => ({
        id: Number(level.id),
        name: level.name,
        isX: level.isX,
        vetRequired: formatVETAmount(level.vetRequired.toString()),
        vetRequiredWei: level.vetRequired.toString(),
        scaledRewardFactor: Number(level.scaledRewardFactor),
        maturityBlocks: Number(level.maturityBlocks),
        maturityDays: Math.round(Number(level.maturityBlocks) / 8640), // 8640 blocks per day
        maxSupply: Number(level.maxSupply),
        category: level.isX ? 'X Node' : 'Standard Node',
        description: this.getContractLevelDescription(level),
      }));

      // Sort by VET requirement (ascending)
      formattedLevels.sort((a, b) => BigInt(a.vetRequiredWei) > BigInt(b.vetRequiredWei) ? 1 : -1);

      return {
        success: true,
        network: walletClient.getNetwork(),
        totalLevels: formattedLevels.length,
        levels: formattedLevels,
        message: `Available StarGate staking levels on ${walletClient.getNetwork()}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get staking levels: ${error.message}`);
    }
  }

  /**
   * Get level description for UI display (from contract data)
   */
  private getContractLevelDescription(level: any): string {
    const category = level.isX ? 'X-Series' : 'Standard';
    const maturityDays = Math.round(Number(level.maturityBlocks) / 8640);
    
    if (level.isX) {
      return `${category} node with ${Number(level.scaledRewardFactor)}x reward multiplier. No maturity period.`;
    } else {
      return `${category} node requiring ${formatVETAmount(level.vetRequired.toString())} VET with ${maturityDays}-day maturity period and ${Number(level.scaledRewardFactor)}x reward multiplier.`;
    }
  }

  /**
   * Get level description for UI display (from local data)
   */
  private getLevelDescription(level: TokenLevel): string {
    const category = level.isX ? 'X-Series' : 'Standard';
    const maturityDays = Math.round(level.maturityBlocks / 8640);
    
    if (level.isX) {
      return `${category} node with ${level.scaledRewardFactor}x reward multiplier. No maturity period.`;
    } else {
      return `${category} node requiring ${formatVETAmount(level.vetAmountRequiredToStake)} VET with ${maturityDays}-day maturity period and ${level.scaledRewardFactor}x reward multiplier.`;
    }
  }

  /**
   * Unstake a StarGate NFT
   */
  @Tool({
    name: 'unstake_stargate_nft',
    description: 'Unstake a StarGate NFT to burn it and retrieve the staked VET',
  })
  async unstake(walletClient: VeChainWalletClient, parameters: UnstakeParameters) {
    const { tokenId } = parameters.params;
    
    try {
      if (!tokenId || tokenId === null || tokenId === undefined) {
        throw new Error('Token ID is required');
      }
      
      const tokenIdNum = Number(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error(`Invalid token ID: ${tokenId}`);
      }
      
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const unstakeFunction = stargateContract.getFunction('unstake');

      const clause = Clause.callFunction(
        Address.of(contractAddress),
        unstakeFunction,
        [BigInt(tokenIdNum)]
      );

      const result = await walletClient.sendTransaction([{
        to: clause.to!,
        value: clause.value!,
        data: clause.data!
      }]);

      return {
        success: true,
        txHash: result.hash,
        txId: result.id,
        tokenId,
        explorer: walletClient.getExplorerUrl(result.hash),
        message: `Successfully unstaked StarGate NFT #${tokenId}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to unstake StarGate NFT: ${error.message}`);
    }
  }

  /**
   * Check if a StarGate NFT can be transferred (not under maturity period)
   */
  @Tool({
    name: 'can_transfer_stargate_nft',
    description: 'Check if a StarGate NFT can be transferred (maturity period has ended)',
  })
  async canTransfer(walletClient: VeChainWalletClient, parameters: CanTransferParameters) {
    const { tokenId } = parameters.params;
    
    try {
      if (!tokenId || tokenId === null || tokenId === undefined) {
        throw new Error('Token ID is required');
      }
      
      const tokenIdNum = Number(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error(`Invalid token ID: ${tokenId}`);
      }
      
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const canTransferFunction = stargateContract.getFunction('canTransfer');

      const result = await walletClient.executeCall(
        contractAddress,
        canTransferFunction,
        [BigInt(tokenIdNum)]
      );

      const canTransfer = result.result.plain as boolean;

      return {
        success: true,
        tokenId,
        canTransfer,
        message: `StarGate NFT #${tokenId} ${canTransfer ? 'can' : 'cannot'} be transferred`,
      };
    } catch (error: any) {
      throw new Error(`Failed to check transfer eligibility: ${error.message}`);
    }
  }

  /**
   * Get the maturity period end block for a StarGate NFT
   */
  @Tool({
    name: 'get_maturity_end_block',
    description: 'Get the block number when the maturity period ends for a StarGate NFT',
  })
  async getMaturityEndBlock(walletClient: VeChainWalletClient, parameters: GetMaturityEndBlockParameters) {
    const { tokenId } = parameters.params;
    
    try {
      if (!tokenId || tokenId === null || tokenId === undefined) {
        throw new Error('Token ID is required');
      }
      
      const tokenIdNum = Number(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error(`Invalid token ID: ${tokenId}`);
      }
      
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const maturityFunction = stargateContract.getFunction('maturityPeriodEndBlock');

      const result = await walletClient.executeCall(
        contractAddress,
        maturityFunction,
        [BigInt(tokenIdNum)]
      );

      const maturityEndBlock = result.result.plain as bigint;

      return {
        success: true,
        tokenId,
        maturityEndBlock: maturityEndBlock.toString(),
        message: `Maturity period for StarGate NFT #${tokenId} ends at block ${maturityEndBlock.toString()}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get maturity end block: ${error.message}`);
    }
  }

  /**
   * Check if a StarGate NFT is under maturity period
   */
  @Tool({
    name: 'is_under_maturity_period',
    description: 'Check if a StarGate NFT is still under maturity period',
  })
  async isUnderMaturityPeriod(walletClient: VeChainWalletClient, parameters: IsUnderMaturityParameters) {
    const { tokenId } = parameters.params;
    
    try {
      if (!tokenId || tokenId === null || tokenId === undefined) {
        throw new Error('Token ID is required');
      }
      
      const tokenIdNum = Number(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error(`Invalid token ID: ${tokenId}`);
      }
      
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const isUnderMaturityFunction = stargateContract.getFunction('isUnderMaturityPeriod');

      const result = await walletClient.executeCall(
        contractAddress,
        isUnderMaturityFunction,
        [BigInt(tokenIdNum)]
      );

      const isUnderMaturity = result.result.plain as boolean;

      return {
        success: true,
        tokenId,
        isUnderMaturity,
        message: `StarGate NFT #${tokenId} is ${isUnderMaturity ? 'under' : 'not under'} maturity period`,
      };
    } catch (error: any) {
      throw new Error(`Failed to check maturity status: ${error.message}`);
    }
  }

  /**
   * Get the level of a StarGate NFT
   */
  @Tool({
    name: 'get_token_level',
    description: 'Get the level ID of a StarGate NFT',
  })
  async getTokenLevel(walletClient: VeChainWalletClient, parameters: GetTokenLevelParameters) {
    const { tokenId } = parameters.params;
    
    try {
      if (!tokenId || tokenId === null || tokenId === undefined) {
        throw new Error('Token ID is required');
      }
      
      const tokenIdNum = Number(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error(`Invalid token ID: ${tokenId}`);
      }
      
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const getTokenLevelFunction = stargateContract.getFunction('getTokenLevel');

      const result = await walletClient.executeCall(
        contractAddress,
        getTokenLevelFunction,
        [BigInt(tokenIdNum)]
      );

      const levelId = result.result.plain as number;

      return {
        success: true,
        tokenId,
        levelId: Number(levelId),
        message: `StarGate NFT #${tokenId} has level ID ${levelId}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get token level: ${error.message}`);
    }
  }

  /**
   * Get all token IDs owned by an address
   */
  @Tool({
    name: 'get_ids_owned_by',
    description: 'Get all StarGate NFT token IDs owned by an address',
  })
  async getIdsOwnedBy(walletClient: VeChainWalletClient, parameters: GetIdsOwnedByParameters) {
    const { address } = parameters.params;
    
    try {
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const idsOwnedByFunction = stargateContract.getFunction('idsOwnedBy');

      const result = await walletClient.executeCall(
        contractAddress,
        idsOwnedByFunction,
        [address]
      );

      const tokenIds = result.result.plain as bigint[];
      const formattedIds = tokenIds.map(id => id.toString());

      return {
        success: true,
        address,
        tokenIds: formattedIds,
        totalCount: formattedIds.length,
        message: `Found ${formattedIds.length} StarGate NFT${formattedIds.length !== 1 ? 's' : ''} owned by ${address}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get owned token IDs: ${error.message}`);
    }
  }

  /**
   * Get supply information for a specific level
   */
  @Tool({
    name: 'get_level_supply',
    description: 'Get circulating supply and cap for a specific StarGate level',
  })
  async getLevelSupply(walletClient: VeChainWalletClient, parameters: GetLevelSupplyParameters) {
    const { levelId } = parameters.params;
    
    try {
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const getLevelSupplyFunction = stargateContract.getFunction('getLevelSupply');

      const result = await walletClient.executeCall(
        contractAddress,
        getLevelSupplyFunction,
        [levelId]
      );

      const supplyData = result.result.plain as any;
      const circulatingSupply = Number(supplyData.circulating || supplyData[0]);
      const cap = Number(supplyData.cap || supplyData[1]);

      return {
        success: true,
        levelId,
        circulatingSupply,
        cap,
        availableSupply: cap - circulatingSupply,
        message: `Level ${levelId}: ${circulatingSupply}/${cap} minted`,
      };
    } catch (error: any) {
      throw new Error(`Failed to get level supply: ${error.message}`);
    }
  }

  /**
   * Check if a token exists
   */
  @Tool({
    name: 'token_exists',
    description: 'Check if a StarGate NFT token exists',
  })
  async tokenExists(walletClient: VeChainWalletClient, parameters: TokenExistsParameters) {
    const { tokenId } = parameters.params;
    
    try {
      if (!tokenId || tokenId === null || tokenId === undefined) {
        throw new Error('Token ID is required');
      }
      
      const tokenIdNum = Number(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error(`Invalid token ID: ${tokenId}`);
      }
      
      const contractAddress = getStarGateContractAddress(
        'STARGATE_NFT',
        walletClient.getNetwork()
      );

      const stargateContract = new ABIContract(STARGATE_NFT_ABI as any);
      const tokenExistsFunction = stargateContract.getFunction('tokenExists');

      const result = await walletClient.executeCall(
        contractAddress,
        tokenExistsFunction,
        [BigInt(tokenIdNum)]
      );

      const exists = result.result.plain as boolean;

      return {
        success: true,
        tokenId,
        exists,
        message: `StarGate NFT #${tokenId} ${exists ? 'exists' : 'does not exist'}`,
      };
    } catch (error: any) {
      throw new Error(`Failed to check token existence: ${error.message}`);
    }
  }
}