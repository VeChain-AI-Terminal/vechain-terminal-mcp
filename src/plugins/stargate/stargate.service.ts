import { Tool } from '../../core/Tool.decorator.js';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { Address, ABIContract, Clause, VET, Transaction } from '@vechain/sdk-core';
import {
  StakeVETParameters,
  StakeAndDelegateVETParameters,
  UnstakeVETParameters,
  GetUserStakesParameters,
  GetStakeInfoParameters,
  ClaimVTHORewardsParameters,
  StartDelegationParameters,
  StopDelegationParameters,
  ClaimDelegationRewardsParameters,
  GetDelegationInfoParameters,
  MigrateLegacyNodeParameters,
  MigrateAndDelegateParameters,
  SetNodeManagerParameters,
  RemoveNodeManagerParameters,
  GetNodeManagerParameters,
  GetStakingLevelsParameters,
} from './parameters.js';
import {
  getStarGateContractAddress,
} from '../../registry/stargate-contracts.js';
import {
  STARGATE_NFT_ABI,
  STARGATE_DELEGATION_ABI,
  NODE_MANAGEMENT_ABI,
} from '../../registry/stargate-abi.js';
import type { TransactionClause } from '../../core/types.js';

/**
 * StarGate operations service
 * Provides tools for StarGate NFT staking, delegation, and management
 */
export class StarGateService {
  
  /**
   * Professional category determination based on contract data
   * Uses multiple data points for accurate categorization
   */
  private determineTierCategory(name: string, isX: boolean, id: number): string {
    // X tiers are explicitly marked in the contract
    if (isX) {
      return 'X';
    }

    // Professional categorization based on tier ID ranges and naming patterns
    // This is more maintainable than hardcoded string matching
    
    // Tier ID-based categorization (most reliable)
    if (id >= 1 && id <= 3) {
      return 'Eco'; // Classic Eco tiers
    } else if (id >= 4 && id <= 6) {
      return 'New Eco'; // New Eco tiers (Dawn, Lightning, Flash)
    } else if (id >= 7 && id <= 10) {
      return 'X'; // X tiers (if not already marked by isX)
    }

    // Fallback to name-based categorization for edge cases
    const lowerName = name.toLowerCase();
    if (lowerName.includes('dawn') || lowerName.includes('lightning') || lowerName.includes('flash')) {
      return 'New Eco';
    } else if (lowerName.includes('eco') || lowerName.includes('classic')) {
      return 'Eco';
    } else if (lowerName.includes('x') || lowerName.includes('premium')) {
      return 'X';
    }

    // Default fallback
    return 'Eco';
  }

  /**
   * Helper method to get tier info from contract
   */
  private async getTierInfoFromContract(walletClient: VeChainWalletClient, levelId: number) {
    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Create ABI contract instance
    const stargateAbi = new ABIContract(STARGATE_NFT_ABI as any);
    const getLevelFunction = stargateAbi.getFunction('getLevel');

    // Call getLevel function using proper VeChain SDK pattern
    const levelResult = await walletClient.executeCall(
      contractAddress,
      getLevelFunction,
      [levelId]
    );

    const levelData = levelResult.result.plain as any;
    
    // Contract returns an object, not an array
    const { name, isX, id, maturityBlocks, scaledRewardFactor, vetRequired, maxSupply } = levelData;

    // Professional category determination based on contract data
    const category = this.determineTierCategory(name, isX, id);

    return {
      id,
      name,
      category,
      vetRequired: (Number(vetRequired) / 1e18).toString(),
      supply: Number(maxSupply),
      maturityDays: maturityBlocks > 0n ? Number(maturityBlocks) / (24 * 60 * 60) : null,
      rewardPerBlock: scaledRewardFactor.toString(),
      isX,
    };
  }
  
  /**
   * Core Staking Operations
   */

