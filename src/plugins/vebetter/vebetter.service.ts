import { Tool } from '../../core/Tool.decorator.js';
import { createToolParameters } from '../../utils/createToolParameters.js';
import { z } from 'zod';
import { VeChainWalletClient } from '../../wallet/VeChainWalletClient.js';
import { getContractAddress } from '../../registry/contracts.js';
import { Clause, Address, ABIContract } from '@vechain/sdk-core';

type FunctionFragment = {
  name: string;
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ name: string; type: string }>;
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  type: 'function';
};

/**
 * VeBetter DAO Integration Service
 * Based on the Learn2Earn implementation from the hackathon resources
 */

// Tool Parameters
const SubmitActionParameters = createToolParameters(
  z.object({
    appId: z.string().describe('VeBetter App ID (bytes32 format)'),
    description: z.string().describe('Description of the sustainable action'),
    proofType: z.enum(['image', 'link', 'location', 'text', 'json']).describe('Type of proof'),
    proofValue: z.string().describe('The proof data (URL, text, or JSON)'),
    impactCodes: z.array(z.string()).optional().describe('Impact category codes (e.g., waste_mass, steps, co2_saved)'),
    impactValues: z.array(z.string()).optional().describe('Impact values corresponding to codes'),
  })
);

const CheckRewardsParameters = createToolParameters(
  z.object({
    appId: z.string().describe('VeBetter App ID'),
    userAddress: z.string().optional().describe('User address to check (defaults to wallet address)'),
  })
);

const ClaimRewardsParameters = createToolParameters(
  z.object({
    appId: z.string().describe('VeBetter App ID'),
    amount: z.string().describe('Amount of B3TR tokens to claim'),
  })
);

const GetAvailableFundsParameters = createToolParameters(
  z.object({
    appId: z.string().describe('VeBetter App ID'),
  })
);

const GetAppInfoParameters = createToolParameters(
  z.object({
    appId: z.string().describe('VeBetter App ID'),
  })
);

const GetImpactCategoriesParameters = createToolParameters(
  z.object({}) // No parameters needed
);

