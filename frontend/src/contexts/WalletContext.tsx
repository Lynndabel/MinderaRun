import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client, AccountId, PrivateKey, AccountBalanceQuery, Hbar } from "@hashgraph/sdk";

type WalletContextType = {
  isConnected: boolean;
  accountId: string | null;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkConnection = async () => {
      const savedAccountId = localStorage.getItem('hederaAccountId');
      if (savedAccountId) {
        try {
          setIsLoading(true);
          await updateAccountInfo(savedAccountId);
          setIsConnected(true);
        } catch (err) {
          console.error('Failed to restore session:', err);
          disconnectWallet();
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkConnection();
  }, []);

  const updateAccountInfo = async (accountId: string) => {
    try {
      const client = Client.forTestnet();
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);
      
      setBalance(accountBalance.hbars.toString());
      setAccountId(accountId);
      localStorage.setItem('hederaAccountId', accountId);
    } catch (err) {
      console.error('Error updating account info:', err);
      throw err;
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if HashPack is installed
      if (!window.hashconnect) {
        throw new Error('HashPack extension not found. Please install it first.');
      }

      // Initialize connection
      const hashconnect = window.hashconnect;
      await hashconnect.disconnect();
      
      // Connect to HashPack
      const initData = await hashconnect.init();
      const state = await hashconnect.connect();
      
      // Pair with wallet
      const pairingData = await hashconnect.findLocalWallets();
      
      if (pairingData.pairingData.length === 0) {
        await hashconnect.findLocalWallets();
        throw new Error('No paired accounts found. Please pair with HashPack.');
      }

      const accountId = pairingData.pairingData[0].accountIds[0];
      
      // Update account info
      await updateAccountInfo(accountId);
      setIsConnected(true);
      
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccountId(null);
    setBalance('0');
    localStorage.removeItem('hederaAccountId');
    
    // Disconnect from HashPack
    if (window.hashconnect) {
      window.hashconnect.disconnect();
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        accountId,
        balance,
        connectWallet,
        disconnectWallet,
        isLoading,
        error,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
