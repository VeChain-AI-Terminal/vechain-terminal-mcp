# VeChain MCP Server - Claude Desktop Setup Guide

## 🚀 Quick Setup

This guide will connect your VeChain MCP server to Claude Desktop using the Model Context Protocol.

## Prerequisites

1. **Claude Desktop** installed - Download from [claude.ai/download](https://claude.ai/download)
2. **Your VeChain MCP Server** built and ready
3. **VeChain wallet** (mnemonic or private key)

## Step 1: Build Your MCP Server

```bash
cd /Users/apple/dev/hackathon/vchain/vechain-mcp-server
pnpm install
pnpm run build
```

## Step 2: Create Environment Configuration

Create a `.env` file in your MCP server directory:

```bash
# VeChain Network Configuration
VECHAIN_NETWORK=testnet  # or 'mainnet'

# Wallet Configuration (choose one)
WALLET_MNEMONIC="your twelve word mnemonic phrase here"
# OR
WALLET_PRIVATE_KEY="0x1234..."

# Optional: DEX Router Addresses
VESWAP_ROUTER_TESTNET="0x..."
BETTERSWAP_ROUTER_TESTNET="0x..."
```

## Step 3: Configure Claude Desktop

### Option A: Manual Configuration

1. **Create the config directory** (if it doesn't exist):
```bash
mkdir -p ~/Library/Application\ Support/Claude/
```

2. **Create or update** `claude_desktop_config.json`:
```bash
cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "vechain-mcp-server": {
      "command": "node",
      "args": ["/Users/apple/dev/hackathon/vchain/vechain-mcp-server/dist/index.js"],
      "env": {
        "VECHAIN_NETWORK": "testnet",
        "WALLET_MNEMONIC": "denial kitchen pet squirrel other broom bar gas better priority spoil cross"
      }
    }
  }
}
EOF
```

### Option B: Copy Pre-configured File

```bash
# Use the config file we created
cp /Users/apple/dev/hackathon/vchain/vechain-mcp-server/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## Step 4: Update Wallet Credentials

Edit the Claude config file to add your actual wallet:

```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Replace the mnemonic with your actual wallet mnemonic or add your private key.

## Step 5: Test the Server

Before connecting to Claude, test your server works:

```bash
cd /Users/apple/dev/hackathon/vchain/vechain-mcp-server
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js
```

## Step 6: Restart Claude Desktop

1. **Quit Claude Desktop** completely (Cmd+Q)
2. **Restart Claude Desktop**
3. Look for the hammer icon (🔨) indicating MCP tools are available

## Step 7: Test in Claude

Try these commands in Claude Desktop:

### Basic Wallet Operations
```
What's my VeChain wallet address?
What's my VET and VTHO balance?
```

### VeChainStats Queries
```
Show me the top 10 VeChain accounts by VET balance
Get information about the VeBetter DAO B3TR token
```

### DEX Operations
```
Get a quote to swap 100 VET for VTHO on VeSwap
Show me available DEX pairs for USDT
```

### NFT Operations
```
Show me all NFT collections on VeChain
Check who owns token #1 from contract 0x...
```

### Bridge Operations
```
Get available cross-chain token pairs for VeChain
Get a quote to bridge 100 USDT from VeChain to Ethereum
```

## Available Tools (50+ tools)

Your VeChain MCP server provides these tool categories:

### 🏦 **Core Wallet Tools**
- `get_wallet_address` - Get connected wallet address
- `get_balance` - Get VET/VTHO balances
- `sign_message` - Sign messages with wallet

### 💰 **Token Tools** 
- `token_transfer` - Send VET/VIP-180 tokens
- `token_get_info` - Get token metadata
- `token_get_balance` - Check token balances

### 📊 **VeChainStats Analytics** (15+ tools)
- `vechainstats_get_accounts` - Top accounts data
- `vechainstats_get_dex_trades` - DEX trading history  
- `vechainstats_get_nft_list` - NFT collections
- `vechainstats_get_burns` - Token burn data
- And many more...

### 🔄 **DEX Trading** (7 tools)
- `dex_get_swap_quote` - Get swap quotes
- `dex_execute_swap` - Execute token swaps
- `dex_get_pair_reserves` - Pool liquidity data
- `dex_get_available_dexes` - Supported DEXes

### 🌉 **Cross-Chain Bridge** (12 tools)
- `bridge_get_token_pairs` - Available bridge pairs
- `bridge_get_quota_and_fee` - Bridge limits and fees
- `bridge_create_transaction` - Create bridge transactions
- `xflows_get_quote` - Cross-chain swap quotes

### 🎨 **NFT Operations** (13 tools)
- `nft_mint` - Mint new NFTs
- `nft_transfer` - Transfer NFTs
- `nft_get_metadata` - Get NFT metadata
- `nft_get_owned_tokens` - Check NFT ownership

### 🏛️ **VeBetter DAO** (8 tools)
- `vebetter_get_rewards` - Check B3TR rewards
- `vebetter_get_apps` - VeBetter applications
- `vebetter_claim_rewards` - Claim B3TR tokens

## Troubleshooting

### Claude doesn't show the hammer icon
1. Check the config file path: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Validate JSON syntax with: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .`
3. Check file permissions: `ls -la ~/Library/Application\ Support/Claude/`
4. Restart Claude Desktop completely

### Server fails to start
1. Test the build: `node /Users/apple/dev/hackathon/vchain/vechain-mcp-server/dist/index.js`
2. Check wallet configuration in the env section
3. Verify network connectivity for VeChain testnet

### Tools not working
1. Check wallet has VTHO for gas fees
2. Verify network (testnet vs mainnet) configuration
3. Check VeChainStats API availability

### Check Claude Logs
```bash
# macOS Claude logs location
tail -f ~/Library/Logs/Claude/mcp-server-vechain-mcp-server.log
```

## Security Notes

- Never commit private keys or mnemonics to version control
- Use testnet for development and testing
- Keep your wallet secure and backed up
- The example mnemonic provided is for testing only

## Success! 🎉

When working correctly, you'll have:
- ✅ Hammer icon in Claude Desktop
- ✅ 50+ VeChain tools available
- ✅ Full blockchain interaction capabilities
- ✅ Cross-chain bridging features
- ✅ DEX trading functionality
- ✅ NFT minting and transfers
- ✅ VeBetter DAO integration

Your VeChain AI SuperApp is now ready to use with Claude Desktop!