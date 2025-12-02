import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Client, TokenId, AccountBalanceQuery } from "@hashgraph/sdk";

// Define token types
interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  type: 'fungible' | 'nft';
}

export const TokenManagement = () => {
  const { accountId, isConnected } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Replace with your token IDs
  const TOKEN_IDS = {
    QUEST_COIN: process.env.NEXT_PUBLIC_QUEST_COIN_TOKEN_ID || '0.0.123456',
    BADGE_NFT: process.env.NEXT_PUBLIC_BADGE_NFT_ID || '0.0.789012'
  };

  // Fetch token balances
  const fetchTokenBalances = async () => {
    if (!accountId || !isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const client = Client.forTestnet();
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);
      
      // Process token balances
      const tokenBalances = accountBalance.tokens?._map || new Map();
      const tokenList: TokenInfo[] = [];
      
      // Add HBAR balance
      tokenList.push({
        tokenId: 'HBAR',
        name: 'Hedera',
        symbol: 'ℏ',
        balance: accountBalance.hbars.toString(),
        decimals: 8,
        type: 'fungible'
      });
      
      // Add token balances
      for (const [tokenId, balance] of tokenBalances) {
        try {
          const tokenInfo = await getTokenInfo(tokenId.toString());
          
          tokenList.push({
            tokenId: tokenId.toString(),
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            balance: balance.toString(),
            decimals: tokenInfo.decimals,
            type: tokenInfo.type
          });
        } catch (err) {
          console.error(`Error fetching info for token ${tokenId}:`, err);
        }
      }
      
      setTokens(tokenList);
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError('Failed to load token balances. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get token metadata
  const getTokenInfo = async (tokenId: string): Promise<{name: string, symbol: string, decimals: number, type: 'fungible' | 'nft'}> => {
    // In a real app, you would fetch this from the token contract
    // This is a simplified version
    if (tokenId === TOKEN_IDS.QUEST_COIN) {
      return {
        name: 'Quest Coin',
        symbol: 'QC',
        decimals: 2,
        type: 'fungible'
      };
    } else if (tokenId === TOKEN_IDS.BADGE_NFT) {
      return {
        name: 'Mindera Badge',
        symbol: 'MB',
        decimals: 0,
        type: 'nft'
      };
    }
    
    // Default for unknown tokens
    return {
      name: 'Unknown Token',
      symbol: 'TOKEN',
      decimals: 0,
      type: 'fungible'
    };
  };

  // Handle token transfer
  const handleTransfer = async () => {
    if (!selectedToken || !recipient || !transferAmount) return;
    
    setIsTransferring(true);
    setError(null);
    
    try {
      // In a real app, implement the actual transfer logic here
      // This is a placeholder implementation
      console.log(`Transferring ${transferAmount} ${selectedToken.symbol} to ${recipient}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh balances after transfer
      await fetchTokenBalances();
      
      // Reset form
      setTransferAmount('');
      setRecipient('');
      setSelectedToken(null);
      
      // Show success message
      alert('Transfer successful!');
    } catch (err) {
      console.error('Transfer failed:', err);
      setError('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Format token balance with decimals
  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    return (num / Math.pow(10, decimals)).toFixed(decimals > 0 ? 2 : 0);
  };

  // Load token balances when account changes
  useEffect(() => {
    if (isConnected && accountId) {
      fetchTokenBalances();
    }
  }, [accountId, isConnected]);

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">Connect your wallet to view and manage tokens</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Tokens</h3>
          <p className="mt-1 text-sm text-gray-500">Manage your in-game assets</p>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading token balances...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchTokenBalances}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tokens found in your wallet.
          </div>
        ) : (
          <div className="bg-white overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {tokens.map((token) => (
                <li key={token.tokenId}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{token.symbol[0]}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{token.name}</div>
                          <div className="text-sm text-gray-500">{token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatBalance(token.balance, token.decimals)} {token.symbol}
                        </div>
                        <div className="mt-1">
                          <button
                            onClick={() => setSelectedToken(token)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            Transfer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {selectedToken && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedToken(null)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Transfer {selectedToken.name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Send {selectedToken.symbol} to another Hedera account
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                      Recipient Account ID
                    </label>
                    <input
                      type="text"
                      name="recipient"
                      id="recipient"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0.0.1234567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        step={selectedToken.decimals > 0 ? `0.${'0'.repeat(selectedToken.decimals - 1)}1` : '1'}
                        min="0"
                        max={parseFloat(selectedToken.balance) / Math.pow(10, selectedToken.decimals)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          {selectedToken.symbol}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Balance: {formatBalance(selectedToken.balance, selectedToken.decimals)} {selectedToken.symbol}
                    </p>
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  disabled={!recipient || !transferAmount || isTransferring}
                  onClick={handleTransfer}
                >
                  {isTransferring ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Transferring...
                    </>
                  ) : (
                    'Transfer'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setSelectedToken(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
