<<<<<<< HEAD
# Technical Product Requirements Document
## Play, Learn, and Earn - Hedera GameFi Platform

---

## 1. Technical Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                       │
│         (React/Next.js + Web3 Integration)              │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                     Backend Layer                        │
│           (Node.js/Express + Hedera SDK)                │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  Hedera Network Layer                    │
│     (Smart Contracts + HTS + Consensus Service)         │
└─────────────────────────────────────────────────────────┘
```

### Core Components
- **Frontend Application**: Web3-enabled progressive web app
- **Backend Services**: API server, game logic engine, reward distribution system
- **Smart Contracts**: Game mechanics, token economics, NFT management
- **Database Layer**: User profiles, game state, leaderboards
- **Caching Layer**: Redis for session management and real-time data

---

## 2. Technology Stack

### Frontend Stack
- **Framework**: Next.js 14+ (React 18+)
- **Styling**: Tailwind CSS + Framer Motion for animations
- **State Management**: Zustand or Redux Toolkit
- **Web3 Integration**: 
  - HashConnect for wallet connection
  - Hedera SDK for JavaScript
  - WalletConnect support
- **UI Components**: Radix UI or Chakra UI
- **Game Engine**: Phaser.js or PixiJS for interactive elements
- **Build Tools**: Vite or Next.js built-in bundler
- **Testing**: Jest, React Testing Library, Cypress

### Backend Stack
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js or Fastify
- **API Layer**: GraphQL (Apollo Server) or REST
- **Database**: 
  - PostgreSQL for relational data
  - MongoDB for flexible game data
  - Redis for caching and sessions
- **Message Queue**: Bull or RabbitMQ for async tasks
- **Hedera Integration**: Hedera SDK for JavaScript
- **Authentication**: JWT + OAuth2
- **Testing**: Jest, Supertest
- **Monitoring**: Prometheus + Grafana

### Smart Contract Stack
- **Language**: Solidity 0.8.x
- **Development Framework**: Hardhat or Foundry
- **Testing**: Hardhat Test Suite, Chai
- **Deployment**: Hedera Smart Contract Service
- **Token Standards**: HTS (Hedera Token Service)
- **Upgradability**: Proxy patterns (UUPS/Transparent)

### Infrastructure Stack
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional for scale)
- **CI/CD**: GitHub Actions or GitLab CI
- **Cloud Provider**: AWS, GCP, or Azure
- **CDN**: Cloudflare or AWS CloudFront
- **Monitoring**: DataDog or New Relic
- **Logging**: ELK Stack or CloudWatch

---

## 3. Hedera Integration Implementation

### Step 1: Environment Setup

#### Backend Environment Configuration
```javascript
// config/hedera.config.js
module.exports = {
  network: process.env.HEDERA_NETWORK || 'testnet',
  operatorId: process.env.HEDERA_OPERATOR_ID,
  operatorKey: process.env.HEDERA_OPERATOR_KEY,
  mirrorNode: process.env.HEDERA_MIRROR_NODE || 'testnet.mirrornode.hedera.com',
  gameTokenId: process.env.GAME_TOKEN_ID,
  nftTokenId: process.env.NFT_TOKEN_ID,
  treasuryId: process.env.TREASURY_ACCOUNT_ID,
  treasuryKey: process.env.TREASURY_PRIVATE_KEY
};
```

#### Initialize Hedera Client
```javascript
// services/hedera.service.js
const { Client, PrivateKey, AccountId } = require("@hashgraph/sdk");

class HederaService {
  constructor() {
    this.client = this.initializeClient();
  }

  initializeClient() {
    const client = Client.forTestnet(); // or Client.forMainnet()
    client.setOperator(
      AccountId.fromString(config.operatorId),
      PrivateKey.fromString(config.operatorKey)
    );
    client.setDefaultMaxTransactionFee(100000000); // 1 HBAR
    client.setMaxQueryPayment(50000000); // 0.5 HBAR
    return client;
  }
}
```

### Step 2: Token Creation and Management

#### Create Game Token (Fungible)
```javascript
// contracts/GameToken.js
const {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar
} = require("@hashgraph/sdk");

