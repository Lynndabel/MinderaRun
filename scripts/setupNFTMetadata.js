/**
 * NFT Metadata Setup Script for Mindora Runner Badges
 *
 * This script helps you create metadata for each stage badge NFT.
 * Each stage has a different image and metadata.
 *
 * BEFORE RUNNING:
 * 1. Upload your 3 badge images to IPFS or cloud storage
 * 2. Update the IMAGE_URLS below with your uploaded image URLs
 * 3. Run this script: node setupNFTMetadata.js
 * 4. Use the generated metadata when minting NFTs
 */

const fs = require('fs');
const path = require('path');

// ===== UPDATE THESE WITH YOUR BADGE IMAGE URLS =====
const IMAGE_URLS = {
  stage1: "https://YOUR_IPFS_OR_STORAGE/explorer-badge.png",      // 🎯 Explorer Badge - Stage 1
  stage2: "https://YOUR_IPFS_OR_STORAGE/adventurer-badge.png",    // ⚔️ Adventurer Badge - Stage 2
  stage3: "https://YOUR_IPFS_OR_STORAGE/master-badge.png"         // 👑 Master Badge - Stage 3
};

// NFT Metadata for each stage badge
const BADGE_METADATA = {
  "Explorer Badge": {
    name: "Explorer Badge",
    description: "Awarded to brave explorers who completed Stage 1 of Mindora Runner. You've taken your first steps in this epic journey!",
    image: IMAGE_URLS.stage1,
    type: "image/png",
    attributes: [
      { trait_type: "Stage", value: "1" },
      { trait_type: "Badge Type", value: "Explorer" },
      { trait_type: "Reward", value: "20 QuestCoins" },
      { trait_type: "Difficulty", value: "Beginner" },
      { trait_type: "Rarity", value: "Common" }
    ]
  },
  "Adventurer Badge": {
    name: "Adventurer Badge",
    description: "Awarded to skilled adventurers who conquered Stage 2 of Mindora Runner. Your courage and skill are proven!",
    image: IMAGE_URLS.stage2,
    type: "image/png",
    attributes: [
      { trait_type: "Stage", value: "2" },
      { trait_type: "Badge Type", value: "Adventurer" },
      { trait_type: "Reward", value: "50 QuestCoins" },
      { trait_type: "Difficulty", value: "Intermediate" },
      { trait_type: "Rarity", value: "Rare" }
    ]
  },
  "Master Badge": {
    name: "Master Badge",
    description: "Awarded to elite masters who triumphed over Stage 3 of Mindora Runner. You are a true champion and legend!",
    image: IMAGE_URLS.stage3,
    type: "image/png",
    attributes: [
      { trait_type: "Stage", value: "3" },
      { trait_type: "Badge Type", value: "Master" },
      { trait_type: "Reward", value: "100 QuestCoins" },
      { trait_type: "Difficulty", value: "Expert" },
      { trait_type: "Rarity", value: "Legendary" }
    ]
  }
};

function generateMetadataFiles() {
  console.log("🎨 NFT Metadata Generator for Mindora Runner\n");

  // Check if image URLs are set
  if (IMAGE_URLS.stage1.includes("YOUR_IPFS")) {
    console.error("❌ ERROR: Image URLs not set!\n");
    console.log("📋 Please follow these steps:\n");
    console.log("1. Create 3 badge images:");
    console.log("   - explorer-badge.png (Stage 1: 🎯)");
    console.log("   - adventurer-badge.png (Stage 2: ⚔️)");
    console.log("   - master-badge.png (Stage 3: 👑)\n");
    console.log("2. Upload images to IPFS (e.g., Pinata.cloud) or cloud storage");
    console.log("3. Get the public URLs for each image");
    console.log("4. Update IMAGE_URLS in this script");
    console.log("5. Run this script again\n");
    return false;
  }

  // Create output directory
  const outputDir = path.join(__dirname, '../nft-metadata');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate metadata files
  console.log("✅ Generating metadata files...\n");

  Object.entries(BADGE_METADATA).forEach(([badgeName, metadata]) => {
    const stage = metadata.attributes.find(attr => attr.trait_type === "Stage").value;
    const filename = `stage${stage}-metadata.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Created: ${filename}`);
    console.log(`   Name: ${metadata.name}`);
    console.log(`   Image: ${metadata.image}\n`);
  });

  // Create config file for easy reference
  const configPath = path.join(outputDir, 'metadata-config.json');
  const config = {
    note: "Badge metadata for Mindora Runner - Use these when minting NFTs",
    badges: BADGE_METADATA,
    imageUrls: IMAGE_URLS
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Created: metadata-config.json\n`);

  console.log("🎉 Metadata generation complete!\n");
  console.log("📋 Next steps:");
  console.log("1. Review the JSON files in 'nft-metadata' folder");
  console.log("2. When minting NFTs, use the metadata from these files");
  console.log("3. The metadata includes the image URL and attributes\n");

  return true;
}

// Export for use in other scripts
module.exports = { BADGE_METADATA, generateMetadataFiles };

// Run if called directly
if (require.main === module) {
  generateMetadataFiles();
}