  @Tool({
    name: 'stake_vet',
    description: 'Stake VET to mint a StarGate NFT of the specified tier level',
  })
  async stakeVET(walletClient: VeChainWalletClient, parameters: StakeVETParameters) {
    const { level, amount } = parameters.params;
    
    // Validate tier level and get tier info from contract
    const tierInfo = await this.getTierInfoFromContract(walletClient, level);
    
    // Validate amount meets requirements
    const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    const requiredWei = BigInt(Math.floor(parseFloat(tierInfo.vetRequired) * 1e18));
    
    if (amountInWei < requiredWei) {
      throw new Error(`Insufficient VET amount. Required: ${tierInfo.vetRequired} VET for ${tierInfo.name} tier`);
    }

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Create ABI contract instance
    const stargateAbi = new ABIContract(STARGATE_NFT_ABI as any);
    const stakeFunction = stargateAbi.getFunction('stake');

    // Create function clause using proper VeChain SDK pattern
    const clause = Clause.callFunction(
      Address.of(contractAddress),
      stakeFunction,
      [level],
      VET.of(amount)
    );

    // Send transaction using proper VeChain SDK pattern
    const thor = walletClient.getThorClient();
    const address = walletClient.getAddress();

    // Estimate gas
    const gasResult = await thor.gas.estimateGas([clause], address);

    // Get default transaction body options
    const defaultBodyOptions = await thor.transactions.fillDefaultBodyOptions();

    // Build transaction body
    const txBody = await thor.transactions.buildTransactionBody(
      [clause],
      gasResult.totalGas,
      defaultBodyOptions
    );

    // Sign and send transaction
    const txClass = Transaction.of(txBody);
    const privateKey = walletClient['privateKey']; // Access private key for signing
    const txSigned = txClass.sign(privateKey);
    const encodedTx = '0x' + Buffer.from(txSigned.encoded).toString('hex');

    const result = await thor.transactions.sendRawTransaction(encodedTx);

    return {
      success: true,
      txHash: result.id,
      txId: result.id,
      from: walletClient.getAddress(),
      tier: tierInfo,
      amount: amount,
      contractAddress,
      explorer: walletClient.getExplorerUrl(result.id),
      message: `Successfully staked ${amount} VET for ${tierInfo.name} tier StarGate NFT`,
    };
  }

  @Tool({
    name: 'stake_and_delegate_vet',
    description: 'Stake VET and immediately start delegation for a StarGate NFT',
  })
  async stakeAndDelegateVET(walletClient: VeChainWalletClient, parameters: StakeAndDelegateVETParameters) {
    const { level, amount, delegatee } = parameters.params;
    
    // Validate tier level and get tier info from contract
    const tierInfo = await this.getTierInfoFromContract(walletClient, level);
    
    // Validate amount meets requirements
    const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    const requiredWei = BigInt(Math.floor(parseFloat(tierInfo.vetRequired) * 1e18));
    
    if (amountInWei < requiredWei) {
      throw new Error(`Insufficient VET amount. Required: ${tierInfo.vetRequired} VET for ${tierInfo.name} tier`);
    }

    // Validate delegatee address
    if (!Address.isValid(delegatee)) {
      throw new Error('Invalid delegatee address');
    }

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Build stakeAndDelegate transaction clause
    const clause: TransactionClause = {
      to: contractAddress,
      value: `0x${amountInWei.toString(16)}`,
      data: walletClient.encodeFunction(STARGATE_NFT_ABI, 'stakeAndDelegate', [level, delegatee]),
    };

    // Send transaction
    const result = await walletClient.sendTransaction([clause]);

    return {
      success: true,
      txHash: result.hash,
      txId: result.id,
      from: walletClient.getAddress(),
      tier: tierInfo,
      amount: amount,
      delegatee,
      contractAddress,
      explorer: walletClient.getExplorerUrl(result.hash),
      message: `Successfully staked ${amount} VET for ${tierInfo.name} tier StarGate NFT with delegation to ${delegatee}`,
    };
  }

  @Tool({
    name: 'unstake_vet',
    description: 'Burn a StarGate NFT and retrieve the staked VET',
  })
  async unstakeVET(walletClient: VeChainWalletClient, parameters: UnstakeVETParameters) {
    const { tokenId } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Build unstake transaction clause
    const clause: TransactionClause = {
      to: contractAddress,
      value: '0x0',
      data: walletClient.encodeFunction(STARGATE_NFT_ABI, 'unstake', [BigInt(tokenId)]),
    };

    // Send transaction
    const result = await walletClient.sendTransaction([clause]);

    return {
      success: true,
      txHash: result.hash,
      txId: result.id,
      from: walletClient.getAddress(),
      tokenId,
      contractAddress,
      explorer: walletClient.getExplorerUrl(result.hash),
      message: `Successfully unstaked StarGate NFT #${tokenId} and retrieved VET`,
    };
  }