async function createGameToken() {
  const transaction = new TokenCreateTransaction()
    .setTokenName("Play Learn Earn Token")
    .setTokenSymbol("PLE")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(1000000000) // 10 million tokens
    .setTreasuryAccountId(treasuryAccountId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(10000000000) // 100 million max
    .setSupplyKey(supplyKey)
    .setAdminKey(adminKey)
    .setFreezeDefault(false);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const tokenId = receipt.tokenId;
  
  return tokenId;
}
```

#### Create NFT Collection
```javascript
// contracts/NFTCollection.js
async function createNFTCollection() {
  const transaction = new TokenCreateTransaction()
    .setTokenName("Play Learn Earn Badges")
    .setTokenSymbol("PLEB")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryAccountId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .setAdminKey(adminKey)
    .setMetadataKey(metadataKey)
    .setCustomFees([
      new CustomRoyaltyFee()
        .setNumerator(5)
        .setDenominator(100)
        .setFeeCollectorAccountId(treasuryAccountId)
    ]);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  return receipt.tokenId;
}
```

### Step 3: Smart Contract Development

#### Main Game Contract
```solidity
// contracts/PlayLearnEarn.sol
pragma solidity ^0.8.0;

import "./IHederaTokenService.sol";
import "./HederaResponseCodes.sol";

contract PlayLearnEarn is HederaTokenService {
    address public gameToken;
    address public nftCollection;
    address public treasury;
    
    struct Stage {
        uint256 id;
        string name;
        uint256 difficulty;
        uint256 tokenReward;
        uint256 minScore;
        bool requiresPreviousStage;
    }
    
    struct Player {
        address wallet;
        uint256 currentStage;
        uint256 totalScore;
        uint256 tokensEarned;
        uint256[] completedStages;
        mapping(uint256 => bool) hasCompletedStage;
        mapping(uint256 => uint256) stageScores;
    }
    
    mapping(address => Player) public players;
    mapping(uint256 => Stage) public stages;
    uint256 public totalStages;
    
    event StageCompleted(address player, uint256 stageId, uint256 score, uint256 reward);
    event NFTMinted(address player, uint256 tokenId, string metadata);
    event TokensEarned(address player, uint256 amount);
    
    function initializeStages() external onlyOwner {
        stages[1] = Stage(1, "Beginner", 1, 100, 60, false);
        stages[2] = Stage(2, "Intermediate", 2, 250, 70, true);
        stages[3] = Stage(3, "Advanced", 3, 500, 80, true);
        stages[4] = Stage(4, "Mastery", 4, 1000, 90, true);
        totalStages = 4;
    }
    
    function completeStage(
        uint256 stageId, 
        uint256 score,
        bytes memory quizProof
    ) external returns (bool) {
        require(validateQuizCompletion(quizProof), "Invalid quiz proof");
        require(score >= stages[stageId].minScore, "Score too low");
        
        Player storage player = players[msg.sender];
        
        if (stages[stageId].requiresPreviousStage) {
            require(
                player.hasCompletedStage[stageId - 1], 
                "Previous stage not completed"
            );
        }
        
        player.stageScores[stageId] = score;
        player.hasCompletedStage[stageId] = true;
        player.completedStages.push(stageId);
        player.totalScore += score;
        player.currentStage = stageId + 1;
        
        // Distribute token rewards
        uint256 reward = calculateReward(stageId, score);
        distributeTokens(msg.sender, reward);
        
        // Mint achievement NFT
        if (shouldMintNFT(stageId, score)) {
            mintAchievementNFT(msg.sender, stageId, score);
        }
        
        emit StageCompleted(msg.sender, stageId, score, reward);
        return true;
    }
    
    function distributeTokens(address player, uint256 amount) internal {
        int response = HederaTokenService.transferToken(
            gameToken,
            treasury,
            player,
            int64(amount)
        );
        require(response == HederaResponseCodes.SUCCESS, "Token transfer failed");
        
        players[player].tokensEarned += amount;
        emit TokensEarned(player, amount);
    }
}
```

### Step 4: Backend API Implementation

#### Game Service Layer
```javascript
// services/game.service.js
class GameService {
  constructor(hederaService, dbService) {
    this.hedera = hederaService;
    this.db = dbService;
  }

  async startGame(userId) {
    const player = await this.db.getPlayer(userId);
    if (!player) {
      return await this.createNewPlayer(userId);
    }
    return this.loadPlayerState(player);
  }

  async submitStageCompletion(userId, stageId, answers) {
    // Validate answers
    const score = await this.calculateScore(stageId, answers);
    
    // Generate proof for blockchain
    const proof = this.generateQuizProof(userId, stageId, answers, score);
    
    // Submit to smart contract
    const tx = await this.hedera.submitStageCompletion(
      userId,
      stageId,
      score,
      proof
    );
    
    // Update database
    await this.db.updatePlayerProgress(userId, stageId, score);
    
    // Check for achievements
    const achievements = await this.checkAchievements(userId, stageId, score);
    
    return {
      success: true,
      score,
      transactionId: tx.transactionId,
      achievements
    };
  }

  async distributeRewards(userId, stageId, score) {
    const rewards = this.calculateRewards(stageId, score);
    
    // Distribute tokens
    if (rewards.tokens > 0) {
      await this.hedera.transferTokens(
        userId,
        rewards.tokens
      );
    }
    
    // Mint NFTs
    if (rewards.nfts.length > 0) {
      for (const nft of rewards.nfts) {
        await this.hedera.mintNFT(userId, nft);
      }
    }
    
    return rewards;
  }
}
```

#### API Routes
```javascript
// routes/game.routes.js
const express = require('express');
const router = express.Router();

// Start/Resume game
router.post('/game/start', authenticate, async (req, res) => {
  const gameState = await gameService.startGame(req.user.id);
  res.json({ success: true, gameState });
});

// Submit stage completion
router.post('/stage/:stageId/complete', authenticate, async (req, res) => {
  const { stageId } = req.params;
  const { answers } = req.body;
  
  const result = await gameService.submitStageCompletion(
    req.user.id,
    stageId,
    answers
  );
  
  res.json(result);
});

// Get leaderboard
router.get('/leaderboard/:stageId?', async (req, res) => {
  const { stageId } = req.params;
  const leaderboard = await gameService.getLeaderboard(stageId);
  res.json({ leaderboard });
});

// Get player NFTs
router.get('/player/nfts', authenticate, async (req, res) => {
  const nfts = await hederaService.getPlayerNFTs(req.user.walletAddress);
  res.json({ nfts });
});
```

### Step 5: Frontend Implementation

#### Wallet Connection
```typescript
// hooks/useHedera.ts
import { HashConnect } from 'hashconnect';
import { useState, useEffect } from 'react';

export const useHedera = () => {
  const [hashConnect, setHashConnect] = useState<HashConnect>();
  const [accountId, setAccountId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const hc = new HashConnect();
      
      const appMetadata = {
        name: "Play Learn Earn",
        description: "GameFi Learning Platform",
        icon: "/logo.png"
      };
      
      await hc.init(appMetadata);
      setHashConnect(hc);
      
      hc.pairingEvent.on((pairingData) => {
        setAccountId(pairingData.accountIds[0]);
        setIsConnected(true);
      });
    };
    
    init();
  }, []);

  const connectWallet = async () => {
    if (!hashConnect) return;
    
    const pairingString = hashConnect.generatePairingString(
      {
        name: "Play Learn Earn",
        network: "testnet"
      },
      "https://playlearnrearn.com"
    );
    
    // Display pairing string for wallet connection
    return pairingString;
  };

  return { connectWallet, accountId, isConnected };
};
```

#### Game Stage Component
```typescript
// components/GameStage.tsx
import { useState } from 'react';
import { useGameContext } from '@/contexts/GameContext';

