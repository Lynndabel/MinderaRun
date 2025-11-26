import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import "nes.css/css/nes.min.css";
import { WagmiProviderWrapper } from "@/contexts/WagmiProvider";
import { AppKitProvider } from "@/contexts/AppKitProvider";
import { ContractManager } from "@/components/ContractManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Mindora Runner - Learn & Earn on Hedera",
  description: "A pixel art runner game where you learn, collect tokens, and earn NFTs on Hedera network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
        style={{ imageRendering: 'pixelated' }}
      >
        <WagmiProviderWrapper>
          <AppKitProvider>
            <ContractManager />
            {children}
          </AppKitProvider>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