  /**
   * View Operations
   */

  @Tool({
    name: 'get_user_stakes',
    description: 'Get all StarGate NFTs owned by a user address',
  })
  async getUserStakes(walletClient: VeChainWalletClient, parameters: GetUserStakesParameters) {
    const { address } = parameters.params;

    if (!Address.isValid(address)) {
      throw new Error('Invalid address');
    }

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Create ABI contract instance
    const stargateAbi = new ABIContract(STARGATE_NFT_ABI as any);
    const tokensOfOwnerFunction = stargateAbi.getFunction('tokensOfOwner');

    // Call tokensOfOwner function using proper VeChain SDK pattern
    const tokenIdsResult = await walletClient.executeCall(
      contractAddress,
      tokensOfOwnerFunction,
      [address]
    );

    // Handle case where user has no NFTs (result.plain might be undefined)
    if (!tokenIdsResult.result || tokenIdsResult.result.plain === undefined) {
      return {
        success: true,
        address,
        stakes: [],
        totalStakes: 0,
        message: `No StarGate NFTs found for address ${address}`,
      };
    }

    const tokenIdArray = tokenIdsResult.result.plain as any[];
    
    if (!Array.isArray(tokenIdArray)) {
      throw new Error(`Expected array from tokensOfOwner, got ${typeof tokenIdArray}: ${JSON.stringify(tokenIdArray, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value)}`);
    }

    // Get detailed info for each token
    const stakes = [];
    for (const tokenId of tokenIdArray) {
      try {
        const getTokenFunction = stargateAbi.getFunction('getToken');
        const tokenInfoResult = await walletClient.executeCall(
          contractAddress,
          getTokenFunction,
          [tokenId]
        );

        const [level, vetAmount, mintTimestamp, lastRewardClaim] = tokenInfoResult.result.plain as [number, bigint, bigint, bigint];
        const tierInfo = await this.getTierInfoFromContract(walletClient, level);
        
        stakes.push({
          tokenId: tokenId.toString(),
          level,
          tierName: tierInfo.name,
          category: tierInfo.category,
          vetAmount: (Number(vetAmount) / 1e18).toString(),
          mintTimestamp: Number(mintTimestamp),
          lastRewardClaim: Number(lastRewardClaim),
        });
      } catch (error) {
        // Failed to get info for token - continue with next token
      }
    }

    return {
      success: true,
      address,
      totalStakes: stakes.length,
      stakes,
      message: `Found ${stakes.length} StarGate NFTs for address ${address}`,
    };
  }

  @Tool({
    name: 'get_stake_info',
    description: 'Get detailed information about a specific StarGate NFT',
  })
  async getStakeInfo(walletClient: VeChainWalletClient, parameters: GetStakeInfoParameters) {
    const { tokenId } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Get token info
    const tokenInfo = await walletClient.call({
      to: contractAddress,
      data: walletClient.encodeFunction(STARGATE_NFT_ABI, 'getToken', [BigInt(tokenId)]),
    });

    const decodedInfo = walletClient.decodeCallResult(['tuple(uint8,uint256,uint256,uint256)'], tokenInfo);
    const [level, vetAmount, mintTimestamp, lastRewardClaim] = decodedInfo[0] as [number, bigint, bigint, bigint];

    // Get owner
    const ownerResult = await walletClient.call({
      to: contractAddress,
      data: walletClient.encodeFunction(STARGATE_NFT_ABI, 'ownerOf', [BigInt(tokenId)]),
    });
    const owner = walletClient.decodeCallResult(['address'], ownerResult)[0] as string;

    // Get available VTHO rewards
    const vthoRewards = await walletClient.call({
      to: contractAddress,
      data: walletClient.encodeFunction(STARGATE_NFT_ABI, 'getGeneratedVTHO', [BigInt(tokenId)]),
    });
    const availableVTHO = walletClient.decodeCallResult(['uint256'], vthoRewards)[0] as bigint;

    const tierInfo = await this.getTierInfoFromContract(walletClient, level);

    return {
      success: true,
      tokenId,
      owner,
      level,
      tierInfo,
      vetAmount: (Number(vetAmount) / 1e18).toString(),
      mintTimestamp: Number(mintTimestamp),
      lastRewardClaim: Number(lastRewardClaim),
      availableVTHO: (Number(availableVTHO) / 1e18).toString(),
      message: `StarGate NFT #${tokenId} - ${tierInfo.name} tier with ${(Number(vetAmount) / 1e18)} VET staked`,
    };
  }

