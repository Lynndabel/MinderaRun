// config/contracts.ts

// Helper function to get contract addresses based on environment
export const getContractAddresses = () => {
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';

  if (network === 'mainnet') {
    return {
      MINDORA_RUNNER: process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS as `0x${string}`,
      QUESTCOIN_TOKEN: process.env.NEXT_PUBLIC_MAINNET_QUESTCOIN_TOKEN_ID as string,
      BADGE_NFT_TOKEN: process.env.NEXT_PUBLIC_MAINNET_BADGE_NFT_TOKEN_ID as string,
    };
  } else {
    // Testnet addresses (current deployment)
    return {
      MINDORA_RUNNER: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      QUESTCOIN_TOKEN: process.env.NEXT_PUBLIC_QUESTCOIN_TOKEN_ID as string,
      BADGE_NFT_TOKEN: process.env.NEXT_PUBLIC_BADGE_NFT_TOKEN_ID as string,
    };
  }
};

// Convert Hedera contract ID to EVM address format
export const hederaToEvmAddress = (hederaAddress: string): `0x${string}` => {
  // For now, we'll use the deployed EVM address directly
  // In production, you might want to convert Hedera IDs to EVM addresses
  if (hederaAddress === '0.0.6920065') {
    // Your deployed contract's EVM address
    return '0x0f764437ffBE1fcd0d0d276a164610422710B482';
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

  return {
    MINDORA_RUNNER: hederaToEvmAddress(addresses.MINDORA_RUNNER),
    QUESTCOIN_TOKEN: addresses.QUESTCOIN_TOKEN,
    BADGE_NFT_TOKEN: addresses.BADGE_NFT_TOKEN,
  };
};

// Re-export ABIs from separate files
export * from './abis';