# 🔑 API Keys Guide - VeChain MCP Server

## 🎯 Key Finding: **NO AI API KEYS NEEDED!**

Unlike other AI frameworks, **MCP servers don't require AI API keys** because:

- **Claude Desktop** provides the AI intelligence
- **MCP Server** just provides tools/functions
- **No OpenAI/Claude API keys** required for the server itself

## 📋 Required Environment Variables

### ✅ **Essential (Required)**
```bash
# Wallet (choose one)
WALLET_PRIVATE_KEY=your_private_key_hex_without_0x_prefix
# OR
WALLET_MNEMONIC=your twelve word mnemonic phrase here

# Network
VECHAIN_NETWORK=testnet  # or mainnet
```

### 🔧 **Optional (Enhanced Features)**
```bash
# VeChainStats API (for rich blockchain data)
VECHAINSTATS_API_KEY=your_vechainstats_api_key_here

# VeBetter DAO (for sustainability rewards)
VEBETTER_REWARDS_POOL_ADDRESS=0x...
VEBETTER_B3TR_TOKEN_ADDRESS=0x...
VEBETTER_APPS_REGISTRY_ADDRESS=0x...
VEBETTER_APP_ID=your_app_id

# WanBridge (for cross-chain transfers)
BRIDGE_API_URL=https://bridge-api.wanchain.org/api
```

## 🔍 Comparison: GOAT vs Our VeChain MCP

| Component | GOAT SDK | VeChain MCP | Required? |
|-----------|----------|-------------|-----------|
| **AI API Keys** | ❌ None | ❌ None | No |
| **Wallet Private Key** | ✅ Required | ✅ Required | Yes |
| **RPC Provider URL** | ✅ Required | ✅ Built-in | No |
| **Protocol API Keys** | 🔧 Optional | 🔧 Optional | No |

## 🚀 GOAT's Approach

GOAT's MCP server only needs:
```json
{
    "mcpServers": {
        "goat-evm": {
            "command": "node",
            "args": ["/path/to/build/evm.js"],
            "env": {
                "WALLET_PRIVATE_KEY": "<YOUR_PRIVATE_KEY>",
                "RPC_PROVIDER_URL": "<YOUR_RPC_PROVIDER_URL>"
            }
        }
    }
}
```

## 🎯 Our Approach (Simplified)

Our VeChain MCP server needs even less:
```json
{
    "mcpServers": {
        "vechain-mcp": {
            "command": "node",
            "args": ["/path/to/dist/index.js"],
            "env": {
                "WALLET_PRIVATE_KEY": "<YOUR_PRIVATE_KEY>",
                "VECHAIN_NETWORK": "testnet"
            }
        }
    }
}
```

## 🔑 Where to Get Optional API Keys

### VeChainStats API
- **URL**: https://vechainstats.com/account
- **Free tier**: Available
- **Usage**: Enhanced blockchain data, prices, analytics
- **Required**: Attribution "Powered by vechainstats.com APIs"

### VeBetter DAO
- **Purpose**: Sustainability rewards and B3TR tokens
- **Setup**: Register your app in VeBetter DAO
- **Usage**: Submit sustainable actions, claim rewards

### WanBridge
- **Purpose**: Cross-chain token transfers
- **API**: Built-in, no key required
- **Usage**: Bridge VET between VeChain and other chains

## ✅ Minimal Setup (Just Works)

For basic functionality, you only need:
```bash
WALLET_PRIVATE_KEY=your_key_here
VECHAIN_NETWORK=testnet
```

That's it! No AI keys, no API keys, no complex setup. 🎉

## 🎮 Test Commands

Once set up with minimal config:
- *"Check my VET balance"* ✅
- *"Transfer 10 VET to 0x..."* ✅
- *"Show me VeChain network stats"* ✅
- *"Get token prices"* (needs VeChainStats API key)
- *"Submit sustainable action"* (needs VeBetter setup)

---

**Bottom Line**: MCP servers are tool providers, not AI consumers. Claude Desktop handles the AI, we just provide blockchain tools! 🚀

