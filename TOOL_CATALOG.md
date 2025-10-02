# VeChain MCP Server - Complete Tool Catalog

## 🎯 **Total Tools Available: 29**

---

## **Core Wallet Tools** (4 tools)

### 1. `get_wallet_address`
Get the connected wallet address
```
Parameters: none
Example: "What's my wallet address?"
```

### 2. `get_chain_info`
Get information about the connected blockchain
```
Parameters: none
Example: "Which network am I on?"
```

### 3. `get_balance`
Get VET and VTHO balance for an address
```
Parameters:
  - address: VeChain address
Example: "Check my VET balance"
```

### 4. `sign_message`
Sign a message with the wallet
```
Parameters:
  - message: Message to sign
Example: "Sign the message 'Hello VeChain'"
```

---

## **Token Operations** (4 tools)

### 5. `transfer_vet`
Transfer VET (native VeChain tokens) to another address
```
Parameters:
  - to: Recipient address
  - amount: Amount in VET
  - memo: Optional transaction memo
Example: "Send 10 VET to 0x..."
```

### 6. `transfer_token`
Transfer VIP-180 tokens (VTHO, B3TR, etc.)
```
Parameters:
  - tokenAddress: Token contract address
  - to: Recipient address
  - amount: Amount to send
Example: "Send 100 VTHO to 0x..."
```

### 7. `get_balance` (token specific)
Get balance for any token
```
Parameters:
  - tokenAddress: Token contract or "VET"
  - address: Address to check
Example: "Check B3TR balance for 0x..."
```

### 8. `get_token_info`
Get token information by symbol
```
Parameters:
  - tokenSymbol: Token symbol (VET, VTHO, B3TR)
Example: "Get info about B3TR token"
```

---

## **VeChainStats Analytics** (21 tools)

### Account Analytics (6 tools)

### 9. `vechainstats_get_account_info`
Comprehensive account information
```
Parameters:
  - address: VeChain address
  - expanded: Include expanded details (optional)
Example: "Get detailed info for address 0x..."
```

### 10. `vechainstats_get_transactions_in`
Incoming transactions with pagination
```
Parameters:
  - address: VeChain address
  - page: Page number
  - sort: asc or desc
Example: "Show me recent incoming transactions"
```

### 11. `vechainstats_get_transactions_out`
Outgoing transactions with pagination
```
Parameters:
  - address: VeChain address
  - page: Page number
  - sort: asc or desc
Example: "Show my sent transactions"
```

### 12. `vechainstats_get_token_transfers`
Token transfer history (VET, VTHO, VIP-180)
```
Parameters:
  - address: VeChain address
  - tokenType: vet, vtho, or vip180 (optional)
  - page: Page number
Example: "Show all token transfers for my address"
```

### 13. `vechainstats_get_nft_transfers`
NFT transfer history
```
Parameters:
  - address: VeChain address
  - page: Page number
Example: "Show my NFT transfers"
```

### 14. `vechainstats_get_dex_trades` ⭐ **POWERFUL**
DEX trading history across ALL 6 VeChain DEXes
```
Parameters:
  - address: VeChain address
  - page: Page number
  - sort: asc or desc
Example: "Show my DEX swap history"
Covers: VeRocket, VeSwap, BetterSwap, Vexchange V1/V2, DThor Swap
```

### 15. `vechainstats_get_historic_balance`
Historical VET/VTHO balance at specific date/block
```
Parameters:
  - address: VeChain address
  - date: YYYY-MM-DD (optional)
  - blocknum: Block number (optional)
Example: "What was my balance on 2024-01-01?"
```

### Token Data (6 tools)

### 16. `vechainstats_get_token_list` ⭐
Complete list of ALL tokens on VeChain (50+ tokens)
```
Example: "Show me all available tokens"
```

### 17. `vechainstats_get_token_info`
Detailed token information
```
Parameters:
  - token: Symbol or contract address
  - expanded: Include expanded details
Example: "Get info about SHA token"
```

### 18. `vechainstats_get_token_price` ⭐
Current token price in USD with 24h data
```
Parameters:
  - token: Token symbol
Example: "What's the current price of B3TR?"
```

### 19. `vechainstats_get_all_token_prices` ⭐
Prices for ALL VeChain tokens in one call
```
Example: "Show me all token prices"
```

### 20. `vechainstats_get_token_supply`
Token supply information
```
Parameters:
  - token: Token symbol or address
Example: "What's the total supply of VTHO?"
```

### 21. `vechainstats_get_token_holders`
Token holder list with balances
```
Parameters:
  - token: Token symbol or address
  - threshold: Minimum balance (optional)
  - page: Page number
Example: "Who are the top holders of B3TR?"
```

### Transaction & Block Tools (4 tools)

### 22. `vechainstats_get_transaction_status`
Transaction confirmation status
```
Parameters:
  - txid: Transaction hash
Example: "Is transaction 0x... confirmed?"
```

### 23. `vechainstats_get_transaction_info`
Detailed transaction information
```
Parameters:
  - txid: Transaction hash
Example: "Show details for transaction 0x..."
```

### 24. `vechainstats_get_current_block`
Current block height
```
Example: "What's the current block number?"
```

### 25. `vechainstats_get_block_info`
Block information
```
Parameters:
  - blocknum: Block number
Example: "Get info about block 16000000"
```