const GameStage: React.FC<{ stageId: number }> = ({ stageId }) => {
  const { submitStage, currentStage } = useGameContext();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitStage(stageId, answers);
      
      if (result.success) {
        // Show rewards animation
        showRewardsModal(result.rewards);
        
        // Update UI state
        updateGameProgress(result);
      }
    } catch (error) {
      console.error('Stage submission failed:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="stage-container">
      <StageHeader stage={currentStage} />
      <QuizComponent 
        questions={currentStage.questions}
        onAnswerChange={setAnswers}
      />
      <ProgressBar progress={calculateProgress(answers)} />
      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting || !isComplete(answers)}
      >
        Complete Stage
      </Button>
    </div>
  );
};
```

### Step 6: Database Schema

#### PostgreSQL Schema
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Players game data
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    current_stage INTEGER DEFAULT 1,
    total_score INTEGER DEFAULT 0,
    tokens_earned DECIMAL(20, 2) DEFAULT 0,
    nfts_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Stage progress
CREATE TABLE stage_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id),
    stage_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completion_time INTEGER,
    transaction_id VARCHAR(255),
    completed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(player_id, stage_id)
);

-- NFT inventory
CREATE TABLE nft_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id),
    token_id VARCHAR(255) NOT NULL,
    serial_number BIGINT NOT NULL,
    metadata JSONB,
    minted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(token_id, serial_number)
);

-- Leaderboard
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id),
    stage_id INTEGER,
    score INTEGER NOT NULL,
    rank INTEGER,
    period VARCHAR(50), -- daily, weekly, all-time
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_leaderboard_rank (stage_id, period, rank)
);
```