  @Tool({
    name: 'claim_vtho_rewards',
    description: 'Claim accumulated VTHO rewards from a StarGate NFT',
  })
  async claimVTHORewards(walletClient: VeChainWalletClient, parameters: ClaimVTHORewardsParameters) {
    const { tokenId } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Build claim transaction clause
    const clause: TransactionClause = {
      to: contractAddress,
      value: '0x0',
      data: walletClient.encodeFunction(STARGATE_NFT_ABI, 'claimGeneratedVTHO', [BigInt(tokenId)]),
    };

    // Send transaction
    const result = await walletClient.sendTransaction([clause]);

    return {
      success: true,
      txHash: result.hash,
      txId: result.id,
      from: walletClient.getAddress(),
      tokenId,
      contractAddress,
      explorer: walletClient.getExplorerUrl(result.hash),
      message: `Successfully claimed VTHO rewards for StarGate NFT #${tokenId}`,
    };
  }

  @Tool({
    name: 'get_staking_levels',
    description: 'Get all available StarGate staking tiers and their requirements',
  })
  async getStakingLevels(walletClient: VeChainWalletClient, parameters: GetStakingLevelsParameters) {
    const { category } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_NFT', network);

    // Create ABI contract instance
    const stargateAbi = new ABIContract(STARGATE_NFT_ABI as any);
    const getLevelsFunction = stargateAbi.getFunction('getLevels');

    // Call getLevels function using proper VeChain SDK pattern
    const levelsResult = await walletClient.executeCall(
      contractAddress,
      getLevelsFunction,
      []
    );

    const levelsArray = levelsResult.result.plain as any[];
    
    if (!Array.isArray(levelsArray)) {
      throw new Error(`Expected array from getLevels, got ${typeof levelsArray}: ${JSON.stringify(levelsArray, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value)}`);
    }

    // Transform contract data to our expected format - contract returns array of objects
    let tiers = levelsArray.map((levelData) => {
      const { name, isX, id, maturityBlocks, scaledRewardFactor, vetRequired, maxSupply } = levelData;
      
      // Professional category determination based on contract data
      const category = this.determineTierCategory(name, isX, id);

      return {
        id,
        name,
        category,
        vetRequired: (Number(vetRequired) / 1e18).toString(),
        supply: Number(maxSupply),
        maturityDays: maturityBlocks > 0n ? Number(maturityBlocks) / (24 * 60 * 60) : null, // Convert blocks to days (assuming ~10s block time)
        estimatedAPY: scaledRewardFactor.toString(),
        isX,
      };
    });

    // Filter by category if specified
    if (category && category !== 'all') {
      const categoryMap = {
        'eco': 'Eco',
        'x': 'X',
        'new-eco': 'New Eco',
      };
      
      const filterCategory = categoryMap[category];
      if (filterCategory) {
        tiers = tiers.filter(tier => tier.category === filterCategory);
      }
    }

    return {
      success: true,
      category: category || 'all',
      totalTiers: tiers.length,
      tiers,
      message: `Retrieved ${tiers.length} StarGate staking tiers${category ? ` for ${category} category` : ''}`,
    };
  }

  /**
   * Delegation Operations
   */

