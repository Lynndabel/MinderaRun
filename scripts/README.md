# 🚀 Mindora Runner - Deployment Scripts

These scripts help you deploy your game to Hedera Testnet using the Hedera SDK.

---

## 📁 Available Scripts

### 1. `createTokens.js` - Create HTS Tokens
Creates the QuestCoin token and Badge NFT token.

**What it does:**
- ✅ Creates QuestCoin (fungible token) - game currency
- ✅ Creates Mindora Runner Badges (NFT token) - achievement badges
- ✅ Updates `.env.local` with token IDs

**Run:**
```bash
node createTokens.js
```

---

### 2. `createHCSTopic.js` - Create HCS Topic
Creates a Hedera Consensus Service topic for game events.

**What it does:**
- ✅ Creates public topic for game events
- ✅ Tests topic with sample message
- ✅ Updates `.env.local` with topic ID

**Run:**
```bash
node createHCSTopic.js
```

---

### 3. `setupNFTMetadata.js` - Setup NFT Metadata
Generates metadata JSON files for each badge with different images.

**BEFORE RUNNING:**
1. Create 3 badge images (PNG, 512x512px recommended):
   - `explorer-badge.png` (Stage 1: 🎯)
   - `adventurer-badge.png` (Stage 2: ⚔️)
   - `master-badge.png` (Stage 3: 👑)

2. Upload images to IPFS (Pinata.cloud) or cloud storage

3. Update `IMAGE_URLS` in the script with your image URLs

**Run:**
```bash
node setupNFTMetadata.js
```

**Output:**
- `nft-metadata/stage1-metadata.json`
- `nft-metadata/stage2-metadata.json`
- `nft-metadata/stage3-metadata.json`
- `nft-metadata/metadata-config.json`

---

## 🎯 Deployment Order

Follow these steps in order:

### **Step 1: Deploy Smart Contract (Use Remix)**
1. Go to https://remix.ethereum.org
2. Upload `Smart-contract/MindoraRunnerFinal.sol`
3. Compile with Solidity 0.8.19
4. Deploy to Hedera Testnet using Remix
5. Copy the contract address and ABI
6. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`
7. Update frontend ABI in `frontend/src/config/abis/MindoraRunnerABI.ts`

### **Step 2: Create HTS Tokens**
```bash
cd scripts
node createTokens.js
```

### **Step 3: Create HCS Topic (Optional)**
```bash
node createHCSTopic.js
```

### **Step 4: Setup NFT Metadata**
```bash
# 1. Upload your 3 badge images first
# 2. Update IMAGE_URLS in setupNFTMetadata.js
# 3. Run:
node setupNFTMetadata.js
```

### **Step 5: Update Frontend with Metadata**
Update `frontend/src/services/hederaService.ts` with the metadata from the generated JSON files.

---

## 📋 Environment Variables

After running the scripts, your `frontend/.env.local` should have:

```bash
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.YOUR_ID
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.CONTRACT_ID
NEXT_PUBLIC_QUESTCOIN_TOKEN_ID=0.0.TOKEN_ID
NEXT_PUBLIC_BADGE_NFT_TOKEN_ID=0.0.NFT_ID
NEXT_PUBLIC_GAME_EVENTS_TOPIC=0.0.TOPIC_ID
```

---

## 💰 Estimated Costs (Testnet)

- QuestCoin Token: ~20 HBAR
- Badge NFT Token: ~20 HBAR
- HCS Topic: ~5 HBAR
- **Total: ~45 HBAR** (≈ $2-3 USD)

**Note:** Contract deployment is done via Remix (not included in scripts)

---

## 🔧 Prerequisites

```bash
# Install dependencies
npm install @hashgraph/sdk dotenv

# Setup .env file
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY
```

---

## ⚠️ Important Notes

1. **Smart Contract:** Deploy using Remix IDE, not these scripts
2. **NFT Images:** Must upload images BEFORE running setupNFTMetadata.js
3. **Metadata:** Each stage has different metadata and image
4. **Token IDs:** Save all token IDs - you'll need them!

---

## 📚 Resources

- [Hedera Docs](https://docs.hedera.com)
- [Hedera SDK](https://github.com/hashgraph/hedera-sdk-js)
- [Remix IDE](https://remix.ethereum.org)
- [Pinata IPFS](https://pinata.cloud)
- [Hashscan Explorer](https://hashscan.io/testnet)

---

## 🎮 Ready to Play!

After deployment:
```bash
cd frontend
npm run dev
```

Your game is ready at http://localhost:3000

**Have fun! 🎉**
