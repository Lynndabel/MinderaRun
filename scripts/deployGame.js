const {
  Client,
  PrivateKey,
  AccountId,
  ContractCreateFlow,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TopicCreateTransaction,
  Hbar
} = require("@hashgraph/sdk");

const fs = require('fs');
const path = require('path');

async function deployMindoraRunner() {
  console.log("🚀 Deploying Mindora Runner to Hedera Testnet...\n");

  // Initialize client
  const client = Client.forTestnet();

  // Get operator from environment
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error("Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables");
  }

  client.setOperator(
    AccountId.fromString(operatorId),
    PrivateKey.fromString(operatorKey)
  );

  try {
    // Step 1: Deploy Smart Contract
    console.log("📋 Step 1: Deploying Smart Contract...");

    // Read compiled bytecode (you'll need to compile your contract first)
    const contractBytecode = "0x608060405234801561001057600080fd5b50..."; // Your compiled bytecode here

    const contractCreateFlow = new ContractCreateFlow()
      .setGas(1000000)
      .setBytecode(contractBytecode)
      .setMaxTransactionFee(new Hbar(20));

    const contractResponse = await contractCreateFlow.execute(client);
    const contractReceipt = await contractResponse.getReceipt(client);
    const contractId = contractReceipt.contractId.toString();

    console.log(`✅ Smart Contract deployed: ${contractId}`);
    console.log(`🔗 Hashscan: https://hashscan.io/testnet/contract/${contractId}\n`);

    // Step 2: Create QuestCoin Token
    console.log("🪙 Step 2: Creating QuestCoin Token...");

    const questCoinTx = new TokenCreateTransaction()
      .setTokenName("QuestCoin")
      .setTokenSymbol("QC")
      .setDecimals(2)
      .setInitialSupply(1000000)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTreasuryAccountId(client.operatorAccountId)
      .setAdminKey(client.operatorPublicKey)
      .setSupplyKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(20));

    const questCoinResponse = await questCoinTx.execute(client);
    const questCoinReceipt = await questCoinResponse.getReceipt(client);
    const questCoinId = questCoinReceipt.tokenId.toString();

    console.log(`✅ QuestCoin Token created: ${questCoinId}`);
    console.log(`🔗 Hashscan: https://hashscan.io/testnet/token/${questCoinId}\n`);

    // Step 3: Create Badge NFT Token
    console.log("🏆 Step 3: Creating Badge NFT Token...");

    const badgeNFTTx = new TokenCreateTransaction()
      .setTokenName("Mindora Runner Badges")
      .setTokenSymbol("MRB")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setTreasuryAccountId(client.operatorAccountId)
      .setAdminKey(client.operatorPublicKey)
      .setSupplyKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(20));

    const badgeNFTResponse = await badgeNFTTx.execute(client);
    const badgeNFTReceipt = await badgeNFTResponse.getReceipt(client);
    const badgeNFTId = badgeNFTReceipt.tokenId.toString();

    console.log(`✅ Badge NFT Token created: ${badgeNFTId}`);
    console.log(`🔗 Hashscan: https://hashscan.io/testnet/token/${badgeNFTId}\n`);

    // Step 4: Create HCS Topic (Optional)
    console.log("📝 Step 4: Creating HCS Topic for Game Events...");

    const topicTx = new TopicCreateTransaction()
      .setTopicMemo("Mindora Runner Game Events")
      .setMaxTransactionFee(new Hbar(5));

    const topicResponse = await topicTx.execute(client);
    const topicReceipt = await topicResponse.getReceipt(client);
    const topicId = topicReceipt.topicId.toString();

    console.log(`✅ HCS Topic created: ${topicId}`);
    console.log(`🔗 Hashscan: https://hashscan.io/testnet/topic/${topicId}\n`);

    // Step 5: Generate .env file
    console.log("📄 Step 5: Generating environment configuration...");

    const envContent = `# Hedera Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet

# Your Hedera Account (Treasury/Operator)
NEXT_PUBLIC_HEDERA_OPERATOR_ID=${operatorId}
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=${operatorKey}

# Smart Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=${contractId}

# HTS Token IDs
NEXT_PUBLIC_QUESTCOIN_TOKEN_ID=${questCoinId}
NEXT_PUBLIC_BADGE_NFT_TOKEN_ID=${badgeNFTId}

# HCS Topic ID
NEXT_PUBLIC_GAME_EVENTS_TOPIC=${topicId}

# Development Settings
NODE_ENV=development`;

    const envPath = path.join(__dirname, '../Frontend/.env.local');
    fs.writeFileSync(envPath, envContent);

    console.log(`✅ Environment file created: ${envPath}\n`);

    // Step 6: Summary
    console.log("🎉 DEPLOYMENT COMPLETE! 🎉\n");
    console.log("📋 Summary:");
    console.log(`   Smart Contract: ${contractId}`);
    console.log(`   QuestCoin Token: ${questCoinId}`);
    console.log(`   Badge NFT Token: ${badgeNFTId}`);
    console.log(`   Game Events Topic: ${topicId}`);
    console.log("\n🚀 Next steps:");
    console.log("   1. Run 'npm install' in the Frontend directory");
    console.log("   2. Run 'npm run dev' to start the development server");
    console.log("   3. Test the game flow!");
    console.log("\n💰 Estimated cost: ~65 HBAR ($3-5)");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
  } finally {
    client.close();
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployMindoraRunner().catch(console.error);
}

module.exports = { deployMindoraRunner };