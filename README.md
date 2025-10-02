# VeChain MCP Server

🚀 **AI-Powered VeChain Blockchain Operations through Model Context Protocol**

Connect Claude Desktop to the VeChain blockchain for natural language interactions with:
- **Token Operations**: Transfer VET/VTHO/B3TR tokens
- **DEX Trading**: Swap tokens on VeChain DEXes (VeSwap, BetterSwap, Vexchange)
- **Cross-Chain Bridges**: WanBridge and XFlows integration
- **NFT Operations**: Mint, transfer, and query VIP-181 NFTs
- **VeBetter Rewards**: Submit sustainable actions and claim B3TR tokens
- **Blockchain Analytics**: Comprehensive data via VeChainStats API

## 🎯 Features

- **90+ AI Tools** for comprehensive VeChain operations
- **Production-Ready** with real contract ABIs and APIs
- **Pluggable Architecture** for easy feature extensions
- **Dual Network Support** (Mainnet/Testnet)
- **Rich Data Integration** via VeChainStats and B32 APIs

## 📋 Requirements

- **Claude Desktop** installed ([download here](https://claude.ai/download))
- **Node.js** 18+ and **pnpm**
- **VeChain wallet** (private key or mnemonic)

## 🚀 Quick Setup

### 1. Build the MCP Server

```bash
cd vechain-mcp-server
pnpm install
pnpm build
```

### 2. Configure Environment

Copy the example configuration:
```bash
cp mcp-vechain.example.json mcp-vechain.json
```

Edit `mcp-vechain.json` with your values:
- **Absolute path** to `vechain-mcp-server/dist/index.js`
- **WALLET_PRIVATE_KEY** or **WALLET_MNEMONIC**
- **VECHAIN_NETWORK** (`mainnet` or `testnet`)
- **VECHAINSTATS_API_KEY** (optional, for enhanced data)
- **VeBetter contract addresses** (if using VeBetter features)

### 3. Install for Claude Desktop

Copy the configuration to Claude Desktop:
```bash
cp mcp-vechain.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 4. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

## 🎮 Usage Examples

Once configured, you can chat with Claude using natural language:

### Token Operations
- *"Transfer 10 VET to 0x..."*
- *"Check my VTHO balance"*
- *"Send 100 B3TR tokens to..."*

### DEX Trading
- *"Swap 50 VET for VTHO on VeSwap"*
- *"Get a quote for swapping B3TR to VET"*
- *"What's the best price for VET/VTHO?"*

### Cross-Chain Operations
- *"Bridge 100 VET from VeChain to Ethereum"*
- *"Check the status of my bridge transaction"*

### NFT Operations
- *"Mint an NFT with metadata..."*
- *"Transfer my NFT to another address"*
- *"Show me all NFTs I own"*

### VeBetter Rewards
- *"Submit a sustainable action: I walked 5km to work"*
- *"Check my available B3TR rewards"*
- *"Claim my VeBetter rewards"*

### Blockchain Analytics
- *"Show me the latest VeChain network stats"*
- *"What's the current VET price?"*
- *"Get transaction history for address..."*

## 🔧 Development

### Adding New Tools
The server uses a plugin architecture. To add new functionality:

1. Create a new plugin in `src/plugins/`
2. Implement your service with `@Tool` decorators
3. Register the plugin in `src/index.ts`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_PRIVATE_KEY` | Either | VeChain wallet private key |
| `WALLET_MNEMONIC` | Either | VeChain wallet mnemonic phrase |
| `VECHAIN_NETWORK` | Yes | Network: `mainnet` or `testnet` |
| `VECHAINSTATS_API_KEY` | No | API key for enhanced blockchain data |
| `VEBETTER_*` | No | VeBetter DAO contract addresses |

### Available Networks

- **Testnet**: `https://testnet.veblocks.net` (recommended for testing)
- **Mainnet**: `https://mainnet.veblocks.net` (production use)

## 📚 Architecture

### Core Components
- **VeChainWalletClient**: Handles blockchain interactions
- **Plugin System**: Modular feature organization
- **Tool Decorators**: AI-accessible function marking
- **Registry Services**: Contract addresses, tokens, ABIs

### Plugin Structure
```
src/plugins/
├── token/          # VET/VIP-180 token operations
├── bridge/         # Cross-chain transfers (WanBridge, XFlows)
├── dex/            # DEX trading (VeSwap, BetterSwap, etc.)
├── nft/            # VIP-181 NFT operations
├── vebetter/       # VeBetter DAO rewards
└── vechainstats/   # Blockchain analytics
```

## 🔗 Integration APIs

- **VeChain SDK**: Core blockchain operations
- **VeChainStats**: Rich blockchain data and analytics
- **WanBridge API**: Cross-chain transfers
- **XFlows API**: Advanced cross-chain swaps
- **B32 Repository**: Dynamic ABI loading

## 🚨 Security Notes

- **Never share your private key or mnemonic**
- **Use testnet for development and testing**
- **Verify all transactions before confirming**
- **Keep your API keys secure**

## 🆘 Troubleshooting

### Common Issues

1. **"Tool not found"**: Restart Claude Desktop after configuration changes
2. **"Invalid address"**: Ensure VeChain addresses are properly formatted
3. **"Insufficient balance"**: Check VET balance for gas fees
4. **"Network error"**: Verify RPC endpoint connectivity

### Debug Mode
Enable debug logging by setting `DEBUG=true` in your environment.

## 📖 Documentation

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [VeChain Documentation](https://docs.vechain.org/)
- [GOAT SDK](https://github.com/goat-sdk/goat) (architecture inspiration)

## 🤝 Contributing

This is a hackathon project demonstrating AI-blockchain integration. Contributions welcome!

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for VeChain Hackathon 2024** 🏆

*Connecting AI with blockchain through natural language interactions*