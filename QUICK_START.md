# 🚀 VeChain MCP Server - Quick Start

## Option 1: Install via Smithery (Recommended)

```bash
# Install dependencies and build
pnpm install
pnpm build

# Install to Claude Desktop via Smithery
npx -y @smithery/cli install . --client claude

# Restart Claude Desktop and start chatting!
```

## Option 2: Manual Setup

```bash
# 1. Build the server
pnpm install
pnpm build

# 2. Run the setup script
pnpm run setup-claude

# 3. Edit the configuration file with your wallet details
# ~/Library/Application Support/Claude/claude_desktop_config.json

# 4. Restart Claude Desktop
```

## Option 3: Test MCP Server Directly

```bash
# Test the MCP server in isolation
pnpm run test-mcp

# Or run with environment variables
WALLET_PRIVATE_KEY="your_key" VECHAIN_NETWORK="testnet" node dist/index.js
```

## 🎯 Example Commands to Try

Once set up, chat with Claude:

- *"Check my VET balance"*
- *"Transfer 10 VET to 0x..."*
- *"Get a quote for swapping VET to VTHO"*
- *"Show me VeChain network stats"*
- *"Bridge 100 VET from VeChain to Ethereum"*
- *"Submit a sustainable action: I walked 5km to work"*

## ⚙️ Configuration

Edit your configuration in `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "vechain-mcp": {
            "command": "node",
            "args": ["/path/to/vechain-mcp-server/dist/index.js"],
            "env": {
                "WALLET_PRIVATE_KEY": "your_private_key_here",
                "VECHAIN_NETWORK": "testnet",
                "VECHAINSTATS_API_KEY": "optional_api_key"
            }
        }
    }
}
```

## 🔧 Troubleshooting

- **"Tool not found"**: Restart Claude Desktop after configuration changes
- **"Invalid address"**: Ensure VeChain addresses are properly formatted  
- **"Insufficient balance"**: Check VET balance for gas fees
- **"Network error"**: Verify RPC endpoint connectivity

## 🎉 You're Ready!

Your VeChain AI SuperApp is now connected to Claude Desktop with 90+ blockchain tools!

