const {
  Client,
  ContractCreateTransaction,
  FileCreateTransaction,
  FileAppendTransaction,
  Hbar
} = require("@hashgraph/sdk");
const fs = require("fs");

// Load environment variables
require('dotenv').config();

// Your account details from environment variables
const operatorId = process.env.HEDERA_OPERATOR_ID;
const operatorKey = process.env.HEDERA_OPERATOR_KEY;

async function deployContract() {
  console.log("🚀 Starting contract deployment...");

  // Create Hedera client
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  try {
    // Step 1: Read the compiled contract bytecode
    // First, you need to compile MindoraRunnerFinal.sol and get the bytecode
    console.log("📝 Please compile your contract first:");
    console.log("1. Go to https://remix.ethereum.org");
    console.log("2. Create MindoraRunnerFinal.sol");
    console.log("3. Compile it");
    console.log("4. Copy the bytecode from the compilation artifacts");
    console.log("5. Save it as 'contractBytecode.txt' in this scripts folder");

    // Check if bytecode file exists
    if (!fs.existsSync('./contractBytecode.txt')) {
      console.log("❌ contractBytecode.txt not found!");
      console.log("Please compile your contract first and save the bytecode.");
      return;
    }

    const contractBytecode = fs.readFileSync('./contractBytecode.txt', 'utf8').trim();

    // Step 2: Upload contract to Hedera file service
    console.log("📤 Uploading contract to Hedera...");

    const fileCreateTx = new FileCreateTransaction()
      .setContents(contractBytecode)
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId;

    console.log(`✅ Contract uploaded to file: ${bytecodeFileId}`);

    // Step 3: Deploy the contract
    console.log("🏗️ Deploying contract...");

    const contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(100000)
      .setMaxTransactionFee(new Hbar(10));

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateRx = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateRx.contractId;

    console.log(`🎉 CONTRACT DEPLOYED SUCCESSFULLY!`);
    console.log(`📍 Contract ID: ${contractId}`);
    console.log(`🔗 View on Hashscan: https://hashscan.io/testnet/contract/${contractId}`);

    // Step 4: Update environment file
    console.log("📝 Updating .env.local...");

    const envPath = '../Frontend/.env.local';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace('NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.CONTRACT_ID', `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractId}`);
    fs.writeFileSync(envPath, envContent);

    console.log("✅ Environment updated!");
    console.log("🎯 Next step: Create HTS tokens using createTokens.js");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }

  client.close();
}

// Run deployment
deployContract();