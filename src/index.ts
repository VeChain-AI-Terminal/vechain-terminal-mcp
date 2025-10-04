import 'reflect-metadata';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { getOnChainTools } from './adapters/mcp/adapter.js';
import { VeChainWalletClient } from './wallet/VeChainWalletClient.js';
import { token } from './plugins/token/token.plugin.js';
import { vechainstats } from './plugins/vechainstats/vechainstats.plugin.js';
import { stargate } from './plugins/stargate/stargate.plugin.js';
import { bridge } from './plugins/bridge/bridge.plugin.js';
import { vebetter } from './plugins/vebetter/vebetter.plugin.js';
import { dex } from './plugins/dex/dex.plugin.js';
import { nft } from './plugins/nft/nft.plugin.js';
import type { NetworkType } from './registry/networks.js';

// Load environment variables
dotenv.config();

/**
 * VeChain MCP Server
 * Provides blockchain operations through the Model Context Protocol
 */
async function main() {
  // Validate required environment variables
  const network = (process.env.VECHAIN_NETWORK || 'testnet') as NetworkType;
  
  if (!process.env.WALLET_MNEMONIC && !process.env.WALLET_PRIVATE_KEY) {
    console.error('Error: Either WALLET_MNEMONIC or WALLET_PRIVATE_KEY must be set');
    process.exit(1);
  }

  console.error('🚀 Initializing VeChain MCP Server...');
  console.error(`📡 Network: ${network}`);

  // Create VeChain wallet client
  const walletClient = new VeChainWalletClient({
    mnemonic: process.env.WALLET_MNEMONIC,
    privateKey: process.env.WALLET_PRIVATE_KEY,
    network,
  });

  console.error(`💼 Wallet: ${walletClient.getAddress()}`);

  // Get tools from plugins
  const toolsPromise = getOnChainTools({
    wallet: walletClient,
    plugins: [
      token(),           // VET and VIP-180 token operations
      vechainstats(),    // Simplified blockchain analytics
      stargate(),        // StarGate NFT staking and delegation
      bridge(),          // WanBridge cross-chain transfers
      vebetter(),        // VeBetter DAO rewards
      dex(),             // DEX swaps (VeSwap, BetterSwap, etc.)
      nft(),             // NFT operations (mint, transfer, query)
    ],
  });

  // Create MCP server
  const server = new Server(
    {
      name: 'vechain-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool list requests
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const { listOfTools } = await toolsPromise;
    const tools = listOfTools();
    console.error(`📋 Available tools: ${tools.length}`);
    return {
      tools,
    };
  });

  // Handle tool execution requests
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { toolHandler } = await toolsPromise;
    console.error(`🔧 Executing tool: ${request.params.name}`);
    
    try {
      const result = await toolHandler(request.params.name, request.params.arguments);
      console.error(`✅ Tool ${request.params.name} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Tool ${request.params.name} failed:`, error);
      throw new Error(`Tool ${request.params.name} failed: ${error}`);
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('✨ VeChain MCP Server running on stdio');
  console.error('🎯 Ready to receive requests from Claude Desktop');
}

main().catch((error) => {
  console.error('💥 Fatal error in main():', error);
  process.exit(1);
});

