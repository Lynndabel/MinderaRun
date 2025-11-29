# 🏃‍♂️ Mindera Run - Play, Learn, Earn on Hedera

<div align="center">

![Hedera](https://img.shields.io/badge/Hedera-Testnet-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-gray?style=for-the-badge&logo=solidity)

**A blockchain-powered endless runner that combines fun gameplay with blockchain education and African culture**

[🎮 **Play Live Demo**](https://mindera-run.vercel.app/) • [📖 Documentation](./HEDERA_GAME_DOCUMENTATION.md) • [🚀 Deployment Guide](./DEPLOYMENT_GUIDE.md) • [🏆 Hackathon Submission](./HEDERA_HACKATHON_SUBMISSION.md)

</div>

---

## 🌍 The Problem We're Solving

Africa has the **world's youngest population** — 70% under 30 years old — yet faces critical challenges:

- **High Youth Unemployment**: Over 60% in some countries [[UNICEF, 2023]](https://www.unicef.org)
- **Limited Blockchain Literacy**: Despite growing adoption, misinformation and lack of accessible education prevent many from benefiting
- **Unrewarded Gaming**: Millions of African gamers play without earning real-world value
- **Cultural Underrepresentation**: African culture and art remain underrepresented in global gaming ecosystems

**The opportunity is massive**: Africa's gaming market is projected to reach $1 billion by 2024, with mobile gaming leading the charge.

---

## 💡 Our Solution: Mindera Run

**Mindera Run** turns play into empowerment by combining entertainment, education, and economic opportunity:

### 🎮 **Gameplay**
Subway Surfers-style endless runner with:
- Run, jump, and dodge obstacles through 3 beautiful stages
- Collect coins and power-ups
- Progressive difficulty with African-inspired visuals

### 📚 **Learning**
Gamified blockchain education:
- Answer questions about Hedera blockchain to advance levels
- Learn about HTS, HSCS, consensus mechanisms, and more
- Knowledge walls that unlock new stages

### 💰 **Rewards**
Real economic value through Hedera:
- **QuestCoin Tokens (HTS)**: Earn 20-100 tokens per stage completion
- **NFT Badges**: Collect African-inspired achievement NFTs
- **Leaderboard Prizes**: Top players earn real HBAR rewards
- **Trading**: Buy, sell, and trade NFTs in the marketplace

### 🌍 **Cultural Value**
- African-inspired art and themes
- Celebrates African identity in Web3
- Elevates African culture into the global blockchain ecosystem

---

## 🚀 Why Hedera?

We chose Hedera for its perfect alignment with Africa's needs:

| Feature | Why It Matters for Africa |
|---------|---------------------------|
| **Low Fees** | Transactions cost fractions of a cent — accessible for all income levels |
| **Speed** | 3-5 second finality — instant gratification for gamers |
| **Sustainability** | Carbon-negative network — essential for climate-conscious African youth [[Hedera, 2024]](https://hedera.com) |
| **Scalability** | 10,000+ TPS — ready for millions of African gamers |
| **Tokenization** | Seamless NFT rewards and microtransactions at scale |

---

## 🎯 Impact & Vision

### **Education**
- Gamifies blockchain learning for Africa's next generation of builders
- Makes complex concepts accessible through play
- Creates a pipeline of blockchain-literate youth

### **Economic Inclusion**
- Offers income opportunities through token rewards
- Enables NFT trading and digital asset ownership
- Provides real-world value for time spent gaming

### **Cultural Representation**
- Showcases African art and identity in Web3
- Creates economic opportunities for African artists
- Builds pride and representation in the global blockchain ecosystem

> **Mindera Run is more than a game — it's an on-ramp for African youth into Web3, powered by Hedera's fast, fair, and sustainable network.**

---

## 🏗️ Technical Architecture

### **Backend-less Design**
Revolutionary serverless architecture leveraging Hedera as the backend:

```
Frontend (Next.js) → Hedera SDK → Smart Contracts → Blockchain
                          ↓
                   Mirror Node API ← Real-time Data
```

### **Tech Stack**

#### **Frontend**
- **Framework**: Next.js 15 with TypeScript
- **Game Engine**: Custom HTML5 Canvas (60fps)
- **State Management**: Zustand
- **Wallet Integration**: MetaMask + WalletConnect
- **Styling**: Tailwind CSS + NES.css (pixel art)
- **UI Components**: Lucide icons, Framer Motion

#### **Blockchain**
- **Network**: Hedera Testnet/Mainnet
- **Smart Contracts**: Solidity 0.8.19
- **SDK**: `@hashgraph/sdk` v2.64.5
- **Services Used**:
  - **HTS**: Fungible tokens (QuestCoin) + NFTs (Badges)
  - **HSCS**: Smart contract for game logic
  - **HCS**: Consensus service for event logging
  - **Mirror Node**: Real-time data queries

#### **Smart Contracts**
- **MindoraRunnerFinal.sol**: Player registration, score tracking, rewards
- **NFTMarketplace.sol**: Trading and marketplace (coming soon)

---

## 🎮 Game Features

### **Three Stages of Adventure**

| Stage | Theme | Difficulty | Rewards |
|-------|-------|------------|---------|
| 🌅 **Stage 1: Morning** | Golden coins, green landscape | Easy | 20 QuestCoins + Explorer Badge NFT |
| 🌇 **Stage 2: Sunset** | Silver coins, orange/red sky | Medium | 50 QuestCoins + Adventurer Badge NFT |
| 🌃 **Stage 3: Night** | Cyan coins, starry night | Hard | 100 QuestCoins + Master Badge NFT |

### **Gameplay Mechanics**
- ⌨️ **Controls**: SPACE or UP arrow to jump
- 🪙 **Coin Collection**: Collect coins for rewards
- 🚧 **Obstacles**: Dodge spikes, pits, and blocks
- 🧠 **Knowledge Walls**: Answer Hedera questions to progress
- 📊 **Leaderboards**: Compete for top scores
- 🏆 **Achievements**: Unlock NFT badges

### **Blockchain Integration**
- 💰 Real HTS token rewards (QuestCoin)
- 🎨 NFT achievement badges with African-inspired art
- 📝 On-chain score tracking and leaderboards
- 🔐 Secure wallet integration
- 🚫 Duplicate reward prevention
- ⚡ Instant transaction confirmation

---

## 📦 Quick Start

### **Prerequisites**
- Node.js 18+ installed
- MetaMask wallet
- Hedera testnet account with HBAR ([Get testnet HBAR](https://portal.hedera.com))

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/MinderaRun.git
cd MinderaRun
```

### **2. Install Dependencies**
```bash
# Frontend
cd frontend
npm install

# Scripts (for deployment)
cd ../scripts
npm install
```

### **3. Configure Environment Variables**

Create `frontend/.env.local`:
```bash
# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# Your Hedera Account (Treasury/Operator)
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY

# Smart Contract Address (Deploy first, then add this)
NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.7172114

# HTS Token IDs (Create tokens first, then add these)
NEXT_PUBLIC_QUESTCOIN_TOKEN_ID=0.0.7158216
NEXT_PUBLIC_BADGE_NFT_TOKEN_ID=0.0.7158217

# HCS Topic ID (Optional - for game event logging)
NEXT_PUBLIC_GAME_EVENTS_TOPIC=0.0.6920083

# WalletConnect Project ID (Get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

### **4. Deploy Smart Contracts (Optional - for new deployment)**
```bash
cd scripts

# Create HTS tokens
node createTokens.js

# Create HCS topic for event logging
node createHCSTopic.js

# Setup NFT metadata
node setupNFTMetadata.js
```

### **5. Run the Game**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser 🎮

### **Or Play the Live Demo**

🌐 **[https://mindera-run.vercel.app/](https://mindera-run.vercel.app/)**

No installation needed - just connect your MetaMask wallet and start playing!

---

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve with MetaMask
2. **Register**: Enter your username to create your player profile
3. **Select Stage**: Choose from 3 difficulty levels (unlock by completing previous stages)
4. **Play**: 
   - Press SPACE or UP arrow to jump
   - Collect coins and avoid obstacles
   - Answer Hedera knowledge questions at walls
5. **Complete Stage**: Reach the end to unlock rewards
6. **Claim Rewards**: Mint your QuestCoin tokens and NFT badges
7. **Trade**: Visit the marketplace to trade NFTs (coming soon)

---

## 📊 Project Structure

```
MinderaRun/
├── frontend/                          # Next.js application
│   ├── src/
│   │   ├── app/                      # App router pages
│   │   ├── components/               # React components
│   │   │   ├── SimpleGameCanvas.tsx # Game engine (35K lines)
│   │   │   ├── GameUI.tsx           # Main game interface
│   │   │   ├── ContractManager.tsx  # Blockchain interactions
│   │   │   ├── GameOverModal.tsx    # Reward claiming
│   │   │   └── QuizModal.tsx        # Knowledge questions
│   │   ├── services/
│   │   │   └── hederaService.ts     # Hedera SDK integration (54K lines)
│   │   ├── store/
│   │   │   └── gameStore.ts         # Zustand state management
│   │   ├── config/
│   │   │   ├── contracts.ts         # Contract addresses
│   │   │   └── abis/                # Contract ABIs
│   │   ├── hooks/                   # Custom React hooks
│   │   └── data/
│   │       └── questions.ts         # Hedera knowledge questions
│   └── package.json
│
├── Smart-contract/
│   ├── MindoraRunnerFinal.sol       # Main game contract (264 lines)
│   └── NFTMarketplace.sol           # NFT marketplace
│
├── scripts/                          # Deployment scripts
│   ├── createTokens.js              # Deploy HTS tokens
│   ├── createHCSTopic.js            # Create consensus topic
│   ├── setupNFTMetadata.js          # Setup NFT metadata
│   └── nft-metadata/                # NFT metadata files
│
└── Documentation/
    ├── HEDERA_GAME_DOCUMENTATION.md # Complete technical docs
    ├── DEPLOYMENT_GUIDE.md          # Step-by-step deployment
    └── HEDERA_HACKATHON_SUBMISSION.md # Hackathon submission
```

---

## 🔗 Smart Contract Functions

### **Player Management**
```solidity
registerPlayer(string username)           // Register new player
getPlayer(address player)                 // Get player stats
```

### **Game Sessions**
```solidity
saveGameSession(                          // Save game progress
  uint256 stage,
  uint256 finalScore,
  uint256 coinsCollected,
  uint256 questionsCorrect,
  bool stageCompleted
)
```

### **Rewards**
```solidity
claimTokens(uint256 stage)               // Mark tokens as claimed
claimNFT(uint256 stage)                  // Mark NFT as claimed
isStageCompleted(address, uint256)       // Check completion status
areTokensClaimed(address, uint256)       // Check token claim status
isNFTClaimed(address, uint256)           // Check NFT claim status
```

### **Leaderboards**
```solidity
getStageLeaderboard(uint256 stage, uint256 limit)  // Stage-specific
getGeneralLeaderboard(uint256 limit)               // All stages
```

---

## 🏆 Key Innovations

### **1. Backend-less Architecture**
- No traditional server infrastructure
- Hedera blockchain acts as the backend
- Direct frontend-to-blockchain communication
- Zero server maintenance costs

### **2. Real Economic Gaming**
- Actual HTS tokens (not fake currency)
- NFT achievements with real value
- Tradeable digital assets
- Cross-platform wallet support

### **3. Educational Integration**
- Hedera knowledge questions in gameplay
- Learn while earning
- Gamified blockchain education
- Progressive difficulty

### **4. African Cultural Focus**
- African-inspired art and themes
- Celebrates African identity
- Economic opportunities for African artists
- Representation in Web3

### **5. Production-Ready**
- Comprehensive error handling
- Duplicate reward prevention
- Secure environment configuration
- Transaction verification
- Real-time data synchronization

---

## 🔐 Security Features

- ✅ **Treasury Account Management**: Centralized token minting with proper permissions
- ✅ **Duplicate Prevention**: Checks existing balances before minting
- ✅ **Separate Claim Tracking**: Tokens and NFTs tracked independently
- ✅ **Environment Variables**: No hardcoded credentials
- ✅ **Permission Validation**: Verifies minting permissions
- ✅ **Input Validation**: Comprehensive error handling
- ✅ **Transaction Verification**: Waits for blockchain confirmation

---

## 📈 Roadmap

### **Phase 1: Core Features** ✅ (Current)
- [x] Endless runner gameplay with 3 stages
- [x] HTS token integration (QuestCoin)
- [x] NFT badge system
- [x] Smart contract deployment
- [x] Wallet integration
- [x] Leaderboards
- [x] Knowledge questions

### **Phase 2: Enhanced Features** 🚧 (In Progress)
- [ ] NFT marketplace for trading
- [ ] Mobile app (iOS/Android)
- [ ] Multiplayer mode
- [ ] Additional stages and themes
- [ ] Power-ups and special items
- [ ] Social features (friends, clans)

### **Phase 3: Ecosystem Expansion** 🔮 (Future)
- [ ] DeFi integration (staking, liquidity pools)
- [ ] Cross-game NFT compatibility
- [ ] DAO governance for community decisions
- [ ] Tournament system with prize pools
- [ ] Educational content partnerships
- [ ] Mainnet deployment

---

## 🔗 Hedera Services Integration

### **Hedera Token Service (HTS)** 💰

We leverage HTS to create a complete token economy within the game:

#### **QuestCoin - Fungible Token**
```javascript
// Token Creation (scripts/createTokens.js)
const questCoinTx = new TokenCreateTransaction()
  .setTokenName("QuestCoin")
  .setTokenSymbol("QC")
  .setTokenType(TokenType.FungibleCommon)
  .setDecimals(2)
  .setInitialSupply(1000000)
  .setSupplyType(TokenSupplyType.Infinite)
  .setTreasuryAccountId(operatorId)
  .setSupplyKey(operatorKey);
```

**How We Use It:**
- **Token ID**: `0.0.7158216` (QuestCoin)
- **Minting**: Treasury account mints tokens when players complete stages
- **Distribution**: 20 tokens (Stage 1), 50 tokens (Stage 2), 100 tokens (Stage 3)
- **Transfers**: Tokens transferred directly to player wallets
- **Balance Queries**: Real-time balance checks via Mirror Node API

#### **Badge NFTs - Non-Fungible Tokens**
```javascript
// NFT Token Creation
const badgeNFTTx = new TokenCreateTransaction()
  .setTokenName("Mindora Runner Badges")
  .setTokenSymbol("MRB")
  .setTokenType(TokenType.NonFungibleUnique)
  .setSupplyType(TokenSupplyType.Infinite)
  .setTreasuryAccountId(operatorId)
  .setSupplyKey(operatorKey)
  .setMetadataKey(operatorKey);
```

**How We Use It:**
- **Token ID**: `0.0.7158217` (Badge NFTs)
- **Metadata**: Each NFT contains JSON metadata with badge info, stage, and timestamp
- **Minting**: Unique NFT minted for each stage completion
- **African Art**: NFTs feature African-inspired designs (Explorer, Adventurer, Master badges)
- **Ownership**: Players own NFTs in their wallets, can trade in marketplace

#### **HTS Implementation in Code**
```typescript
// frontend/src/services/hederaService.ts

// Mint QuestCoin tokens
async mintQuestCoins(amount: number, recipientAccountId: string) {
  const mintTx = new TokenMintTransaction()
    .setTokenId(this.questCoinTokenId)
    .setAmount(amount * 100); // 2 decimal places
  
  const mintSubmit = await mintTx.execute(this.client);
  
  // Transfer to player
  const transferTx = new TransferTransaction()
    .addTokenTransfer(this.questCoinTokenId, this.operatorId, -amount * 100)
    .addTokenTransfer(this.questCoinTokenId, recipientAccountId, amount * 100);
  
  await transferTx.execute(this.client);
}

// Mint NFT Badge
async mintNFTBadge(badgeType: string, recipientAccountId: string) {
  const metadata = Buffer.from(JSON.stringify({
    name: badgeType,
    game: "Mindora Runner",
    stage: stageNumber,
    date: new Date().toISOString(),
    culture: "African-inspired"
  }));
  
  const nftMintTx = new TokenMintTransaction()
    .setTokenId(this.nftTokenId)
    .setMetadata([metadata]);
  
  const mintSubmit = await nftMintTx.execute(this.client);
  
  // Transfer NFT to player
  const transferTx = new TransferTransaction()
    .addNftTransfer(this.nftTokenId, serialNumber, this.operatorId, recipientAccountId);
  
  await transferTx.execute(this.client);
}
```

### **Hedera Smart Contract Service (HSCS)** 🧠

We use HSCS to store game state and logic on-chain:

#### **Smart Contract Deployment**
```solidity
// Smart-contract/MindoraRunnerFinal.sol
contract MindoraRunnerFinal {
    struct Player {
        string username;
        bool isRegistered;
        uint256 currentStage;
        uint256 totalScore;
        uint256 inGameCoins;
        uint256 questTokensEarned;
        uint256 totalGamesPlayed;
        uint256 registrationTime;
    }
    
    mapping(address => Player) public players;
    mapping(uint256 => GameSession[]) public stageLeaderboards;
    mapping(address => mapping(uint256 => bool)) public tokensClaimed;
    mapping(address => mapping(uint256 => bool)) public nftClaimed;
}
```

**How We Use It:**
- **Contract ID**: `0.0.7172114` (MindoraRunnerFinal)
- **Player Registration**: On-chain player profiles with username and stats
- **Score Tracking**: All game sessions stored permanently on blockchain
- **Leaderboards**: Stage-specific and general leaderboards
- **Claim Tracking**: Prevents duplicate token/NFT claims
- **Reward Calculation**: Smart contract calculates token rewards based on stage

#### **Contract Interactions**
```typescript
// frontend/src/components/ContractManager.tsx

// Register player on-chain
const registerPlayer = async (username: string) => {
  const tx = new ContractExecuteTransaction()
    .setContractId(contractAddress)
    .setGas(100000)
    .setFunction('registerPlayer', new ContractFunctionParameters()
      .addString(username)
    );
  
  await tx.execute(client);
};

// Save game session to blockchain
const saveGameSession = async (stage, score, coins, questions, completed) => {
  const tx = new ContractExecuteTransaction()
    .setContractId(contractAddress)
    .setGas(200000)
    .setFunction('saveGameSession', new ContractFunctionParameters()
      .addUint256(stage)
      .addUint256(score)
      .addUint256(coins)
      .addUint256(questions)
      .addBool(completed)
    );
  
  await tx.execute(client);
};

// Query player data from contract
const getPlayer = async (address: string) => {
  const query = new ContractCallQuery()
    .setContractId(contractAddress)
    .setGas(50000)
    .setFunction('getPlayer', new ContractFunctionParameters()
      .addAddress(address)
    );
  
  const result = await query.execute(client);
  return decodePlayerData(result);
};
```

### **Hedera Consensus Service (HCS)** 📨

We use HCS for transparent game event logging:

```javascript
// scripts/createHCSTopic.js
const topicCreateTx = new TopicCreateTransaction()
  .setTopicMemo("Mindora Runner Game Events")
  .setAdminKey(operatorKey)
  .setSubmitKey(operatorKey);

// Log game events
const logEvent = async (eventData) => {
  const message = JSON.stringify({
    event: "stage_completed",
    player: playerAddress,
    stage: stageNumber,
    score: finalScore,
    timestamp: new Date().toISOString()
  });
  
  const messageTx = new TopicMessageSubmitTransaction()
    .setTopicId(gameEventsTopic)
    .setMessage(message);
  
  await messageTx.execute(client);
};
```

**How We Use It:**
- **Topic ID**: `0.0.6920083` (Game Events)
- **Event Logging**: All major game events logged to HCS
- **Transparency**: Public verification of achievements
- **Anti-Cheat**: Immutable proof of game sessions
- **Analytics**: Query topic messages for game statistics

### **Integration Benefits**

| Service | Use Case | Benefit |
|---------|----------|---------|
| **HTS** | Token rewards & NFT badges | Real economic value, true ownership |
| **HSCS** | Game state & leaderboards | Permanent storage, trustless verification |
| **HCS** | Event logging | Transparency, anti-cheat, public audit trail |
| **Mirror Node** | Data queries | Real-time balance checks, NFT ownership |

---

## 👥 Team

### **Hedera-Certified Developers**

Our team consists of Hedera-certified blockchain developers passionate about empowering African youth through Web3:

| Team Member | Role | Hedera Certificate |
|-------------|------|-------------------|
| **Ebele Lynda Okolo** | Lead Developer & Blockchain Architect | [View Certificate](https://drive.google.com/file/d/11IjnfTMXMplSn0OzNSyw_x2hJsgy1oKk/view?usp=sharing) |
| **Nnenna Okoye** | Smart Contract Developer & Game Designer | [View Certificate](https://drive.google.com/file/d/1s6nWxzZibfTQ9OxJv6PGp0SmbULynEaO/view?usp=sharing) |
| **Popoola Ramat** | Frontend Developer & UI/UX Designer | [View Certificate](https://drive.google.com/drive/folders/1epy5tV8vF1rmPhkg1jyUxo_hX8JcxY37) |
| **Akpolo Ogagaoghene** | Frontend Developer & Smart Contract Engineer | [View Certificate](https://drive.google.com/file/d/1Rk2UilGbYtENd_uwOGplcCCEn1Gx4bcL/view?usp=sharing) |


### **Our Expertise**
- ✅ Hedera SDK integration (HTS, HSCS, HCS)
- ✅ Smart contract development (Solidity)
- ✅ Full-stack Web3 development
- ✅ Game development and design
- ✅ African cultural representation in tech

---

## 📊 Pitch Deck

Want to learn more about our vision and business model?

**[View Our Pitch Deck](https://gamma.app/docs/Mindera-Run-vrhlj3eicfpnzai)** 🎯

The pitch deck covers:
- Market opportunity in Africa
- Problem-solution fit
- Technical architecture
- Business model and monetization
- Growth strategy and roadmap
- Impact metrics and goals

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### **Areas We Need Help**
- 🎨 African-inspired art and NFT designs
- 🌍 Translations (Swahili, Yoruba, Zulu, etc.)
- 🎮 Game level design
- 📚 Educational content creation
- 🐛 Bug reports and testing
- 📖 Documentation improvements

---

## 📞 Support & Community

- **Live Demo**: [https://mindera-run.vercel.app/](https://mindera-run.vercel.app/)
- **Documentation**: [Complete Technical Docs](./HEDERA_GAME_DOCUMENTATION.md)
- **Deployment Guide**: [Step-by-Step Setup](./DEPLOYMENT_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/MinderaRun/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/MinderaRun/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hedera**: For providing the fast, fair, and sustainable blockchain infrastructure
- **African Youth**: The inspiration and future of this project
- **Open Source Community**: For the amazing tools and libraries
- **Hackathon Organizers**: For the opportunity to build and showcase this project

---

## 🌟 Star Us!

If you find Mindera Run interesting or useful, please consider giving us a star ⭐ on GitHub. It helps us reach more people and grow the community!

---

<div align="center">

**Built with ❤️ for African youth and the Hedera ecosystem**

*Empowering the next generation through play, learning, and earning*

[🎮 **Play Now**](https://mindera-run.vercel.app/) • [📖 Read the Docs](./HEDERA_GAME_DOCUMENTATION.md) • [🚀 Deploy Your Own](./DEPLOYMENT_GUIDE.md)

</div>