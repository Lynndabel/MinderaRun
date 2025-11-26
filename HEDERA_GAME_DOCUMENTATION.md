# 🎮 Hedera GameD - Complete Documentation

## 📋 Project Overview

**Hedera GameD** is a blockchain-based endless runner game built on the Hedera network. Players collect coins, avoid obstacles, answer knowledge questions, and earn real HTS (Hedera Token Service) tokens and NFT badges for their achievements.

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
- **Game Engine**: Custom HTML5 Canvas-based endless runner
- **Blockchain Integration**: Hedera SDK + MetaMask wallet connection
- **State Management**: Zustand store for game state
- **UI Framework**: Custom pixel-art styled components

### Smart Contracts (Solidity)
- **MindoraRunner.sol**: Main game contract for score tracking
- **QuestCoin Token**: Fungible HTS token (game currency)
- **Badge NFTs**: Non-fungible HTS tokens (achievement badges)

### Backend Services
- **Hedera Service**: Handles all blockchain interactions
- **Mirror Node API**: Queries account balances and NFT ownership
- **Treasury Account**: Manages token minting and distribution

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# Your Hedera Account (Treasury/Operator)
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.6919858
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=0xYOUR_PRIVATE_KEY_HERE

# Smart Contract Address (Deploy first, then add this)
NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.6920065

# HTS Token IDs (Create tokens first, then add these)
NEXT_PUBLIC_QUESTCOIN_TOKEN_ID=0.0.6920079
NEXT_PUBLIC_BADGE_NFT_TOKEN_ID=0.0.6920080

# HCS Topic ID (Optional - for game event logging)
NEXT_PUBLIC_GAME_EVENTS_TOPIC=0.0.6920083

# Development Settings
NODE_ENV=development

# WalletConnect Project ID (Get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=1922d8f34388fb1c3b3553c342d31094
```

### Scripts Environment Variables

Create a `.env` file in the `scripts/` directory:

```bash
# Hedera Operator Account (for deployment scripts)
HEDERA_OPERATOR_ID=0.0.6919858
HEDERA_OPERATOR_KEY=0xYOUR_PRIVATE_KEY_HERE

# Hedera Network
HEDERA_NETWORK=testnet
```

## 🎯 Game Features

### 🏃‍♂️ Gameplay Mechanics
- **Endless Runner**: Side-scrolling platformer with increasing difficulty
- **Coin Collection**: Collect coins to earn in-game currency
- **Obstacle Avoidance**: Jump over spikes, pits, and blocks
- **Knowledge Walls**: Answer Hedera-related questions to progress
- **Stage Progression**: 3 increasingly difficult stages

### 🎨 Visual Design
- **Stage 1 (Morning)**: Golden coins, green landscape, white clouds
- **Stage 2 (Sunset)**: Silver coins, orange/red landscape, golden particles
- **Stage 3 (Night)**: Cyan coins, dark landscape, twinkling stars

### 🏆 Reward System
- **Stage 1**: 20 QuestCoin tokens + Explorer Badge NFT
- **Stage 2**: 50 QuestCoin tokens + Adventurer Badge NFT  
- **Stage 3**: 100 QuestCoin tokens + Master Badge NFT

## 🔗 Blockchain Integration

### Hedera Token Service (HTS)
- **QuestCoin Token**: Fungible token for in-game currency
- **Badge NFTs**: Non-fungible tokens for achievements
- **Treasury Minting**: Centralized token distribution
- **Auto-Association**: Automatic NFT association for user accounts

### Smart Contract Functions
- `registerPlayer()`: Register new players
- `saveGameSession()`: Save game progress and scores
- `getPlayerStats()`: Retrieve player statistics
- `getLeaderboard()`: Get top players

### Wallet Integration
- **MetaMask**: EVM wallet connection
- **EVM Address Conversion**: Convert EVM addresses to Hedera Account IDs
- **Transaction Signing**: User-signed blockchain transactions

## 📁 Project Structure

```
GameD/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js app router
│   │   ├── components/         # React components
│   │   │   ├── GameUI.tsx     # Main game interface
│   │   │   ├── SimpleGameCanvas.tsx  # Game engine
│   │   │   ├── GameOverModal.tsx     # Game over screen
│   │   │   └── QuizModal.tsx         # Knowledge questions
│   │   ├── services/
│   │   │   └── hederaService.ts      # Blockchain integration
│   │   ├── store/
│   │   │   └── gameStore.ts          # Game state management
│   │   └── config/
│   │       └── contracts.ts          # Contract addresses
│   └── .env.local             # Environment variables
├── scripts/                   # Deployment and setup scripts
│   ├── createTokens.js       # Create HTS tokens
│   ├── deployContract.js     # Deploy smart contracts
│   └── .env                  # Script environment variables
├── Smart-contract/
│   └── MindoraRunnerFinal.sol # Main game contract
└── DEPLOYMENT_SUMMARY.md     # Deployment information
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Hedera testnet account
- Git

### 🔒 Security Warning

**⚠️ CRITICAL SECURITY NOTICE:**

The private keys and account IDs shown in this documentation are **ONLY FOR DEMONSTRATION PURPOSES** and should **NEVER** be used in production.

