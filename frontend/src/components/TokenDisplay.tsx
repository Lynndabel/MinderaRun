"use client";

import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useState, useEffect } from "react";
import { type WalletProvider } from "@reown/appkit-adapter-wagmi";
import { formatEther } from "viem";

interface TokenInfo {
  symbol: string;
  balance: string;
  decimals: number;
  address: string;
  name: string;
}

export function TokenDisplay() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<WalletProvider>("wagmi");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Token contracts on Hedera
  const TOKEN_CONTRACTS = {
    QUEST_COIN: process.env.NEXT_PUBLIC_QUEST_COIN_ADDRESS as `0x${string}`,
    BADGE_NFT: process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS as `0x${string}`,
  };

  useEffect(() => {
    if (isConnected && address && walletProvider) {
      fetchTokenBalances();
    }
  }, [isConnected, address, walletProvider]);

  const fetchTokenBalances = async () => {
    if (!address || !walletProvider) return;

    setIsLoading(true);
    setError(null);

    try {
      const provider = walletProvider;
      const tokenList: TokenInfo[] = [];

      // Get ETH balance
      const ethBalance = await provider.getBalance(address);
      tokenList.push({
        symbol: "ETH",
        balance: formatEther(ethBalance),
        decimals: 18,
        address: "0x0000000000000000000000000000000000000000",
        name: "Ethereum",
      });

      // Get token balances (simplified - you'd need actual token contracts)
      if (TOKEN_CONTRACTS.QUEST_COIN) {
        try {
          // This is a placeholder - you'd need to implement actual ERC20 token balance fetching
          tokenList.push({
            symbol: "QC",
            balance: "0", // Would fetch actual balance
            decimals: 18,
            address: TOKEN_CONTRACTS.QUEST_COIN,
            name: "Quest Coin",
          });
        } catch (err) {
          console.error("Error fetching Quest Coin balance:", err);
        }
      }

      setTokens(tokenList);
    } catch (err) {
      console.error("Error fetching token balances:", err);
      setError("Failed to fetch token balances");
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    return num.toFixed(decimals > 0 ? 4 : 0);
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">Connect your wallet to view tokens</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Assets</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchTokenBalances}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tokens found
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => (
            <div key={token.address} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{token.symbol[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{token.name}</p>
                  <p className="text-sm text-gray-500">{token.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatBalance(token.balance, token.decimals)} {token.symbol}
                </p>
                <p className="text-xs text-gray-500">
                  {token.address !== "0x0000000000000000000000000000000000000000" && 
                    `${token.address.substring(0, 6)}...${token.address.substring(token.address.length - 4)}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
