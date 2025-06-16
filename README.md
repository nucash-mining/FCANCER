# FCNCR - Fuck Cancer Cross-Chain Token

A revolutionary cross-chain token with Bitcoin-like halving mechanics, designed to support cancer research while rewarding ALT stakers across multiple blockchain networks with advanced cross-chain messaging capabilities.

## 🚀 Features

- **Bitcoin-like Halving**: 50 FCNCR per block, halving every 210,000 blocks
- **Cross-Chain Compatible**: Deployed on 7+ blockchain networks with deterministic addresses
- **ALT Staking**: Stake ALT tokens to earn FCNCR rewards proportionally
- **Cross-Chain Messaging**: Advanced messaging system for seamless cross-chain operations
- **Liquidity Pools**: Provide FCNCR/ALT liquidity to earn fees
- **Deterministic Deployment**: Same contract addresses across all networks using CREATE2

## 🌐 Supported Networks

- **Altcoinchain** (Chain ID: 2330)
- **Etica Mainnet** (Chain ID: 61803) 
- **PlanQ Mainnet** (Chain ID: 7070)
- **OctaSpace** (Chain ID: 800001)
- **DOGEchain** (Chain ID: 2000)
- **Sonic Mainnet** (Chain ID: 146)
- **Fantom Opera** (Chain ID: 250)

## 📋 Smart Contracts

### Core Contracts
- **FCNCRCrossChain** - Enhanced FCNCR token with cross-chain capabilities
- **CrossChainMessenger** - Handles cross-chain message passing
- **FCNCRBridge** - Cross-chain token transfers with 0.1% fee
- **FCNCRLiquidityPool** - FCNCR/ALT trading pairs with 0.3% fees
- **Create2Deployer** - Deterministic contract deployment

### Key Features
✅ **Bitcoin-like Halving**: Reward halves every 210,000 blocks  
✅ **Cross-Chain Messaging**: Secure message passing between chains  
✅ **Deterministic Addresses**: Same contract addresses on all networks  
✅ **ALT Staking Rewards**: Proportional FCNCR distribution  
✅ **Liquidity Mining**: Additional rewards for LP providers  
✅ **Emergency Controls**: Pausable contracts with admin functions  

## 🛠 Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- MetaMask or compatible wallet

### Installation
```bash
# Clone repository
git clone <repository-url>
cd fcncr-crosschain-dapp

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your private key to .env file
```

### Compilation
```bash
# Compile all contracts
npm run compile
```

## 🚀 Deployment Options

### 1. Standard Deployment
Deploy to a single network:
```bash
# Deploy to specific network
npx hardhat run scripts/deployCrossChain.js --network altcoinchain
```

### 2. Multi-Chain Deployment
Deploy to all supported networks:
```bash
# Deploy to all networks
npm run deploy:crosschain:all
```

### 3. Deterministic Deployment
Deploy with same addresses across all chains:
```bash
# Deploy with CREATE2 for consistent addresses
npm run deploy:deterministic
```

## 🔧 Configuration

### Network Configuration
All networks are pre-configured in `hardhat.config.js` with:
- RPC endpoints
- Chain IDs  
- Gas settings
- Explorer URLs

### Contract Addresses
After deployment, addresses are automatically saved to:
- `crosschain-deployments.json` - All deployment info
- `src/contracts/contractAddresses.ts` - Frontend integration

## 💡 How It Works

### 1. Staking System
- Users stake ALT tokens in the FCNCR contract
- Rewards distributed proportionally based on stake percentage
- Bitcoin-like halving reduces rewards over time

### 2. Cross-Chain Operations
- **Messaging**: Send arbitrary data between chains
- **Token Bridging**: Move FCNCR tokens across networks
- **Synchronized State**: Consistent token supply across chains

### 3. Mining & Rewards
- Anyone can call `mineBlock()` to advance block counter
- Rewards automatically distributed to all stakers
- Halving occurs every 210,000 blocks

### 4. Liquidity Provision
- Add FCNCR/ALT liquidity to earn trading fees
- LP tokens represent pool ownership
- Additional FCNCR rewards for liquidity providers

## 🔐 Security Features

- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Access Control**: Owner-only administrative functions
- **Message Verification**: Cryptographic message validation
- **Authorized Relayers**: Controlled cross-chain message relay

## 📊 Tokenomics

- **Total Supply**: 21,000,000 FCNCR
- **Initial Reward**: 50 FCNCR per block
- **Halving Schedule**: Every 210,000 blocks
- **Distribution**: 100% through ALT staking rewards
- **Bridge Fee**: 0.1% for cross-chain transfers
- **Trading Fee**: 0.3% for liquidity pool swaps

## 🎯 Usage Examples

### Stake ALT Tokens
```javascript
// Approve ALT spending
await altToken.approve(fcncrAddress, amount);

// Stake ALT tokens
await fcncrContract.stakeALT(amount);
```

### Cross-Chain Bridge
```javascript
// Bridge FCNCR to another chain
await fcncrContract.bridgeTokens(amount, targetChainId, {
  value: bridgeFee
});
```

### Add Liquidity
```javascript
// Approve both tokens
await fcncrToken.approve(poolAddress, fcncrAmount);
await altToken.approve(poolAddress, altAmount);

// Add liquidity
await liquidityPool.addLiquidity(fcncrAmount, altAmount);
```

## 🔄 Cross-Chain Message Flow

1. **Send Message**: User calls `sendMessage()` on source chain
2. **Event Emission**: CrossChainMessage event emitted
3. **Relayer Pickup**: Authorized relayer detects event
4. **Message Relay**: Relayer calls `receiveMessage()` on target chain
5. **Verification**: Message hash and signature verified
6. **Execution**: Target contract function executed

## 🛡 Emergency Procedures

### Pause Contracts
```bash
# Pause all operations
npx hardhat run scripts/pauseContracts.js --network <network>
```

### Update Relayers
```bash
# Add/remove authorized relayers
npx hardhat run scripts/updateRelayers.js --network <network>
```

## 📈 Monitoring & Analytics

- **Block Explorer**: Track all transactions and contracts
- **Event Logs**: Monitor cross-chain messages and bridges
- **Staking Stats**: View total staked ALT and rewards
- **Liquidity Metrics**: Track pool reserves and volume

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.fcncr.io](https://docs.fcncr.io)
- **Discord**: [discord.gg/fcncr](https://discord.gg/fcncr)
- **Telegram**: [t.me/fcncr](https://t.me/fcncr)
- **Email**: support@fcncr.io

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Users are responsible for their own due diligence. Cryptocurrency investments carry risk of loss.

---

**Fight Cancer Through Blockchain Technology** 💜