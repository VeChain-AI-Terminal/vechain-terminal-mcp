import { z } from 'zod';
import { createToolParameters } from '../../utils/createToolParameters.js';

/**
 * StarGate Staking Parameters
 */

export class StakeVETParameters extends createToolParameters(
  z.object({
    levelId: z.number().min(1).max(10).describe('StarGate tier level ID (1-10)'),
    autoDelegate: z.boolean().optional().describe('Auto-delegate for additional rewards (optional)'),
  })
) {}

export class StakeAndDelegateVETParameters extends createToolParameters(
  z.object({
    level: z.number().min(1).max(10).describe('StarGate tier level (1-10)'),
    amount: z.string().describe('Amount of VET to stake'),
    delegatee: z.string().describe('Address to delegate to (for future validator delegation)'),
  })
) {}

export class UnstakeVETParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to unstake'),
  })
) {}

export class GetUserStakesParameters extends createToolParameters(
  z.object({
    address: z.string().describe('User address to check stakes for'),
  })
) {}

export class GetStakeInfoParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to get info for'),
  })
) {}

export class ClaimVTHORewardsParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to claim rewards for'),
  })
) {}

/**
 * StarGate Delegation Parameters
 */

export class StartDelegationParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to start delegating'),
  })
) {}

export class StopDelegationParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to stop delegating'),
  })
) {}

export class ClaimDelegationRewardsParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to claim delegation rewards for'),
  })
) {}

export class GetDelegationInfoParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to get delegation info for'),
  })
) {}

/**
 * StarGate Migration Parameters
 */

export class MigrateLegacyNodeParameters extends createToolParameters(
  z.object({
    legacyTokenId: z.string().describe('Legacy VeChain Node token ID to migrate'),
  })
) {}

export class MigrateAndDelegateParameters extends createToolParameters(
  z.object({
    legacyTokenId: z.string().describe('Legacy VeChain Node token ID to migrate'),
    delegatee: z.string().describe('Address to delegate to after migration'),
  })
) {}

/**
 * StarGate Node Management Parameters
 */

export class SetNodeManagerParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to set manager for'),
    manager: z.string().describe('Address to set as manager'),
  })
) {}

export class RemoveNodeManagerParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to remove manager from'),
  })
) {}

export class GetNodeManagerParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('StarGate NFT token ID to get manager for'),
  })
) {}

/**
 * StarGate View Parameters
 */

export class GetStakingLevelsParameters extends createToolParameters(
  z.object({
    category: z.enum(['all', 'eco', 'x', 'new-eco']).optional().describe('Filter tiers by category'),
  })
) {}

/**
 * Additional StarGate View Parameters
 */

export class GetLevelSupplyParameters extends createToolParameters(
  z.object({
    levelId: z.number().min(0).max(10).describe('Level ID to get supply info for'),
  })
) {}

export class GetIdsOwnedByParameters extends createToolParameters(
  z.object({
    address: z.string().describe('Address to get owned token IDs for'),
  })
) {}

export class CanTransferParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('Token ID to check transfer eligibility'),
  })
) {}

export class GetMaturityEndBlockParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('Token ID to get maturity end block for'),
  })
) {}

export class IsUnderMaturityParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('Token ID to check if under maturity period'),
  })
) {}

export class GetTokenLevelParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('Token ID to get level for'),
  })
) {}

export class TokenExistsParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('Token ID to check existence'),
  })
) {}

export class UnstakeParameters extends createToolParameters(
  z.object({
    tokenId: z.string().describe('Token ID to unstake'),
  })
) {}