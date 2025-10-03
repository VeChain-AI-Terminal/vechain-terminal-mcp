# 🔑 Environment Keys - What You Actually Need

## 🎯 The Big Answer: **NO AI KEYS NEEDED!**

Just like GOAT SDK, our VeChain MCP server **doesn't need any AI API keys**! Here's why:

## 📊 Comparison: GOAT vs Our VeChain MCP

| Component | GOAT MCP Server | Our VeChain MCP Server |
|-----------|-----------------|------------------------|
| **AI Intelligence** | Claude Desktop | Claude Desktop |
| **Required Keys** | `WALLET_PRIVATE_KEY` + `RPC_PROVIDER_URL` | `WALLET_PRIVATE_KEY` + `VECHAIN_NETWORK` |
| **Optional Keys** | None | VeChainStats, VeBetter, etc. |
| **AI API Keys** | ❌ None | ❌ None |

## 🔍 GOAT's Minimal Setup

Looking at GOAT's MCP configuration:

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

**That's it!** Just wallet + RPC.

## 🚀 Our VeChain Minimal Setup

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

**Even simpler!** Just wallet + network (we handle RPC internally).

## ❓ Why No AI Keys?

1. **Claude Desktop** provides the AI intelligence
2. **MCP Server** only provides blockchain tools
3. **No OpenAI/Claude API keys** needed in the server
4. **Same architecture** as GOAT SDK

## 🔧 Optional Enhancement Keys

These are **optional** for enhanced features:

- `VECHAINSTATS_API_KEY` - Enhanced blockchain data
- `VEBETTER_*` - Sustainability rewards features
- `WALLET_MNEMONIC` - Alternative to private key

## 🎉 Bottom Line

**You only need:**
- ✅ `WALLET_PRIVATE_KEY` (your VeChain wallet)
- ✅ `VECHAIN_NETWORK` (testnet/mainnet)

**Everything else is optional!**

This matches GOAT's approach perfectly - minimal setup, maximum functionality! 🚀

