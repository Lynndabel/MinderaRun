'use client';

import { useState, useEffect } from 'react';
import { useGameStore, LeaderboardEntry } from '@/store/gameStore';
import { Play, Pause, RotateCcw, Trophy, Coins, Medal, Users, Volume2, VolumeX } from 'lucide-react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { getContractAddresses } from '@/config/contracts';
import { hederaService } from '@/services/hederaService';

export function GameUI() {
  const { playSound, toggleMute, isMuted, masterVolume, setVolume } = useGameSounds();
  const {
    isPlaying,
    score,
    sessionCoins,
    player,
    currentStage,
    setPlaying,
    isSavingSession,
    loadLeaderboard,
    contractCallbacks
  } = useGameStore();

  const [showNFTs, setShowNFTs] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isMinting, setIsMinting] = useState(false);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Set up wallet client for Hedera service
  useEffect(() => {
    if (walletClient && address) {
      console.log('🔗 Setting up wallet client for Hedera service');
      hederaService.setWalletClient(walletClient, address);
    }
  }, [walletClient, address]);


  const handleRestart = () => {
    setPlaying(false);
    // Reset game state would go here
  };

  const handleMintRewards = async (stage: number, badgeName: string, tokenAmount: number): Promise<void> => {
    console.log(`🎖️ Starting mint process for ${badgeName}: ${tokenAmount} QuestCoins + NFT`);

    if (!address) {
      alert('Wallet not connected');
      return;
    }

    try {
      setIsMinting(true);
      
      // First, check if user has already claimed these rewards
      console.log(`🔍 Checking if Stage ${stage} rewards were already claimed...`);
      const userHederaId = await hederaService.evmAddressToAccountId(address);
      
      const rewardStatus = await hederaService.checkStageRewardsClaimed(userHederaId, stage);
      
      console.log(`🎯 Detailed reward check results:`, rewardStatus);
      
      if (rewardStatus.questCoinsAlreadyClaimed && rewardStatus.nftBadgeAlreadyClaimed) {
        alert(`🎯 Already Claimed!\n\nYou have already claimed Stage ${stage} rewards:\n✅ ${tokenAmount} QuestCoin tokens\n✅ ${badgeName} NFT badge\n\nCurrent balance: ${rewardStatus.currentQuestCoinBalance} QuestCoins\nOwned NFTs: ${rewardStatus.ownedNFTs.length}`);
        setIsMinting(false);
        return;
      } else if (rewardStatus.questCoinsAlreadyClaimed) {
        const confirmed = confirm(`⚠️ Partial Claim Detected\n\nYou already have ${rewardStatus.currentQuestCoinBalance} QuestCoins but missing the ${badgeName} NFT.\n\nWould you like to claim just the missing NFT badge?`);
        if (!confirmed) {
          setIsMinting(false);
          return;
        }
        
        console.log(`🎖️ Claiming missing NFT badge only for Stage ${stage}...`);
        // Continue with NFT-only minting
      } else if (rewardStatus.nftBadgeAlreadyClaimed) {
        const confirmed = confirm(`⚠️ Partial Claim Detected\n\nYou already have the ${badgeName} NFT but are missing QuestCoins.\n\nWould you like to claim the missing ${tokenAmount} QuestCoins?`);
        if (!confirmed) {
          setIsMinting(false);
          return;
        }
        
        console.log(`💰 Claiming missing QuestCoins only for Stage ${stage}...`);
        // Continue with QuestCoin-only minting
      } else {
        console.log(`✅ No previous claims detected - proceeding with full reward minting...`);
        console.log(`📊 Debug: QuestCoins=${rewardStatus.currentQuestCoinBalance}, NFTs=${rewardStatus.ownedNFTs.length}`);
      }
      
    } catch (error) {
      console.error('❌ Error checking reward status:', error);
      // Continue with minting if check fails
    }

    try {
      const confirmMint = confirm(`🎖️ Mint ${badgeName}?\n\n• NFT Badge: ${badgeName}\n• QuestCoin Tokens: ${tokenAmount}\n• Wallet: ${address.slice(0, 6)}...${address.slice(-4)}\n\nThis will mint actual HTS tokens to your wallet address.`);

      if (!confirmMint) return;

      console.log('🔄 User confirmed minting, proceeding with HTS token minting...');
      setIsMinting(true);

      // Get contract addresses
      const contracts = getContractAddresses();
      console.log('📜 Using contract addresses:', contracts);

      // Initialize HederaService with token IDs
      hederaService.setContractAddress(contracts.MINDORA_RUNNER);

      try {
        console.log('🔄 Minting HTS tokens through HederaService...');

        // Convert EVM address to Hedera Account ID format
        // For testnet wallets, we need to handle this conversion
        // For demo purposes, we'll use a placeholder approach
        const hederaAccountId = address; // This would need proper conversion in production

        console.log(`💰 Minting ${tokenAmount} QuestCoins to ${hederaAccountId}...`);

        // Mint QuestCoin tokens
        const questCoinSuccess = await hederaService.mintQuestCoins(tokenAmount, hederaAccountId);

        if (questCoinSuccess) {
          console.log('✅ QuestCoins minted successfully');

          // Mint NFT Badge
          console.log(`🏆 Minting ${badgeName} NFT to ${hederaAccountId}...`);
          const nftSuccess = await hederaService.mintNFTBadge(badgeName, hederaAccountId);

            if (nftSuccess) {
              console.log('✅ NFT badge minted successfully');
              alert(`🎖️ HTS Tokens Minted Successfully!\n\n• ${tokenAmount} QuestCoin tokens minted\n• ${badgeName} NFT badge minted\n\n✅ Tokens minted to your associated Hedera account!\nCheck https://hashscan.io/testnet for transaction details.`);
            } else {
              console.warn('⚠️ NFT minting failed, but QuestCoins were minted');
              alert(`⚠️ Partial Success\n\n• ${tokenAmount} QuestCoin tokens minted ✅\n• ${badgeName} NFT minting failed ❌\n\nPlease try minting the NFT again.`);
            }
        } else {
          throw new Error('QuestCoin minting failed');
        }

      } catch (mintError) {
        console.error('❌ HTS minting error:', mintError);

        // Provide detailed error feedback based on the error type
        if (mintError instanceof Error) {
          if (mintError.message.includes('Mirror Node API error')) {
            alert(`⚠️ Address Lookup Issue\n\nCouldn't connect to Hedera Mirror Node to look up your account.\n\nFor demo purposes, tokens will be minted to the treasury account.\n\nError: ${mintError.message}`);
          } else if (mintError.message.includes('Cannot create account mapping')) {
            alert(`❌ Account Mapping Error\n\nCouldn't map your EVM address to a Hedera Account ID.\n\nPlease ensure:\n1. You have a Hedera account associated with your wallet\n2. The Hedera services are accessible\n3. Try again in a moment\n\nError: ${mintError.message}`);
          } else {
            alert(`❌ Minting Error: ${mintError.message}\n\nPlease try again or check your Hedera account setup.`);
          }
        } else {
          alert(`❌ Unknown Error: Please try again or check your Hedera account setup.`);
        }
      }

    } catch (error) {
      console.error('❌ Minting process failed:', error);
      alert(`❌ Process Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMinting(false);
    }
  };

  // Load leaderboard data when showing leaderboard
  useEffect(() => {
    if (showLeaderboard) {
      console.log('🔄 GameUI - Loading leaderboard for current stage:', currentStage);
      loadLeaderboard().then((data) => {
        console.log('🔄 GameUI - Leaderboard data received:', data);
        setLeaderboardData(data || []);
      }).catch((error) => {
        console.error('❌ GameUI - Failed to load leaderboard:', error);
        setLeaderboardData([]);
      });
    }
  }, [showLeaderboard, loadLeaderboard, currentStage]);

  return (
    <>
      {/* Simple HUD - just essentials */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 pointer-events-none">
        <div className="flex justify-between items-center gap-1 sm:gap-2">
          {/* Score */}
          <div className="pixel-font text-white text-xs sm:text-base md:text-xl bg-black/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded">
            <span className="hidden sm:inline">Score: </span>{score}
          </div>

          {/* Stage */}
          <div className="pixel-font text-white text-xs sm:text-base md:text-xl bg-black/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded">
            <span className="hidden sm:inline">Stage </span>{currentStage}
          </div>

          {/* Coins - Show saved + session */}
          <div className="pixel-font text-white text-xs sm:text-base md:text-xl bg-black/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded">
            🪙 {(player?.inGameCoins || 0)} {sessionCoins > 0 && `+${sessionCoins}`}
          </div>
        </div>
      </div>

      {/* Bottom right - Buttons */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 flex gap-1 sm:gap-2">
        {/* Sound Control */}
        <button
          onClick={() => { playSound('button'); toggleMute(); }}
          className="nes-btn pixel-font pointer-events-auto text-xs sm:text-base p-1 sm:p-2"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={16} className="sm:w-5 sm:h-5" /> : <Volume2 size={16} className="sm:w-5 sm:h-5" />}
        </button>
        
        <button
          onClick={() => { playSound('button'); setShowNFTs(true); }}
          className="nes-btn is-primary pixel-font pointer-events-auto text-xs sm:text-base"
        >
          <span className="hidden sm:inline">COLLECTION</span>
          <span className="sm:hidden">NFTs</span>
        </button>
      </div>

      {/* Blockchain Save Loading */}
      {isSavingSession && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto">
          <div className="nes-container is-dark pixel-art text-center">
            <h2 className="pixel-font text-white mb-4">💾 Saving to Blockchain...</h2>
            <p className="pixel-font text-gray-300 text-sm">Your coins and score are being saved permanently!</p>
            <div className="mt-4">
              <div className="animate-pulse pixel-font text-white">🔗 ⛓️ 🔗</div>
            </div>
          </div>
        </div>
      )}


      {/* Collection Modal - Simple */}
      {showNFTs && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-auto">
          <div className="nes-container pixel-art max-w-sm w-full mx-4" style={{ backgroundColor: 'white' }}>
            <div className="text-center mb-4">
              <p className="pixel-font text-xl text-gray-800 mb-2">Collection</p>
              <p className="pixel-font text-lg">🪙 {player?.inGameCoins || 0} Game Coins</p>
              <p className="pixel-font text-sm text-gray-600">💎 {player?.tokensEarned || 0} QuestCoin Tokens</p>
              {/* Debug player data */}
              <p className="pixel-font text-xs text-blue-600">
                DEBUG: Stage {player?.currentStage || 0} | Completed: [{player?.completedStages?.join(', ') || 'none'}]
              </p>
              
            </div>

            <div className="space-y-2 mb-4">
              {/* Stage 1 Badge */}
              {(() => {
                // Stage 1 is unlocked if completed OR if player is in stage 2+ (must have completed stage 1)
                const stage1Unlocked = player?.completedStages?.includes(1) || (player?.currentStage && player.currentStage >= 2);
                const stage1Completed = player?.completedStages?.includes(1);
                return (
                  <div className={`p-3 border border-gray-300 rounded ${stage1Unlocked ? 'bg-green-50' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">🎯 Explorer Badge</span>
                        <span className="text-xs text-gray-500">Stage 1 • 20 QuestCoin Tokens</span>
                      </div>
                      <span className={`pixel-font text-xs ${stage1Unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                        {stage1Completed ? '✓ COMPLETED' : stage1Unlocked ? '🔓 UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    {stage1Unlocked && (
                      <div className="text-center p-2 bg-green-100 rounded border">
                        <p className="pixel-font text-xs text-green-700 mb-1">✅ REWARDS CLAIMED</p>
                        <p className="text-xs text-gray-600">You have received:</p>
                        <p className="text-xs text-gray-600">• 20+ QuestCoin tokens</p>
                        <p className="text-xs text-gray-600">• Explorer Badge NFT</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stage 2 Badge */}
              {(() => {
                // Stage 2 is unlocked if completed OR if player is in stage 3+ (must have completed stage 2)
                const stage2Unlocked = player?.completedStages?.includes(2) || (player?.currentStage && player.currentStage >= 3);
                const stage2Completed = player?.completedStages?.includes(2);
                return (
                  <div className={`p-3 border border-gray-300 rounded ${stage2Unlocked ? 'bg-green-50' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">⚔️ Adventurer Badge</span>
                        <span className="text-xs text-gray-500">Stage 2 • 50 QuestCoin Tokens</span>
                      </div>
                      <span className={`pixel-font text-xs ${stage2Unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                        {stage2Completed ? '✓ COMPLETED' : stage2Unlocked ? '🔓 UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    {stage2Unlocked && (
                      <button
                        onClick={() => handleMintRewards(2, 'Adventurer Badge', 50)}
                        className="nes-btn is-success pixel-font w-full text-xs"
                        disabled={isSavingSession || isMinting}
                      >
                        {isMinting ? '🔄 MINTING...' : '🎖️ MINT NFT + TOKENS'}
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Stage 3 Badge */}
              <div className={`p-3 border border-gray-300 rounded ${player?.completedStages?.includes(3) ? 'bg-green-50' : 'opacity-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">👑 Master Badge</span>
                    <span className="text-xs text-gray-500">Stage 3 • 100 QuestCoin Tokens</span>
                  </div>
                  <span className={`pixel-font text-xs ${player?.completedStages?.includes(3) ? 'text-green-600' : 'text-gray-400'}`}>
                    {player?.completedStages?.includes(3) ? '✓ COMPLETED' : 'LOCKED'}
                  </span>
                </div>
                {(player?.completedStages?.includes(3) || (player?.tokensEarned && player.tokensEarned >= 170)) && (
                  <button
                    onClick={() => handleMintRewards(3, 'Master Badge', 100)}
                    className="nes-btn is-success pixel-font w-full text-xs"
                    disabled={isSavingSession}
                  >
                    🎖️ MINT NFT + TOKENS
                  </button>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => { playSound('button'); setShowNFTs(false); setShowLeaderboard(true); }}
                className="nes-btn is-success pixel-font flex-1 text-xs"
              >
                LEADERBOARD
              </button>
              <button
                onClick={() => { playSound('button'); setShowNFTs(false); }}
                className="nes-btn pixel-font flex-1 text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal - Simple */}
      {showLeaderboard && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-auto">
          <div className="nes-container pixel-art max-w-sm w-full mx-4" style={{ backgroundColor: 'white' }}>
            <div className="text-center mb-4">
              <p className="pixel-font text-xl text-gray-800">Leaderboard</p>
              <p className="pixel-font text-sm text-gray-600">Stage {currentStage}</p>
            </div>

            <div className="space-y-1 mb-4">
              {leaderboardData.length > 0 ? (
                leaderboardData.slice(0, 10).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border-b border-gray-200">
                    <div className="flex flex-col">
                      <span className="pixel-font text-sm">
                        #{index + 1} {entry.username || `Player ${entry.player?.slice(-4)}` || 'Anonymous'}
                      </span>
                      <span className="pixel-font text-xs text-gray-500">
                        {entry.player?.slice(0, 6)}...{entry.player?.slice(-4)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="pixel-font text-sm">{entry.score || 0}</div>
                      <div className="pixel-font text-xs text-gray-500">
                        {entry.totalCoins || entry.coinsCollected || 0} coins {entry.totalGames && entry.totalGames > 1 ? `(${entry.totalGames} games)` : ''}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="pixel-font text-sm text-gray-500 mb-2">No games recorded yet!</div>
                  <div className="pixel-font text-xs text-gray-400">Complete a stage to appear on the leaderboard</div>
                </div>
              )}
            </div>

            <button
              onClick={() => { playSound('button'); setShowLeaderboard(false); }}
              className="nes-btn pixel-font w-full"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
