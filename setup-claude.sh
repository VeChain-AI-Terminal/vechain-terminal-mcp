#!/bin/bash

# VeChain MCP Server - Claude Desktop Setup Script
# This script automates the configuration of VeChain MCP Server for Claude Desktop

set -e

echo "🚀 Setting up VeChain MCP Server for Claude Desktop..."

# Check if Claude Desktop is installed
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo "❌ Claude Desktop not found. Please install Claude Desktop first:"
    echo "   https://claude.ai/download"
    exit 1
fi

# Get current directory (should be vechain-mcp-server)
CURRENT_DIR=$(pwd)
DIST_PATH="$CURRENT_DIR/dist/index.js"

# Check if dist/index.js exists
if [ ! -f "$DIST_PATH" ]; then
    echo "❌ Built MCP server not found. Building now..."
    pnpm build
fi

echo "📁 Current directory: $CURRENT_DIR"
echo "📄 MCP server path: $DIST_PATH"

# Create configuration
echo "⚙️  Creating Claude Desktop configuration..."

cat > mcp-vechain.json << EOF
{
    "mcpServers": {
        "vechain-mcp": {
            "command": "node",
            "args": ["$DIST_PATH"],
            "env": {
                "WALLET_PRIVATE_KEY": "<YOUR_PRIVATE_KEY>",
                "WALLET_MNEMONIC": "<YOUR_MNEMONIC>",
                "VECHAIN_NETWORK": "testnet",
                "VECHAINSTATS_API_KEY": "<YOUR_VECHAINSTATS_API_KEY>",
                "VEBETTER_REWARDS_POOL_ADDRESS": "<VEBETTER_CONTRACT_ADDRESS>",
                "VEBETTER_B3TR_TOKEN_ADDRESS": "<B3TR_TOKEN_ADDRESS>",
                "VEBETTER_APPS_REGISTRY_ADDRESS": "<APPS_REGISTRY_ADDRESS>",
                "VEBETTER_APP_ID": "<YOUR_APP_ID>"
            }
        }
    }
}
EOF

# Backup existing config if it exists
if [ -f "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" ]; then
    echo "📋 Backing up existing Claude configuration..."
    cp "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" "$CLAUDE_CONFIG_DIR/claude_desktop_config.json.backup"
fi

# Copy configuration to Claude Desktop
echo "📤 Installing configuration to Claude Desktop..."
cp mcp-vechain.json "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit $CLAUDE_CONFIG_DIR/claude_desktop_config.json with your wallet details"
echo "2. Restart Claude Desktop"
echo "3. Start chatting with your VeChain AI assistant!"
echo ""
echo "🎯 Example commands to try:"
echo "   • 'Check my VET balance'"
echo "   • 'Transfer 10 VET to 0x...'"
echo "   • 'Get a quote for swapping VET to VTHO'"
echo "   • 'Show me VeChain network stats'"
echo ""
echo "⚠️  Remember to:"
echo "   • Use testnet for development"
echo "   • Keep your private keys secure"
echo "   • Verify all transactions before confirming"