### Step 7: Deployment Process

#### Smart Contract Deployment
```javascript
// scripts/deploy.js
const hre = require("hardhat");
const { Client, ContractCreateFlow, PrivateKey } = require("@hashgraph/sdk");

async function deployContracts() {
  // 1. Compile contracts
  await hre.run("compile");
  
  // 2. Deploy to Hedera
  const client = Client.forTestnet();
  client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);
  
  // 3. Deploy main game contract
  const contractBytecode = fs.readFileSync("./artifacts/PlayLearnEarn.bin");
  
  const contractCreate = new ContractCreateFlow()
    .setGas(100000)
    .setBytecode(contractBytecode)
    .setConstructorParameters(
      new ContractFunctionParameters()
        .addAddress(gameTokenAddress)
        .addAddress(nftTokenAddress)
    );
    
  const txResponse = await contractCreate.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const contractId = receipt.contractId;
  
  console.log(`Contract deployed: ${contractId}`);
  
  // 4. Initialize contract
  await initializeContract(contractId);
  
  // 5. Verify on HashScan
  await verifyContract(contractId);
  
  return contractId;
}
```

#### Backend Deployment
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - HEDERA_NETWORK=${HEDERA_NETWORK}
      - HEDERA_OPERATOR_ID=${HEDERA_OPERATOR_ID}
      - HEDERA_OPERATOR_KEY=${HEDERA_OPERATOR_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run start:prod

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
      - NEXT_PUBLIC_HEDERA_NETWORK=${HEDERA_NETWORK}
    ports:
      - "80:3000"
    depends_on:
      - backend

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=playlearntearn
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Step 8: Testing Implementation

#### Smart Contract Tests
```javascript
// test/PlayLearnEarn.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PlayLearnEarn", function() {
  let gameContract;
  let owner, player1, player2;
  
  beforeEach(async function() {
    [owner, player1, player2] = await ethers.getSigners();
    
    const PlayLearnEarn = await ethers.getContractFactory("PlayLearnEarn");
    gameContract = await PlayLearnEarn.deploy(tokenAddress, nftAddress);
    await gameContract.deployed();
    
    await gameContract.initializeStages();
  });
  
  it("Should complete stage 1 successfully", async function() {
    const stageId = 1;
    const score = 85;
    const proof = generateProof(player1.address, stageId, score);
    
    await expect(
      gameContract.connect(player1).completeStage(stageId, score, proof)
    ).to.emit(gameContract, "StageCompleted")
     .withArgs(player1.address, stageId, score, 100);
    
    const player = await gameContract.players(player1.address);
    expect(player.currentStage).to.equal(2);
    expect(player.tokensEarned).to.equal(100);
  });
});
```

#### Backend API Tests
```javascript
// test/api.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Game API', () => {
  let authToken;
  
  beforeAll(async () => {
    authToken = await authenticateTestUser();
  });
  
  test('POST /api/game/start', async () => {
    const response = await request(app)
      .post('/api/game/start')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.gameState).toBeDefined();
    expect(response.body.gameState.currentStage).toBe(1);
  });
  
  test('POST /api/stage/1/complete', async () => {
    const answers = [
      { questionId: 1, answer: 'a' },
      { questionId: 2, answer: 'b' }
    ];
    
    const response = await request(app)
      .post('/api/stage/1/complete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ answers })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.score).toBeGreaterThan(0);
    expect(response.body.transactionId).toBeDefined();
  });
});
```

### Step 9: Security Implementation

#### Security Measures
```javascript
// middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Input validation
const validateStageSubmission = (req, res, next) => {
  const { stageId } = req.params;
  const { answers } = req.body;
  
  if (!stageId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  // Validate each answer
  for (const answer of answers) {
    if (!answer.questionId || !answer.answer) {
      return res.status(400).json({ error: 'Invalid answer format' });
    }
  }
  
  next();
};
```

### Step 10: Monitoring and Analytics

#### Monitoring Setup
```javascript
// monitoring/metrics.js
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeGames = new prometheus.Gauge({
  name: 'active_games',
  help: 'Number of active game sessions'
});

const tokenTransactions = new prometheus.Counter({
  name: 'token_transactions_total',
  help: 'Total number of token transactions',
  labelNames: ['type']
});

// Middleware to track metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);
  });
  
  next();
};
```

---

## 4. Development Workflow

### Phase 1: Foundation (Backend Team + Smart Contract Team)
1. Set up Hedera testnet accounts and configuration
2. Deploy token contracts (fungible and NFT)
3. Develop and deploy main game smart contract
4. Set up backend infrastructure and database
5. Implement Hedera SDK integration
6. Create basic API endpoints

### Phase 2: Core Game Logic (All Teams)
1. Implement stage progression system
2. Create quiz/puzzle content management
3. Develop scoring and validation logic
4. Implement reward distribution
5. Set up wallet connection flow
6. Create player registration and profile

### Phase 3: Frontend Development (Frontend Team)
1. Design and implement UI components
2. Integrate wallet connection (HashConnect)
3. Build stage gameplay interface
4. Create leaderboard and social features
5. Implement NFT gallery
6. Add animations and game feel

### Phase 4: Integration (All Teams)
1. Connect frontend to backend APIs
2. Test end-to-end game flow
3. Implement real-time features (WebSocket)
4. Add caching layer
5. Optimize performance
6. Security audit

### Phase 5: Testing and Optimization
1. Comprehensive unit testing
2. Integration testing
3. Load testing
4. Security testing
5. User acceptance testing
6. Performance optimization

### Phase 6: Deployment
1. Deploy smart contracts to mainnet
2. Set up production infrastructure
3. Configure monitoring and alerts
4. Deploy backend services
5. Deploy frontend application
6. DNS and SSL configuration

---

## 5. Key Development Considerations

### Scalability
- Implement horizontal scaling for backend services
- Use caching aggressively for read-heavy operations
- Optimize database queries with proper indexing
- Consider implementing GraphQL for efficient data fetching
- Use CDN for static assets and global distribution

### Security
- Implement comprehensive input validation
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on all endpoints
- Regular security audits of smart contracts
- Encrypt sensitive data at rest and in transit
- Implement proper authentication and authorization

### User Experience
- Minimize blockchain interaction latency
- Implement optimistic UI updates
- Provide clear transaction status feedback
- Design for mobile-first experience
- Implement progressive web app features
- Add offline capability where possible

### Blockchain Optimization
- Batch transactions where possible
- Implement meta-transactions for gasless gameplay
- Use Hedera Consensus Service for non-financial game events
- Optimize smart contract gas consumption
- Consider scheduled tasks for reward distribution

---

## 6. Success Metrics Implementation

### Analytics Events
```javascript
// Track key game events
analytics.track('stage_started', { stageId, userId });
analytics.track('stage_completed', { stageId, score, time, userId });
analytics.track('token_earned', { amount, source, userId });
analytics.track('nft_minted', { tokenId, type, userId });
analytics.track('leaderboard_viewed', { type, userId });
```

### KPI Dashboard
- Real-time active players
- Stage completion rates
- Average time per stage
- Token distribution metrics
- NFT minting statistics
- User retention rates
- Revenue metrics

---

## 7. Maintenance and Updates

### Continuous Deployment Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm test
          npm run test:integration
          
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy contracts
        run: npm run deploy:contracts
      - name: Deploy backend
        run: npm run deploy:backend
      - name: Deploy frontend
        run: npm run deploy:frontend
```

### Version Management
- Use semantic versioning for all components
- Maintain upgrade paths for smart contracts
- Document all API changes
- Implement feature flags for gradual rollouts
- Maintain backward compatibility

This comprehensive technical PRD provides your development team with all the necessary details to build the Play, Learn, and Earn game on Hedera. Each team member can focus on their specific areas while maintaining clear integration points.

---

## 8. Additional Implementation Details

### Content Management System

#### Quiz/Question Management
```javascript
// models/Question.js
const QuestionSchema = {
  id: String,
  stageId: Number,
  type: String, // 'multiple-choice', 'true-false', 'puzzle', 'scenario'
  difficulty: Number,
  question: String,
  options: Array,
  correctAnswer: String,
  explanation: String,
  points: Number,
  timeLimit: Number, // in seconds
  media: {
    type: String, // 'image', 'video', 'audio'
    url: String
  },
  hints: [{
    cost: Number, // token cost
    content: String
  }],
  metadata: {
    category: String,
    tags: Array,
    createdBy: String,
    reviewedBy: String
  }
};

// services/content.service.js
class ContentService {
  async generateStageContent(stageId) {
    const questions = await this.getQuestionsForStage(stageId);
    
    // Randomize question order
    const shuffled = this.shuffleArray(questions);
    
    // Apply difficulty curve
    const weighted = this.applyDifficultyCurve(shuffled, stageId);
    
    // Generate unique session hash for validation
    const sessionHash = this.generateSessionHash(weighted);
    
    return {
      questions: weighted,
      sessionHash,
      totalPoints: weighted.reduce((sum, q) => sum + q.points, 0),
      timeLimit: this.calculateStageTimeLimit(stageId)
    };
  }
  
  async validateAnswers(sessionHash, answers) {
    const session = await this.cache.get(`session:${sessionHash}`);
    if (!session) throw new Error('Invalid session');
    
    let score = 0;
    const results = [];
    
    for (const answer of answers) {
      const question = session.questions.find(q => q.id === answer.questionId);
      const isCorrect = this.checkAnswer(question, answer.answer);
      
      if (isCorrect) {
        score += question.points;
      }
      
      results.push({
        questionId: answer.questionId,
        correct: isCorrect,
        points: isCorrect ? question.points : 0
      });
    }
    
    return { score, results, maxScore: session.totalPoints };
  }
}
```

### Tournament System

#### Tournament Smart Contract
```solidity
// contracts/Tournament.sol
pragma solidity ^0.8.0;

contract Tournament {
    struct TournamentInfo {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        uint256 entryFee;
        uint256 prizePool;
        uint256 maxParticipants;
        uint256[] stageIds;
        mapping(address => bool) hasEntered;
        address[] participants;
        mapping(address => uint256) scores;
    }
    
    mapping(uint256 => TournamentInfo) public tournaments;
    uint256 public nextTournamentId;
    
    event TournamentCreated(uint256 id, string name, uint256 prizePool);
    event PlayerEntered(uint256 tournamentId, address player);
    event TournamentCompleted(uint256 id, address[] winners, uint256[] prizes);
    
    function createTournament(
        string memory name,
        uint256 duration,
        uint256 entryFee,
        uint256[] memory stageIds
    ) external onlyAdmin returns (uint256) {
        uint256 tournamentId = nextTournamentId++;
        
        TournamentInfo storage tournament = tournaments[tournamentId];
        tournament.id = tournamentId;
        tournament.name = name;
        tournament.startTime = block.timestamp;
        tournament.endTime = block.timestamp + duration;
        tournament.entryFee = entryFee;
        tournament.maxParticipants = 100;
        tournament.stageIds = stageIds;
        
        emit TournamentCreated(tournamentId, name, 0);
        return tournamentId;
    }
    
    function enterTournament(uint256 tournamentId) external payable {
        TournamentInfo storage tournament = tournaments[tournamentId];
        require(block.timestamp < tournament.endTime, "Tournament ended");
        require(!tournament.hasEntered[msg.sender], "Already entered");
        require(msg.value == tournament.entryFee, "Incorrect entry fee");
        require(tournament.participants.length < tournament.maxParticipants, "Tournament full");
        
        tournament.hasEntered[msg.sender] = true;
        tournament.participants.push(msg.sender);
        tournament.prizePool += msg.value;
        
        emit PlayerEntered(tournamentId, msg.sender);
    }
    
    function distributePrizes(uint256 tournamentId) external onlyAdmin {
        TournamentInfo storage tournament = tournaments[tournamentId];
        require(block.timestamp > tournament.endTime, "Tournament not ended");
        
        // Get top players
        address[] memory winners = getTopPlayers(tournamentId, 10);
        uint256[] memory prizes = calculatePrizes(tournament.prizePool);
        
        // Distribute prizes
        for (uint i = 0; i < winners.length && i < prizes.length; i++) {
            if (prizes[i] > 0) {
                transferTokens(winners[i], prizes[i]);
            }
        }
        
        emit TournamentCompleted(tournamentId, winners, prizes);
    }
}
```

### Marketplace Implementation

#### NFT Marketplace Contract
```solidity
// contracts/Marketplace.sol
pragma solidity ^0.8.0;

contract NFTMarketplace {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;
    uint256 public marketplaceFee = 250; // 2.5%
    
    event ListingCreated(uint256 listingId, address seller, uint256 tokenId, uint256 price);
    event ListingSold(uint256 listingId, address buyer, uint256 price);
    event ListingCancelled(uint256 listingId);
    
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        
        // Transfer NFT to marketplace
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        uint256 listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });
        
        emit ListingCreated(listingId, msg.sender, tokenId, price);
        return listingId;
    }
    
    function purchaseListing(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value == listing.price, "Incorrect payment");
        
        listing.active = false;
        
        // Calculate fees
        uint256 fee = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).transferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );
        
        // Transfer payment to seller
        payable(listing.seller).transfer(sellerAmount);
        
        // Transfer fee to treasury
        payable(treasury).transfer(fee);
        
        emit ListingSold(listingId, msg.sender, listing.price);
    }
}
```

### Advanced Frontend Components

#### 3D NFT Gallery
```typescript
// components/NFTGallery3D.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