export class VeBetterService {
  private network: 'mainnet' | 'testnet';

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
  }

  @Tool({
    name: 'vebetter_submit_action',
    description: 'Submit a sustainable action to a VeBetter app for rewards',
  })
  async submitAction(
    walletClient: VeChainWalletClient,
    parameters: InstanceType<typeof SubmitActionParameters>
  ) {
    try {
      const { appId, description, proofType, proofValue, impactCodes, impactValues } = parameters.params;

      // Build the proof JSON structure (Version 2 format)
      const proof = {
        version: 2,
        description: description,
        proof: {
          [proofType]: proofValue,
          timestamp: Math.floor(Date.now() / 1000)
        },
        impact: impactCodes && impactValues ? 
          Object.fromEntries(impactCodes.map((code, i) => [code, impactValues[i]])) : 
          {}
      };

      const proofString = JSON.stringify(proof);

      // Get the rewards pool contract
      const rewardsPoolAddress = getContractAddress('REWARDS_POOL', this.network);

      // Build the distributeReward function ABI
      const distributeRewardABI: FunctionFragment = {
        name: 'distributeReward',
        inputs: [
          { name: 'appId', type: 'bytes32' },
          { name: 'amount', type: 'uint256' },
          { name: 'receiver', type: 'address' },
          { name: 'proof', type: 'string' }
        ],
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      };

      // For testnet, we'll use a default reward amount
      const rewardAmount = '10000000000000000000'; // 10 B3TR tokens

      const userAddress = await walletClient.getAddress();

      // Build the transaction clause
      const abi = new ABIContract([distributeRewardABI]);
      const clause = Clause.callFunction(
        Address.of(rewardsPoolAddress),
        abi.getFunction('distributeReward'),
        [appId, rewardAmount, userAddress, proofString]
      );

      // Send the transaction
      const { hash } = await walletClient.sendTransaction([{
        to: clause.to!,
        value: clause.value!,
        data: clause.data!
      }]);

      return {
        success: true,
        txHash: hash,
        message: `Sustainable action submitted successfully`,
        appId: appId,
        proof: proof,
        estimatedReward: '10 B3TR',
        explorer: `https://${this.network === 'testnet' ? 'explore-testnet' : 'explore'}.vechain.org/transactions/${hash}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to submit action'
      };
    }
  }

  @Tool({
    name: 'vebetter_check_available_funds',
    description: 'Check available B3TR funds in the rewards pool for an app',
  })
  async checkAvailableFunds(
    walletClient: VeChainWalletClient,
    parameters: InstanceType<typeof GetAvailableFundsParameters>
  ) {
    try {
      const { appId } = parameters.params;
      
      const rewardsPoolAddress = getContractAddress('REWARDS_POOL', this.network);

      // Build the availableFunds function ABI
      const availableFundsABI: FunctionFragment = {
        name: 'availableFunds',
        inputs: [{ name: 'appId', type: 'bytes32' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      };

      // Query the contract
      const thor = (walletClient as any).thor; // Access Thor client
      const contract = thor.contracts.get(rewardsPoolAddress, [availableFundsABI]);
      const result = await contract.methods.availableFunds(appId).call();

      const availableFunds = result.decoded[0];
      const availableB3TR = (BigInt(availableFunds) / BigInt(10 ** 18)).toString();

      return {
        success: true,
        appId: appId,
        availableFunds: availableFunds.toString(),
        availableB3TR: `${availableB3TR} B3TR`,
        rewardsPoolAddress: rewardsPoolAddress,
        message: availableFunds > 0 ? 
          `${availableB3TR} B3TR tokens available for rewards` :
          'No funds currently available in the rewards pool'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check available funds'
      };
    }
  }

  @Tool({
    name: 'vebetter_get_app_info',
    description: 'Get information about a VeBetter app',
  })
  async getAppInfo(
    walletClient: VeChainWalletClient,
    parameters: InstanceType<typeof GetAppInfoParameters>
  ) {
    try {
      const { appId } = parameters.params;
      
      const appsRegistryAddress = getContractAddress('APPS_REGISTRY', this.network);

      // Build the getApp function ABI
      const getAppABI: FunctionFragment = {
        name: 'getApp',
        inputs: [{ name: 'appId', type: 'bytes32' }],
        outputs: [
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'active', type: 'bool' }
        ],
        stateMutability: 'view',
        type: 'function'
      };

      // Query the contract
      const thor = (walletClient as any).thor; // Access Thor client
      const contract = thor.contracts.get(appsRegistryAddress, [getAppABI]);
      
      try {
        const result = await contract.methods.getApp(appId).call();
        
        return {
          success: true,
          app: {
            id: appId,
            name: result.decoded[0],
            description: result.decoded[1],
            active: result.decoded[2],
            registryAddress: appsRegistryAddress
          }
        };
      } catch {
        // App might not be registered
        return {
          success: false,
          error: 'App not found in VeBetter registry',
          suggestion: 'Make sure the app ID is correct and the app is registered'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get app info'
      };
    }
  }

  @Tool({
    name: 'vebetter_claim_rewards',
    description: 'Claim accumulated B3TR rewards from a VeBetter app',
  })
  async claimRewards(
    walletClient: VeChainWalletClient,
    parameters: InstanceType<typeof ClaimRewardsParameters>
  ) {
    try {
      const { appId, amount } = parameters.params;
      const userAddress = await walletClient.getAddress();

      // Get the rewards pool contract
      const rewardsPoolAddress = getContractAddress('REWARDS_POOL', this.network);

      // Build the claim function ABI (simplified version)
      const claimRewardsABI: FunctionFragment = {
        name: 'claimRewards',
        inputs: [
          { name: 'appId', type: 'bytes32' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      };

      // Convert amount to Wei (B3TR has 18 decimals)
      const amountWei = (BigInt(amount) * BigInt(10 ** 18)).toString();

      // Build the transaction clause
      const abi = new ABIContract([claimRewardsABI]);
      const clause = Clause.callFunction(
        Address.of(rewardsPoolAddress),
        abi.getFunction('claimRewards'),
        [appId, amountWei]
      );

      // Send the transaction
      const { hash } = await walletClient.sendTransaction([{
        to: clause.to!,
        value: clause.value!,
        data: clause.data!
      }]);

      return {
        success: true,
        txHash: hash,
        message: `Successfully claimed ${amount} B3TR tokens`,
        appId: appId,
        amount: amount,
        recipient: userAddress,
        explorer: `https://${this.network === 'testnet' ? 'explore-testnet' : 'explore'}.vechain.org/transactions/${hash}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to claim rewards'
      };
    }
  }

  @Tool({
    name: 'vebetter_get_impact_categories',
    description: 'Get list of valid impact categories for VeBetter submissions',
  })
  async getImpactCategories(parameters: InstanceType<typeof GetImpactCategoriesParameters>) {
    // Standard impact categories recognized by VeBetter DAO
    return {
      success: true,
      categories: [
        { code: 'waste_mass', description: 'Waste recycled or reduced (kg)', unit: 'kg' },
        { code: 'co2_saved', description: 'CO2 emissions saved', unit: 'kg CO2' },
        { code: 'steps', description: 'Steps walked', unit: 'steps' },
        { code: 'distance_km', description: 'Distance traveled sustainably', unit: 'km' },
        { code: 'energy_saved', description: 'Energy saved', unit: 'kWh' },
        { code: 'water_saved', description: 'Water conserved', unit: 'liters' },
        { code: 'trees_planted', description: 'Trees planted', unit: 'count' },
        { code: 'plastic_avoided', description: 'Single-use plastic avoided', unit: 'items' },
        { code: 'public_transport', description: 'Public transport used', unit: 'trips' },
        { code: 'bike_rides', description: 'Bike rides completed', unit: 'rides' },
        { code: 'education_hours', description: 'Sustainability education', unit: 'hours' },
        { code: 'community_actions', description: 'Community actions participated', unit: 'count' }
      ],
      usage: 'Include these codes in impactCodes parameter when submitting actions'
    };
  }

  @Tool({
    name: 'vebetter_example_submissions',
    description: 'Get example submissions for different sustainable actions',
  })
  async getExampleSubmissions(parameters: InstanceType<typeof GetImpactCategoriesParameters>) {
    return {
      success: true,
      examples: [
        {
          action: 'Walking instead of driving',
          submission: {
            description: 'Walked 5km to work instead of driving',
            proofType: 'image',
            proofValue: 'https://example.com/walk-proof.jpg',
            impactCodes: ['steps', 'distance_km', 'co2_saved'],
            impactValues: ['6500', '5', '2.3']
          }
        },
        {
          action: 'Recycling plastic',
          submission: {
            description: 'Recycled 2kg of plastic bottles',
            proofType: 'image',
            proofValue: 'https://example.com/recycling.jpg',
            impactCodes: ['waste_mass', 'plastic_avoided'],
            impactValues: ['2', '40']
          }
        },
        {
          action: 'Using public transport',
          submission: {
            description: 'Used metro for daily commute',
            proofType: 'location',
            proofValue: 'Metro Station Central',
            impactCodes: ['public_transport', 'co2_saved'],
            impactValues: ['2', '4.5']
          }
        },
        {
          action: 'Learning about sustainability',
          submission: {
            description: 'Completed VeChain sustainability course',
            proofType: 'link',
            proofValue: 'https://learn.vechain.org/certificate/abc123',
            impactCodes: ['education_hours'],
            impactValues: ['2']
          }
        }
      ]
    };
  }
}