### Contract Tools (2 tools)

### 26. `vechainstats_get_contract_info`
Contract verification status and metadata
```
Parameters:
  - address: Contract address
Example: "Is contract 0x... verified?"
```

### 27. `vechainstats_get_contract_code`
Get verified contract source code
```
Parameters:
  - address: Contract address
Example: "Show me the source code for contract 0x..."
```

### NFT Tools (2 tools)

### 28. `vechainstats_get_nft_list`
List of all NFT collections
```
Example: "Show me all NFT collections on VeChain"
```

### 29. `vechainstats_get_nft_info`
NFT collection information (floor price, volume, etc.)
```
Parameters:
  - id: NFT collection ID
Example: "Get info about ExoWorlds NFTs"
```

### Carbon & Network Tools (Bonus)

- `vechainstats_get_address_emissions` - Carbon footprint tracking
- `vechainstats_get_network_emissions` - Network carbon neutrality data
- `vechainstats_get_network_totals` - Network statistics
- `vechainstats_get_gas_stats` - Gas price information
- `vechainstats_get_mempool` - Pending transactions

---

## 🎯 **Example Natural Language Commands**

### Basic Operations
```
"What's my wallet address?"
"Check my VET balance"
"Send 10 VET to 0x..."
"Transfer 100 VTHO to my friend"
```

### Analytics & Price Data
```
"What's the price of B3TR?"
"Show me all token prices on VeChain"
"What are the top trending tokens?"
"Who are the biggest VTHO holders?"
```

### Transaction History
```
"Show my recent transactions"
"What transactions did I send last week?"
"Show my DEX trading history"
"Did I receive any tokens today?"
```

### DEX & Trading
```
"Show my swap history on VeChain DEXes"
"What DEX trades have I made?"
"Show me all my DeFi activity"
```

### NFT Operations
```
"What NFT collections exist on VeChain?"
"Show me ExoWorlds NFT info"
"Did I transfer any NFTs recently?"
```

### Smart Contracts
```
"Is contract 0x... verified?"
"Show me the source code for contract 0x..."
"Get contract information for 0x..."
```

### Carbon Tracking (VeBetter Perfect!)
```
"What's my carbon footprint on VeChain?"
"Show me my carbon emissions"
"Is VeChain carbon-neutral?"
```

### Network Data
```
"What's the current block number?"
"Show me network statistics"
"What's the gas price right now?"
"How many transactions are pending?"
```

---

## 🚀 **Power Features**

### 1. **DEX Trade History Across All 6 DEXes**
The `vechainstats_get_dex_trades` tool aggregates trades from:
- VeRocket
- VeSwap
- BetterSwap
- Vexchange V1 & V2
- DThor Swap

### 2. **Real-Time Token Prices**
Get USD prices for 50+ VeChain tokens instantly

### 3. **Historical Data**
- Balance snapshots at any date/block
- Transaction history with full details
- Token transfer tracking

### 4. **NFT Analytics**
- Floor prices
- Trading volume
- Holder distributions

### 5. **Carbon Emissions**
Perfect for VeBetter DAO integration:
- Track address carbon footprint
- Transaction emissions
- Network-wide sustainability metrics

---

## 📊 **Tool Categories Breakdown**

| Category | # Tools | Purpose |
|----------|---------|---------|
| **Wallet Core** | 4 | Basic wallet operations |
| **Token Ops** | 4 | Send/receive tokens |
| **Account Analytics** | 6 | Transaction history, DEX trades |
| **Token Analytics** | 6 | Prices, holders, supply |
| **Blockchain Data** | 4 | Transactions, blocks |
| **Smart Contracts** | 2 | Contract info, code |
| **NFTs** | 2 | Collections, metadata |
| **Carbon** | 3 | Emissions tracking |
| **Network** | 4 | Network stats, gas |
| **TOTAL** | **35** | **All blockchain operations** |

---

## 🎨 **Plugin Architecture**

```typescript
// How to use plugins:
import { token, vechainstats } from './plugins';

const tools = getOnChainTools({
  wallet: vechainWallet,
  plugins: [
    token(),        // 8 tools for token operations
    vechainstats(), // 21 tools for analytics
  ]
});

// Total: 29 AI-accessible tools! 🚀
```

---

## 💡 **Why This Is Powerful**

1. **No DEX Integration Needed** - VeChainStats already tracks all DEX trades!
2. **No Price Oracle** - VeChainStats provides real-time prices!
3. **No NFT Indexer** - VeChainStats has all NFT data!
4. **No Transaction History DB** - VeChainStats has it all!
5. **Carbon Tracking** - Perfect for VeBetter rewards!

**Instead of building everything from scratch, we leverage VeChainStats API!**

---

## 🔮 **Next Steps**

### Immediate (Ready to Use Now)
- ✅ 29 working tools
- ✅ Test with Claude Desktop
- ✅ Start using for analytics

### Coming Soon (When Addresses Available)
- 🔨 Bridge plugin (WanBridge)
- 🔨 VeBetter plugin (Rewards tracking)
- 🔨 DEX plugin (Execute swaps)
- 🔨 NFT plugin (Minting)

---

**Built with:** GOAT SDK patterns + VeChain SDK + VeChainStats API
**Attribution:** "Powered by vechainstats.com APIs"