const NFTDisplay = ({ nft, position }) => {
  const [hovered, setHovered] = useState(false);
  
  const { scale } = useSpring({
    scale: hovered ? 1.2 : 1,
    config: { mass: 1, tension: 200, friction: 30 }
  });
  
  return (
    <animated.group position={position} scale={scale}>
      <Box
        args={[2, 2, 0.1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => window.open(`/nft/${nft.id}`)}
      >
        <meshStandardMaterial attach="material">
          <primitive attach="map" object={nft.texture} />
        </meshStandardMaterial>
      </Box>
      <Text position={[0, -1.5, 0]} fontSize={0.3}>
        {nft.name}
      </Text>
    </animated.group>
  );
};

export const NFTGallery3D = ({ nfts }) => {
  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} />
        <OrbitControls enablePan={true} enableZoom={true} />
        
        {nfts.map((nft, index) => (
          <NFTDisplay
            key={nft.id}
            nft={nft}
            position={[
              (index % 5) * 3 - 6,
              Math.floor(index / 5) * 3 - 3,
              0
            ]}
          />
        ))}
      </Canvas>
    </div>
  );
};
```

#### Real-time Multiplayer Quiz
```typescript
// components/MultiplayerQuiz.tsx
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const MultiplayerQuiz = ({ roomId, userId }) => {
  const [socket, setSocket] = useState<Socket>();
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [scores, setScores] = useState({});
  
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
      query: { roomId, userId }
    });
    
    newSocket.on('playerJoined', (player) => {
      setPlayers(prev => [...prev, player]);
    });
    
    newSocket.on('questionStart', (question) => {
      setCurrentQuestion(question);
      setTimeRemaining(question.timeLimit);
    });
    
    newSocket.on('playerAnswered', ({ playerId, correct }) => {
      // Show real-time feedback
      showAnswerFeedback(playerId, correct);
    });
    
    newSocket.on('roundComplete', (roundScores) => {
      setScores(roundScores);
    });
    
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, [roomId, userId]);
  
  const submitAnswer = (answer) => {
    socket?.emit('submitAnswer', {
      questionId: currentQuestion.id,
      answer,
      timestamp: Date.now()
    });
  };
  
  return (
    <div className="multiplayer-quiz">
      <PlayerList players={players} scores={scores} />
      
      <div className="question-container">
        <Timer seconds={timeRemaining} />
        <Question 
          data={currentQuestion} 
          onAnswer={submitAnswer}
        />
      </div>
      
      <LiveLeaderboard scores={scores} />
    </div>
  );
};
```

### WebSocket Server for Real-time Features

```javascript
// websocket/server.js
const { Server } = require('socket.io');
const Redis = require('ioredis');

class GameWebSocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });
    
    this.redis = new Redis();
    this.rooms = new Map();
    
    this.setupHandlers();
  }
  
  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);
      
      socket.on('joinRoom', async ({ roomId, userId }) => {
        socket.join(roomId);
        
        // Add player to room
        const room = await this.getOrCreateRoom(roomId);
        room.players.push({ id: userId, socketId: socket.id });
        
        // Notify other players
        socket.to(roomId).emit('playerJoined', { userId });
        
        // Send current room state
        socket.emit('roomState', room);
      });
      
      socket.on('startGame', async ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        // Start game loop
        this.startGameLoop(roomId);
      });
      
      socket.on('submitAnswer', async (data) => {
        const { roomId, userId, answer } = data;
        
        // Validate and score answer
        const result = await this.processAnswer(roomId, userId, answer);
        
        // Broadcast to all players in room
        this.io.to(roomId).emit('playerAnswered', {
          playerId: userId,
          correct: result.correct,
          score: result.score
        });
        
        // Check if round complete
        if (await this.isRoundComplete(roomId)) {
          this.completeRound(roomId);
        }
      });
      
      socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        this.removePlayerFromRooms(socket.id);
      });
    });
  }
  
  async startGameLoop(roomId) {
    const room = this.rooms.get(roomId);
    const questions = await this.generateQuestions(room.stageId);
    
    for (const question of questions) {
      // Send question to all players
      this.io.to(roomId).emit('questionStart', question);
      
      // Start timer
      await this.startQuestionTimer(roomId, question.timeLimit);
      
      // Calculate scores
      const scores = await this.calculateRoundScores(roomId);
      
      // Send results
      this.io.to(roomId).emit('roundComplete', scores);
      
      // Wait before next question
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Game complete
    this.completeGame(roomId);
  }
}
```

### Admin Dashboard

```typescript
// pages/admin/dashboard.tsx
import { useState, useEffect } from 'react';
import { Card, Grid, Stat } from '@/components/ui';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [realtimeData, setRealtimeData] = useState({});
  
  useEffect(() => {
    // Connect to admin websocket
    const ws = new WebSocket(process.env.NEXT_PUBLIC_ADMIN_WS);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRealtimeData(data);
    };
    
    // Fetch initial metrics
    fetchMetrics();
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="admin-dashboard">
      <Grid cols={4}>
        <Stat
          title="Active Players"
          value={realtimeData.activePlayers || 0}
          change={realtimeData.playerChange}
        />
        <Stat
          title="Games Today"
          value={metrics.gamesToday || 0}
          change={metrics.gameChange}
        />
        <Stat
          title="Tokens Distributed"
          value={metrics.tokensDistributed || 0}
          suffix="PLE"
        />
        <Stat
          title="NFTs Minted"
          value={metrics.nftsMinted || 0}
          change={metrics.nftChange}
        />
      </Grid>
      
      <Card title="Player Activity">
        <RealtimeChart data={realtimeData.playerActivity} />
      </Card>
      
      <Card title="Stage Completion Rates">
        <StageMetrics stages={metrics.stageData} />
      </Card>
      
      <Card title="Token Economy">
        <TokenEconomyDashboard data={metrics.tokenEconomy} />
      </Card>
      
      <Card title="Content Management">
        <ContentManager />
      </Card>
    </div>
  );
};
```

---

## 9. Disaster Recovery and Backup

### Backup Strategy
```bash
# scripts/backup.sh
#!/bin/bash

