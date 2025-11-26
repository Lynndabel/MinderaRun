"use client";

import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, projectId, networks } from "@/config/wagmi";
import { ReactNode } from "react";

// Create metadata for your dApp
const metadata = {
  name: "Mindora Runner",
  description: "Educational GameFi Platform on Hedera - Run, Learn, Earn",
  url: "https://mindora-runner.com",
  icons: ["https://mindora-runner.com/logo.png"],
};

// Log network info for debugging
console.log(`🌍 AppKit Environment: ${process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}`);
console.log(`📡 Supported Networks:`, networks.map(n => n.name));

// Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  metadata,
  networks: networks as [typeof networks[number], ...typeof networks[number][]],
  projectId,
  features: {
    analytics: true, // Enable analytics
    email: false, // Disable email login for now
    socials: [], // No social logins for simplicity
    emailShowWallets: false,
  },
  themeMode: 'dark', // Match your game's dark theme
  themeVariables: {
    '--w3m-color-mix': '#FF69B4', // Pink accent to match your game
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#FF69B4',
  }
});

interface AppKitProviderProps {
  children: ReactNode;
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return <>{children}</>;
}