  @Tool({
    name: 'start_delegation',
    description: 'Start delegating a StarGate NFT to earn delegation rewards',
  })
  async startDelegation(walletClient: VeChainWalletClient, parameters: StartDelegationParameters) {
    const { tokenId } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_DELEGATION', network);

    // Build start delegation transaction clause
    const clause: TransactionClause = {
      to: contractAddress,
      value: '0x0',
      data: walletClient.encodeFunction(STARGATE_DELEGATION_ABI, 'startDelegation', [BigInt(tokenId)]),
    };

    // Send transaction
    const result = await walletClient.sendTransaction([clause]);

    return {
      success: true,
      txHash: result.hash,
      txId: result.id,
      from: walletClient.getAddress(),
      tokenId,
      contractAddress,
      explorer: walletClient.getExplorerUrl(result.hash),
      message: `Successfully started delegation for StarGate NFT #${tokenId}`,
    };
  }

  @Tool({
    name: 'stop_delegation',
    description: 'Stop delegating a StarGate NFT',
  })
  async stopDelegation(walletClient: VeChainWalletClient, parameters: StopDelegationParameters) {
    const { tokenId } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_DELEGATION', network);

    // Build stop delegation transaction clause
    const clause: TransactionClause = {
      to: contractAddress,
      value: '0x0',
      data: walletClient.encodeFunction(STARGATE_DELEGATION_ABI, 'stopDelegation', [BigInt(tokenId)]),
    };

    // Send transaction
    const result = await walletClient.sendTransaction([clause]);

    return {
      success: true,
      txHash: result.hash,
      txId: result.id,
      from: walletClient.getAddress(),
      tokenId,
      contractAddress,
      explorer: walletClient.getExplorerUrl(result.hash),
      message: `Successfully stopped delegation for StarGate NFT #${tokenId}`,
    };
  }

  @Tool({
    name: 'claim_delegation_rewards',
    description: 'Claim delegation rewards for a StarGate NFT',
  })
  async claimDelegationRewards(walletClient: VeChainWalletClient, parameters: ClaimDelegationRewardsParameters) {
    const { tokenId } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_DELEGATION', network);

    // Build claim rewards transaction clause
    const clause: TransactionClause = {
      to: contractAddress,
      value: '0x0',
      data: walletClient.encodeFunction(STARGATE_DELEGATION_ABI, 'claimRewards', [BigInt(tokenId)]),
    };

    // Send transaction
    const result = await walletClient.sendTransaction([clause]);

    return {
      success: true,
      txHash: result.hash,
      txId: result.id,
      from: walletClient.getAddress(),
      tokenId,
      contractAddress,
      explorer: walletClient.getExplorerUrl(result.hash),
      message: `Successfully claimed delegation rewards for StarGate NFT #${tokenId}`,
    };
  }

  @Tool({
    name: 'get_delegation_info',
    description: 'Get delegation status and rewards for a StarGate NFT',
  })
  async getDelegationInfo(walletClient: VeChainWalletClient, parameters: GetDelegationInfoParameters) {
    const { tokenId } = parameters.params;

    const network = walletClient.getNetwork();
    const contractAddress = getStarGateContractAddress('STARGATE_DELEGATION', network);

    // Get delegation info
    const delegationInfo = await walletClient.call({
      to: contractAddress,
      data: walletClient.encodeFunction(STARGATE_DELEGATION_ABI, 'getDelegationInfo', [BigInt(tokenId)]),
    });

    const decodedInfo = walletClient.decodeCallResult(['tuple(bool,uint256,uint256)'], delegationInfo);
    const [isDelegating, delegationStart, lastRewardClaim] = decodedInfo[0] as [boolean, bigint, bigint];

    // Get available rewards
    const availableRewards = await walletClient.call({
      to: contractAddress,
      data: walletClient.encodeFunction(STARGATE_DELEGATION_ABI, 'getAvailableRewards', [BigInt(tokenId)]),
    });
    const rewards = walletClient.decodeCallResult(['uint256'], availableRewards)[0] as bigint;

    return {
      success: true,
      tokenId,
      isDelegating,
      delegationStart: Number(delegationStart),
      lastRewardClaim: Number(lastRewardClaim),
      availableRewards: (Number(rewards) / 1e18).toString(),
      message: `StarGate NFT #${tokenId} delegation status: ${isDelegating ? 'Active' : 'Inactive'}`,
    };
  }
}