# Database backup
pg_dump $DATABASE_URL > backups/db_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backups/db_*.sql s3://backup-bucket/database/

# Backup smart contract state
node scripts/backup-contract-state.js

# Backup user uploaded content
rsync -av /var/uploads/ s3://backup-bucket/uploads/
```

### Recovery Plan
1. **Database Recovery**: Restore from latest PostgreSQL backup
2. **Blockchain State**: Use Hedera mirror nodes for transaction history
3. **User Assets**: Verify NFT ownership via Hedera explorer
4. **Configuration**: Store all configs in version control

---

## 10. Performance Optimization

### Caching Strategy
```javascript
// cache/strategy.js
const cacheStrategy = {
  // Static content - 1 hour
  staticContent: 3600,
  
  // User profiles - 5 minutes
  userProfiles: 300,
  
  // Leaderboard - 1 minute
  leaderboard: 60,
  
  // Game state - No cache (real-time)
  gameState: 0,
  
  // NFT metadata - 1 day
  nftMetadata: 86400
};
```

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_stage_progress_player_stage ON stage_progress(player_id, stage_id);
CREATE INDEX idx_leaderboard_stage_score ON leaderboard(stage_id, score DESC);
CREATE INDEX idx_nft_inventory_player ON nft_inventory(player_id);

-- Partitioning for large tables
CREATE TABLE leaderboard_2024 PARTITION OF leaderboard
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

This comprehensive technical PRD provides your team with everything needed to build a production-ready GameFi platform on Hedera. The modular architecture ensures each team can work independently while maintaining clear integration points for seamless collaboration.
=======
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
>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8
