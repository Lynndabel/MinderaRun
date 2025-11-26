'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export function NewWalletConnection() {
  const { open } = useAppKit();
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'pending' | 'waiting' | 'success'>('idle');

  const {
    setConnected,
    setWalletAddress,
    setPlayer,
    registerPlayer,
    loadPlayerData,
    player
  } = useGameStore();

  // Handle wallet connection state changes
  useEffect(() => {
    if (isConnected && address) {
      setConnected(true);
      setWalletAddress(address);

      // Load player data when wallet connects - with a small delay to ensure contract callbacks are ready
      setTimeout(() => {
        loadPlayerData(address);
      }, 1000);
    } else {
      setConnected(false);
      setWalletAddress(null);
      setPlayer(null);
      setShowRegistration(false);
    }
  }, [isConnected, address, setConnected, setWalletAddress, setPlayer, loadPlayerData]);

  // Check registration status when player data changes
  useEffect(() => {
    console.log('🔍 Registration check:', {
      isConnected,
      address,
      player,
      playerIsRegistered: player?.isRegistered,
      playerUsername: player?.username
    });

    if (!isConnected || !address) {
      setShowRegistration(false);
      return;
    }

    if (player === null || player === undefined) {
      console.log('⏳ Player data still loading - keeping current modal state');
      return;
    }

    // Player data loaded - check if registration needed
    if (!player.isRegistered) {
      console.log('❌ Player not registered - showing modal');
      setShowRegistration(true);
    } else {
      console.log('✅ Player already registered - hiding modal');
      setShowRegistration(false);
    }
  }, [isConnected, address, player]);

  const handleConnect = () => {
    open(); // This opens the AppKit modal
  };

  const handleDisconnect = () => {
    disconnect();
    setShowRegistration(false);
  };

  const handleRegister = async () => {
    if (!username.trim()) return;

    setIsRegistering(true);
    setRegistrationStatus('pending');

    try {
      console.log('🔄 Starting registration for:', username.trim());
      const success = await registerPlayer(username.trim());
      console.log('📝 Registration result:', success);

      if (success) {
        console.log('✅ Registration successful! Waiting for blockchain confirmation...');
        setRegistrationStatus('waiting');
        setUsername('');

        // Wait a bit longer for blockchain confirmation, then reload player data
        setTimeout(async () => {
          console.log('🔄 Reloading player data after registration...');
          setRegistrationStatus('success');
          if (address) {
            await loadPlayerData(address);
          }
        }, 4000);
      } else {
        setRegistrationStatus('idle');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setRegistrationStatus('idle');
    }
    setIsRegistering(false);
  };


  return (
    <>

      {/* Wallet Connection UI - changes based on connection status */}
      {isConnected && address ? (
        <div className="flex items-center space-x-3 relative z-20">
          <div className="nes-container is-dark pixel-font text-sm">
            💰 {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={handleDisconnect}
            className="nes-btn is-error pixel-font text-xs"
            title="Disconnect Wallet"
          >
            EXIT
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`nes-btn ${isConnecting ? 'is-disabled' : 'is-primary'} pixel-font relative z-20`}
        >
          💼 {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
      )}

      {/* Registration Modal */}
      {showRegistration && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999
          }}
        >
          <div className="nes-container with-title is-centered pixel-art" style={{ backgroundColor: 'white', maxWidth: '400px' }}>
            <p className="title pixel-font text-primary">WELCOME TO MINDORA!</p>
            <p className="text-gray-800 mb-4 pixel-font text-sm">Choose your username to start playing:</p>

            {registrationStatus === 'waiting' && (
              <div className="mb-4 text-center">
                <p className="text-blue-600 pixel-font text-sm">⏳ Waiting for blockchain confirmation...</p>
              </div>
            )}

            {registrationStatus === 'success' && (
              <div className="mb-4 text-center">
                <p className="text-green-600 pixel-font text-sm">✅ Registration confirmed! Loading game...</p>
              </div>
            )}

            <div className="nes-field mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="nes-input pixel-font"
                style={{ color: 'black', backgroundColor: 'white' }}
                maxLength={20}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleRegister}
                disabled={!username.trim() || isRegistering}
                className={`nes-btn ${!username.trim() || isRegistering ? 'is-disabled' : 'is-success'} pixel-font w-full`}
              >
{
                  registrationStatus === 'pending' ? 'PROCESSING...' :
                  registrationStatus === 'waiting' ? 'CONFIRMING...' :
                  registrationStatus === 'success' ? 'SUCCESS!' :
                  'REGISTER & START PLAYING'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}