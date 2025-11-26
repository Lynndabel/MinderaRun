'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Wallet, LogOut } from 'lucide-react';

// Extend Window interface for HashPack
declare global {
  interface Window {
    hashconnect?: {
      init: (metadata: { name: string; description: string; icon: string }) => Promise<{ pairingString?: string }>;
      connectToLocalWallet: () => Promise<{ pairingString?: string }>;
      hcData: {
        pairingString?: string;
      };
    };
  }
}

export function WalletConnection() {
  const { 
    isConnected, 
    walletAddress, 
    setConnected, 
    setWalletAddress, 
    setPlayer,
    registerPlayer,
    loadPlayerData
  } = useGameStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if HashPack is available
      if (typeof window !== 'undefined' && window.hashconnect) {
        const hashconnect = window.hashconnect;
        
        // Initialize if not already done
        if (!hashconnect.hcData.pairingString) {
          await hashconnect.init({
            name: "Mindora Runner",
            description: "Educational GameFi Platform",
            icon: "/logo.png"
          });
        }

        // Connect wallet
        const connectData = await hashconnect.connectToLocalWallet();
        
        if (connectData.pairingString) {
          // Show QR code or pairing string
          const pairingString = connectData.pairingString;
          console.log('Pairing string:', pairingString);
          
          // For demo purposes, we'll simulate a successful connection
          // In production, you'd handle the actual pairing process
          setTimeout(async () => {
            // Use your actual operator account for testing
            const walletAddress = '0.0.6919858'; // Your actual account
            setWalletAddress(walletAddress);
            setConnected(true);

            // Try to load existing player data
            await loadPlayerData(walletAddress);

            // Check if player needs to register
            const { player } = useGameStore.getState();
            if (!player) {
              setShowRegistration(true);
            }

            setIsConnecting(false);
          }, 2000);
        }
      } else {
        // Fallback for development - use your real account
        const walletAddress = '0.0.6919858'; // Your actual account
        setWalletAddress(walletAddress);
        setConnected(true);

        // Try to load existing player data
        await loadPlayerData(walletAddress);

        // Check if player needs to register
        const { player } = useGameStore.getState();
        if (!player) {
          setShowRegistration(true);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setWalletAddress(null);
    setPlayer(null);
    setShowRegistration(false);
  };

  const handleRegister = async () => {
    if (!username.trim()) return;
    
    setIsRegistering(true);
    try {
      const success = await registerPlayer(username.trim());
      if (success) {
        setShowRegistration(false);
        setUsername('');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
    setIsRegistering(false);
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3 relative z-20">
        <div className="nes-container is-dark pixel-font text-sm">
          💰 {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-4)}
        </div>
        <button
          onClick={disconnectWallet}
          className="nes-btn is-error pixel-font text-xs"
          title="Disconnect Wallet"
        >
          EXIT
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`nes-btn ${isConnecting ? 'is-disabled' : 'is-primary'} pixel-font relative z-20`}
      >
        💼 {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
      </button>

      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="nes-container with-title is-centered pixel-art" style={{ backgroundColor: 'white', maxWidth: '400px' }}>
            <p className="title pixel-font text-primary">WELCOME TO MINDORA!</p>
            <p className="text-gray-800 mb-4 pixel-font text-sm">Choose your username to start playing:</p>

            <div className="nes-field mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="nes-input pixel-font"
                maxLength={20}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRegister}
                disabled={!username.trim() || isRegistering}
                className={`nes-btn ${!username.trim() || isRegistering ? 'is-disabled' : 'is-success'} pixel-font flex-1`}
              >
                {isRegistering ? 'REGISTERING...' : 'REGISTER'}
              </button>
              <button
                onClick={() => setShowRegistration(false)}
                className="nes-btn pixel-font"
              >
                SKIP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

