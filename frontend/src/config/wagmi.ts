import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from 'viem'

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id-here"

if (!projectId || projectId === "your-project-id-here") {
  console.warn('⚠️ WalletConnect Project ID not configured. Get one at https://cloud.walletconnect.com')
}

// Define Hedera Testnet network configuration
export const hederaTestnet = defineChain({
  id: 296, // Hedera Testnet EVM chain ID
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/testnet'
    },
  },
  testnet: true,
})

// Define Hedera Mainnet network configuration
export const hederaMainnet = defineChain({
  id: 295, // Hedera Mainnet EVM chain ID
  name: 'Hedera Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/mainnet'
    },
  },
  testnet: false,
})

// Select networks based on environment
const isTestnet = process.env.NEXT_PUBLIC_HEDERA_NETWORK === 'testnet'
export const networks = isTestnet ? [hederaTestnet] : [hederaMainnet]

console.log(`🌍 Hedera Environment: ${isTestnet ? 'Testnet' : 'Mainnet'}`)
console.log(`📡 Networks configured:`, networks.map(n => n.name))

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig