/**
 * Official StarGate Token Levels Configuration
 * Based on stargate-contracts/packages/config/contracts/StargateNFT/
 */

export enum TokenLevelId {
  None = 0,
  Strength = 1,
  Thunder = 2,
  Mjolnir = 3,
  VeThorX = 4,
  StrengthX = 5,
  ThunderX = 6,
  MjolnirX = 7,
  Dawn = 8,
  Lightning = 9,
  Flash = 10,
}

export interface TokenLevel {
  id: TokenLevelId;
  name: string;
  isX: boolean;
  vetAmountRequiredToStake: string; // in wei string format
  scaledRewardFactor: number;
  maturityBlocks: number;
  cap: number;
  circulatingSupply: number;
}

const BLOCKS_PER_DAY = 8640; // 10 second block time on VeChain

/**
 * Official StarGate token levels for mainnet
 */
export const STARGATE_LEVELS: Record<TokenLevelId, TokenLevel> = {
  [TokenLevelId.None]: {
    id: TokenLevelId.None,
    name: "None",
    isX: false,
    vetAmountRequiredToStake: "0",
    scaledRewardFactor: 0,
    maturityBlocks: 0,
    cap: 0,
    circulatingSupply: 0,
  },
  // Legacy normal levels
  [TokenLevelId.Strength]: {
    id: TokenLevelId.Strength,
    name: "Strength",
    isX: false,
    vetAmountRequiredToStake: "1000000000000000000000000", // 1M VET
    scaledRewardFactor: 150,
    maturityBlocks: BLOCKS_PER_DAY * 30,
    cap: 1382,
    circulatingSupply: 0,
  },
  [TokenLevelId.Thunder]: {
    id: TokenLevelId.Thunder,
    name: "Thunder",
    isX: false,
    vetAmountRequiredToStake: "5000000000000000000000000", // 5M VET
    scaledRewardFactor: 250,
    maturityBlocks: BLOCKS_PER_DAY * 45,
    cap: 234,
    circulatingSupply: 0,
  },
  [TokenLevelId.Mjolnir]: {
    id: TokenLevelId.Mjolnir,
    name: "Mjolnir",
    isX: false,
    vetAmountRequiredToStake: "15000000000000000000000000", // 15M VET
    scaledRewardFactor: 350,
    maturityBlocks: BLOCKS_PER_DAY * 60,
    cap: 13,
    circulatingSupply: 0,
  },
  // Legacy X Levels
  [TokenLevelId.VeThorX]: {
    id: TokenLevelId.VeThorX,
    name: "VeThorX",
    isX: true,
    vetAmountRequiredToStake: "600000000000000000000000", // 600K VET
    scaledRewardFactor: 200,
    maturityBlocks: 0,
    cap: 0,
    circulatingSupply: 0,
  },
  [TokenLevelId.StrengthX]: {
    id: TokenLevelId.StrengthX,
    name: "StrengthX",
    isX: true,
    vetAmountRequiredToStake: "1600000000000000000000000", // 1.6M VET
    scaledRewardFactor: 300,
    maturityBlocks: 0,
    cap: 0,
    circulatingSupply: 0,
  },
  [TokenLevelId.ThunderX]: {
    id: TokenLevelId.ThunderX,
    name: "ThunderX",
    isX: true,
    vetAmountRequiredToStake: "5600000000000000000000000", // 5.6M VET
    scaledRewardFactor: 400,
    maturityBlocks: 0,
    cap: 0,
    circulatingSupply: 0,
  },
  [TokenLevelId.MjolnirX]: {
    id: TokenLevelId.MjolnirX,
    name: "MjolnirX",
    isX: true,
    vetAmountRequiredToStake: "15600000000000000000000000", // 15.6M VET
    scaledRewardFactor: 500,
    maturityBlocks: 0,
    cap: 0,
    circulatingSupply: 0,
  },
  // New levels
  [TokenLevelId.Dawn]: {
    id: TokenLevelId.Dawn,
    name: "Dawn",
    isX: false,
    vetAmountRequiredToStake: "10000000000000000000000", // 10K VET
    scaledRewardFactor: 100,
    maturityBlocks: BLOCKS_PER_DAY * 2,
    cap: 500000,
    circulatingSupply: 0,
  },
  [TokenLevelId.Lightning]: {
    id: TokenLevelId.Lightning,
    name: "Lightning",
    isX: false,
    vetAmountRequiredToStake: "50000000000000000000000", // 50K VET
    scaledRewardFactor: 115,
    maturityBlocks: BLOCKS_PER_DAY * 5,
    cap: 100000,
    circulatingSupply: 0,
  },
  [TokenLevelId.Flash]: {
    id: TokenLevelId.Flash,
    name: "Flash",
    isX: false,
    vetAmountRequiredToStake: "200000000000000000000000", // 200K VET
    scaledRewardFactor: 130,
    maturityBlocks: BLOCKS_PER_DAY * 15,
    cap: 25000,
    circulatingSupply: 0,
  },
};

/**
 * Get level info by ID
 */
export function getStarGateLevel(levelId: TokenLevelId): TokenLevel {
  const level = STARGATE_LEVELS[levelId];
  if (!level) {
    throw new Error(`StarGate level ${levelId} not found`);
  }
  return level;
}

/**
 * Get all available levels (excluding None)
 */
export function getAllStarGateLevels(): TokenLevel[] {
  return Object.values(STARGATE_LEVELS).filter(level => level.id !== TokenLevelId.None);
}

/**
 * Format VET amount for display
 */
export function formatVETAmount(weiAmount: string): string {
  const vet = BigInt(weiAmount) / BigInt('1000000000000000000');
  return vet.toLocaleString();
}