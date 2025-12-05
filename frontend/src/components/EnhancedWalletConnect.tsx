"use client";

import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useState, useEffect } from "react";
import { type WalletProvider } from "@reown/appkit-adapter-wagmi";
import { formatEther, parseEther } from "viem";

export function EnhancedWalletConnect() {
  const { open } = useAppKit();
  const { address, isConnected, isConnectedTestnet } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<WalletProvider>("wagmi");
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get balance when connected
  useEffect(() => {
    if (isConnected && address && walletProvider) {
      getBalance();
    }
  }, [isConnected, address, walletProvider]);

  const getBalance = async () => {
    if (!address || !walletProvider) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const provider = walletProvider;
      const balance = await provider.getBalance(address);
      setBalance(formatEther(balance));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await open();
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // AppKit handles disconnect internally
      setBalance("0");
      setError(null);
    } catch (err) {
      console.error("Error disconnecting:", err);
      setError("Failed to disconnect");
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-800">
            {formatAddress(address)}
          </span>
          <button
            onClick={copyAddress}
            className="text-green-600 hover:text-green-800"
            title="Copy address"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              `${parseFloat(balance).toFixed(4)} ETH`
            )}
          </span>
        </div>

        <button
          onClick={handleDisconnect}
          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 rounded-lg hover:bg-red-100"
        >
          Disconnect
        </button>

        {error && (
          <div className="text-xs text-red-600 max-w-xs">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {error && (
        <div className="text-xs text-red-600 max-w-xs bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
