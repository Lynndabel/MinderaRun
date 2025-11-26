// config/contracts.ts

// Helper function to get contract addresses based on environment
export const getContractAddresses = () => {
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';

  if (network === 'mainnet') {
    return {
      MINDORA_RUNNER: process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS as `0x${string}`,
      QUESTCOIN_TOKEN: process.env.NEXT_PUBLIC_MAINNET_QUESTCOIN_TOKEN_ID as string,
      BADGE_NFT_TOKEN: process.env.NEXT_PUBLIC_MAINNET_BADGE_NFT_TOKEN_ID as string,
      MARKETPLACE: process.env.NEXT_PUBLIC_MAINNET_MARKETPLACE_ADDRESS as `0x${string}`,
    };
  } else {
    // Testnet addresses (current deployment)
    return {
      MINDORA_RUNNER: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      QUESTCOIN_TOKEN: process.env.NEXT_PUBLIC_QUESTCOIN_TOKEN_ID as string,
      BADGE_NFT_TOKEN: process.env.NEXT_PUBLIC_BADGE_NFT_TOKEN_ID as string,
      MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`,
    };
  }
};

// Convert Hedera contract ID to EVM address format
export const hederaToEvmAddress = (hederaAddress: string): `0x${string}` => {
  // For now, we'll use the deployed EVM address directly
  // In production, you might want to convert Hedera IDs to EVM addresses
  // if (hederaAddress === '0.0.6920065') {
  //   // Your deployed contract's EVM address
  //   return '0x0f764437ffBE1fcd0d0d276a164610422710B482';
  // }

  // New deployed contract mapping
  if (hederaAddress === '0.0.7158178') {
    return '0x25596abea049173e53e04c3a7f472bd3f54042e5';
  }

  // Latest deployed contract (Stage unlock fix)
  if (hederaAddress === '0.0.7172114') {
    return '0xa2054053ded91cf7ecd51ea39756857a2f0a5284';
  }

  // NFT Marketplace contract
  if (hederaAddress === '0.0.7161925') {
    return '0x62b2bf3ecc252e3de0405ad18dacacfbc7c6028f';
  }

  // If already EVM format, return as-is
  if (hederaAddress.startsWith('0x')) {
    return hederaAddress as `0x${string}`;
  }

  throw new Error(`Unknown Hedera address: ${hederaAddress}`);
};

// Get contract addresses with EVM format conversion
export const getEvmContractAddresses = () => {
  const addresses = getContractAddresses();
  
  const evmAddress = hederaToEvmAddress(addresses.MINDORA_RUNNER);
  
  // Log contract address for debugging
  console.log('📋 Contract Address Configuration:', {
    network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
    rawAddress: addresses.MINDORA_RUNNER,
    evmAddress: evmAddress,
    envVar: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'not set'
  });

  return {
    MINDORA_RUNNER: evmAddress,
    QUESTCOIN_TOKEN: addresses.QUESTCOIN_TOKEN,
    // Badge NFT Token: 0.0.7158217 → EVM address: 0x00000000000000000000000000000000006d39c9
    BADGE_NFT_TOKEN: '0x00000000000000000000000000000000006d39c9' as `0x${string}`,
    MARKETPLACE: '0x62b2bf3ecc252e3de0405ad18dacacfbc7c6028f' as `0x${string}`,
  };
};

// Re-export ABIs from separate files
export * from './abis';