**Security Best Practices:**
- **Never commit private keys** to version control
- **Use environment variables** for all sensitive data
- **Generate new accounts** for production deployments
- **Use hardware wallets** for high-value operations
- **Keep private keys secure** and never share them publicly

**For Production:**
1. Create a new Hedera account
2. Fund it with HBAR
3. Update environment variables with your credentials
4. Never expose private keys in documentation or code

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd GameD
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Scripts
cd ../scripts
npm install
```

3. **Configure environment variables**
```bash
# Copy and edit environment files
cp .env.example .env.local  # Frontend
cp .env.example .env        # Scripts
```

4. **Deploy smart contracts**
```bash
cd scripts
node deployContract.js
node createTokens.js
```

5. **Start the frontend**
```bash
cd frontend
npm run dev
```

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and sign with MetaMask
2. **Select Stage**: Choose from 3 difficulty levels
3. **Play Game**: 
   - Use SPACE or UP arrow to jump
   - Collect golden/silver/cyan coins
   - Avoid obstacles (spikes, pits, blocks)
   - Answer knowledge questions at walls
4. **Save Progress**: When game ends, save to blockchain to earn tokens
5. **Claim Rewards**: Earn QuestCoin tokens and NFT badges

## 🔧 Technical Implementation

### Game Engine (`SimpleGameCanvas.tsx`)
- **Canvas Rendering**: 60fps game loop with requestAnimationFrame
- **Collision Detection**: Precise hitbox calculations
- **Parallax Scrolling**: Multi-layer background effects
- **State Management**: Real-time game state updates

### Blockchain Service (`hederaService.ts`)
- **Client Management**: Hedera SDK client initialization
- **Address Conversion**: EVM to Hedera Account ID mapping
- **Token Operations**: Minting, transferring, and querying tokens
- **NFT Management**: Minting and transferring achievement badges
- **Permission Checks**: Validating minting and association permissions

### State Management (`gameStore.ts`)
- **Player Data**: Wallet connection and player statistics
- **Game State**: Current stage, score, coins, and progress
- **UI State**: Modals, loading states, and user interactions
- **Persistence**: Blockchain integration for data persistence

## 🛡️ Security Features

### Treasury Account Security
- **Centralized Minting**: Only treasury account can mint tokens
- **Private Key Management**: Environment variable storage
- **Permission Validation**: Checks before token operations

### User Data Protection
- **Wallet Integration**: No private key storage
- **Transaction Signing**: User-controlled transaction approval
- **Data Validation**: Input sanitization and validation

### Duplicate Prevention
- **Reward Checking**: Prevents duplicate token claims
- **Balance Verification**: Checks existing token balances
- **NFT Detection**: Validates existing NFT ownership

## 📊 Game Data Flow

1. **Player Registration**: Wallet connection → Hedera account creation
2. **Game Session**: Local state management → Real-time updates
3. **Progress Saving**: Game data → Smart contract → Blockchain
4. **Reward Distribution**: Treasury account → User account
5. **Data Querying**: Mirror Node API → Real-time balance updates

## 🎯 Key Features Implemented

### ✅ Core Gameplay
- [x] Endless runner mechanics
- [x] Coin collection system
- [x] Obstacle avoidance
- [x] Knowledge question system
- [x] Multi-stage progression

### ✅ Blockchain Integration
- [x] Hedera Token Service (HTS) integration
- [x] Real token minting and transfers
- [x] NFT badge system
- [x] EVM wallet compatibility
- [x] Treasury account management

### ✅ User Experience
- [x] Pixel-art visual design
- [x] Responsive game controls
- [x] Real-time score tracking
- [x] Progress persistence
- [x] Reward claiming system

### ✅ Security & Validation
- [x] Duplicate reward prevention
- [x] Permission checking
- [x] Input validation
- [x] Error handling
- [x] Environment variable configuration

## 🔮 Future Enhancements

### Potential Improvements
- **Multiplayer Support**: Real-time multiplayer gameplay
- **Advanced Graphics**: 3D rendering and animations
- **More Token Types**: Additional reward tokens
- **Leaderboard Rewards**: Competitive token distribution
- **Mobile Support**: Touch controls and mobile optimization

### Technical Upgrades
- **Performance Optimization**: WebGL rendering
- **Caching System**: Improved data loading
- **Analytics**: Player behavior tracking
- **Testing Suite**: Comprehensive test coverage

## 🐛 Known Issues & Solutions

### Fixed Issues
- ✅ **Coin Display Bug**: Fixed session coins not showing in game over modal
- ✅ **Duplicate Claims**: Implemented reward checking system
- ✅ **NFT Association**: Added auto-association for user accounts
- ✅ **Environment Variables**: Moved hardcoded values to .env files

### Current Limitations
- **MetaMask Compatibility**: Limited Hedera transaction signing
- **Network Dependency**: Requires stable internet connection
- **Browser Support**: Canvas-based rendering limitations

## 📞 Support & Contact

For technical support or questions about the Hedera GameD project:

- **Documentation**: This file and inline code comments
- **Issues**: GitHub issues for bug reports
- **Development**: Contact the development team

---

**Built with ❤️ for the Hedera ecosystem**

*This game demonstrates the power of Hedera's Token Service (HTS) and smart contracts in creating engaging blockchain-based gaming experiences.*
