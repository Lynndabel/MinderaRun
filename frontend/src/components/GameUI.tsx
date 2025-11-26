'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, LeaderboardEntry } from '@/store/gameStore';
import { Play, Pause, RotateCcw, Trophy, Coins, Medal, Users } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { getContractAddresses } from '@/config/contracts';
import { hederaService } from '@/services/hederaService';
import { useGameSounds } from '@/hooks/useGameSounds';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function GameUI() {
  const router = useRouter();
  const { playSound } = useGameSounds();

  // Use Zustand selectors for guaranteed reactivity
  const isPlaying = useGameStore(state => state.isPlaying);
  const score = useGameStore(state => state.score);
  const sessionCoins = useGameStore(state => state.sessionCoins);
  const player = useGameStore(state => state.player);
  const currentStage = useGameStore(state => state.currentStage);
  const setPlaying = useGameStore(state => state.setPlaying);
  const isSavingSession = useGameStore(state => state.isSavingSession);
  const loadLeaderboard = useGameStore(state => state.loadLeaderboard);
  const contractCallbacks = useGameStore(state => state.contractCallbacks);
  const showNotification = useGameStore(state => state.showNotification);

  const [showNFTs, setShowNFTs] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

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
      showNotification('warning', 'Wallet Not Connected', 'Please connect your wallet to claim rewards.');
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
        showNotification('info', 'Already Claimed', `You have already claimed Stage ${stage} rewards:\n✅ ${tokenAmount} QuestCoin tokens\n✅ ${badgeName} NFT badge\n\nCurrent balance: ${rewardStatus.currentQuestCoinBalance} QuestCoins\nOwned NFTs: ${rewardStatus.ownedNFTs.length}`);
        setIsMinting(false);
        return;
      } else if (rewardStatus.questCoinsAlreadyClaimed) {
        const mintParams = { stage, badgeName, tokenAmount };
        setConfirmDialog({
          isOpen: true,
          title: 'Partial Claim Detected',
          message: `You already have ${rewardStatus.currentQuestCoinBalance} QuestCoins but missing the ${badgeName} NFT.\n\nWould you like to claim just the missing NFT badge?`,
          onConfirm: () => {
            setConfirmDialog({ ...confirmDialog, isOpen: false });
            console.log(`🎖️ Claiming missing NFT badge only for Stage ${stage}...`);
            // Continue with NFT-only minting - proceed with minting (NFT only)
            proceedWithMinting(mintParams.stage, mintParams.badgeName, mintParams.tokenAmount);
          },
          onCancel: () => {
            setConfirmDialog({ ...confirmDialog, isOpen: false });
            setIsMinting(false);
          }
        });
        return;
      } else if (rewardStatus.nftBadgeAlreadyClaimed) {
        const mintParams = { stage, badgeName, tokenAmount };
        setConfirmDialog({
          isOpen: true,
          title: 'Partial Claim Detected',
          message: `You already have the ${badgeName} NFT but are missing QuestCoins.\n\nWould you like to claim the missing ${tokenAmount} QuestCoins?`,
          onConfirm: () => {
            setConfirmDialog({ ...confirmDialog, isOpen: false });
            console.log(`💰 Claiming missing QuestCoins only for Stage ${stage}...`);
            // Continue with QuestCoin-only minting
            proceedWithMinting(mintParams.stage, mintParams.badgeName, mintParams.tokenAmount);
          },
          onCancel: () => {
            setConfirmDialog({ ...confirmDialog, isOpen: false });
            setIsMinting(false);
          }
        });
        return;
      } else {
        console.log(`✅ No previous claims detected - proceeding with full reward minting...`);
        console.log(`📊 Debug: QuestCoins=${rewardStatus.currentQuestCoinBalance}, NFTs=${rewardStatus.ownedNFTs.length}`);
      }
      
    } catch (error) {
      console.error('❌ Error checking reward status:', error);
      // Continue with minting if check fails
    }

    // Show confirmation dialog before minting - store params for later
    const mintParams = { stage, badgeName, tokenAmount };
    setConfirmDialog({
      isOpen: true,
      title: `Mint ${badgeName}?`,
      message: `• NFT Badge: ${badgeName}\n• QuestCoin Tokens: ${tokenAmount}\n• Wallet: ${address.slice(0, 6)}...${address.slice(-4)}\n\nThis will mint actual HTS tokens to your wallet address.`,
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        proceedWithMinting(mintParams.stage, mintParams.badgeName, mintParams.tokenAmount);
      },
      onCancel: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setIsMinting(false);
      }
    });
  };

  const proceedWithMinting = async (stage: number, badgeName: string, tokenAmount: number) => {
    if (!address) return;
    
    try {
      console.log('🔄 User confirmed minting, proceeding with HTS token minting...');
      setIsMinting(true);

      // Get contract addresses
      const contracts = getContractAddresses();
      console.log('📜 Using contract addresses:', contracts);

      // Initialize HederaService with token IDs
      hederaService.setContractAddress(contracts.MINDORA_RUNNER);

      try {
        console.log('🔄 Minting HTS tokens through HederaService...');

        // Check what has already been claimed from player state
        const tokensAlreadyClaimed = player?.tokensClaimedStages?.includes(stage) || false;
        const nftAlreadyClaimed = player?.nftClaimedStages?.includes(stage) || false;

        console.log(`🔍 Claim status check for Stage ${stage}:`, {
          tokensAlreadyClaimed,
          nftAlreadyClaimed,
          playerTokensClaimedStages: player?.tokensClaimedStages,
          playerNftClaimedStages: player?.nftClaimedStages,
        });

        // Convert EVM address to Hedera Account ID format
        const hederaAccountId = address;

        let questCoinSuccess = tokensAlreadyClaimed; // If already claimed, skip minting
        let nftSuccess = nftAlreadyClaimed; // If already claimed, skip minting

        // Only mint tokens if NOT already claimed
        if (!tokensAlreadyClaimed) {
          console.log(`💰 Minting ${tokenAmount} QuestCoins to ${hederaAccountId}...`);
          questCoinSuccess = await hederaService.mintQuestCoins(tokenAmount, hederaAccountId);

          if (questCoinSuccess) {
            console.log('✅ QuestCoins minted successfully');

            // Mark tokens as claimed in smart contract
            try {
              console.log(`💰 Marking stage ${stage} tokens as claimed in contract...`);
              if (contractCallbacks.claimTokens) {
                await contractCallbacks.claimTokens(stage);
                console.log('✅ Tokens marked as claimed in contract');
              }
            } catch (claimError) {
              console.error('⚠️ Failed to mark tokens as claimed:', claimError);
              showNotification('warning', 'Warning', 'Tokens minted but failed to mark as claimed in contract. You may need to refresh.');
            }
          } else {
            throw new Error('QuestCoin minting failed');
          }
        } else {
          console.log(`💰 Tokens already claimed for Stage ${stage}, skipping token mint`);
        }

        // Only mint NFT if NOT already claimed
        if (!nftAlreadyClaimed) {
          console.log(`🏆 Minting ${badgeName} NFT to ${hederaAccountId}...`);
          nftSuccess = await hederaService.mintNFTBadge(badgeName, hederaAccountId);

          if (nftSuccess) {
            console.log('✅ NFT badge minted successfully');

            // Mark NFT as claimed in smart contract
            try {
              console.log(`🎖️ Marking stage ${stage} NFT as claimed in contract...`);
              if (contractCallbacks.claimNFT) {
                await contractCallbacks.claimNFT(stage);
                console.log('✅ NFT marked as claimed in contract');
              }
            } catch (claimError) {
              console.error('⚠️ Failed to mark NFT as claimed:', claimError);
              showNotification('warning', 'Warning', 'NFT minted but failed to mark as claimed in contract. You may need to refresh.');
            }
          }
        } else {
          console.log(`🎖️ NFT already claimed for Stage ${stage}, skipping NFT mint`);
        }

        // Show appropriate success message based on what was minted
        if (questCoinSuccess && nftSuccess) {
          if (tokensAlreadyClaimed && nftAlreadyClaimed) {
            showNotification('info', 'Already Claimed', `You have already claimed all Stage ${stage} rewards:\n• ${tokenAmount} QuestCoin tokens\n• ${badgeName} NFT badge`, 6000);
          } else if (tokensAlreadyClaimed && !nftAlreadyClaimed) {
            showNotification('success', 'NFT Badge Minted!', `${badgeName} NFT badge minted ✅\nTokens were already claimed previously\n\nCheck https://hashscan.io/testnet for transaction details.`, 7000);
          } else if (!tokensAlreadyClaimed && nftAlreadyClaimed) {
            showNotification('success', 'Tokens Minted!', `${tokenAmount} QuestCoin tokens minted ✅\nNFT was already claimed previously\n\nCheck https://hashscan.io/testnet for transaction details.`, 7000);
          } else {
            showNotification('success', 'HTS Tokens Minted Successfully!', `${tokenAmount} QuestCoin tokens minted\n${badgeName} NFT badge minted\n\nCheck https://hashscan.io/testnet for transaction details.`, 7000);
          }
          setTimeout(() => window.location.reload(), 2000);
        } else if (questCoinSuccess && !nftSuccess) {
          console.warn('⚠️ NFT minting failed, but QuestCoins were minted');
          showNotification('warning', 'Partial Success', `${tokenAmount} QuestCoin tokens minted ✅\n${badgeName} NFT minting failed ❌\n\nYou can try again to mint just the NFT - tokens are already claimed.`, 8000);
          setTimeout(() => window.location.reload(), 3000);
        } else {
          throw new Error('Minting failed');
        }

      } catch (mintError) {
        console.error('❌ HTS minting error:', mintError);

        // Provide detailed error feedback based on the error type
        if (mintError instanceof Error) {
          if (mintError.message.includes('Mirror Node API error')) {
            showNotification('warning', 'Address Lookup Issue', `Couldn't connect to Hedera Mirror Node to look up your account.\n\nFor demo purposes, tokens will be minted to the treasury account.\n\nError: ${mintError.message}`, 8000);
          } else if (mintError.message.includes('Cannot create account mapping')) {
            showNotification('error', 'Account Mapping Error', `Couldn't map your EVM address to a Hedera Account ID.\n\nPlease ensure:\n1. You have a Hedera account associated with your wallet\n2. The Hedera services are accessible\n3. Try again in a moment\n\nError: ${mintError.message}`, 10000);
          } else {
            showNotification('error', 'Minting Error', `${mintError.message}\n\nPlease try again or check your Hedera account setup.`, 8000);
          }
        } else {
          showNotification('error', 'Unknown Error', 'Please try again or check your Hedera account setup.', 6000);
        }
      }

    } catch (error) {
      console.error('❌ Minting process failed:', error);
      showNotification('error', 'Process Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsMinting(false);
    }
  };

  const handlePurchaseItem = async (itemName: string, itemCost: number) => {
    if (!address || !player) {
      showNotification('warning', 'Wallet Not Connected', 'Please connect your wallet first.');
      return;
    }

    if (player.inGameCoins < itemCost) {
      showNotification('warning', 'Insufficient Coins', `You have ${player.inGameCoins} coins but need ${itemCost}.`);
      return;
    }

    try {
      setIsPurchasing(true);
      console.log(`🛒 Purchasing ${itemName} for ${itemCost} coins`);

      if (contractCallbacks.purchaseItem) {
        const success = await contractCallbacks.purchaseItem(itemName, itemCost);

        if (success) {
          showNotification('success', 'Purchase Successful', `Successfully purchased ${itemName}!`);
          // Refresh player data to update coin balance
          if (contractCallbacks.loadPlayerData) {
            await contractCallbacks.loadPlayerData(address);
          }
        } else {
          showNotification('error', 'Purchase Failed', 'Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      showNotification('error', 'Purchase Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsPurchasing(false);
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
      {/* Top Left - Stage and Score */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-col gap-1 sm:gap-2">
        <div className="pixel-font text-white">
          {/* Stage */}
          <div className="pixel-font text-white text-xs sm:text-base md:text-xl bg-black/50 px-2 py-1 sm:px-3 rounded">
            🎮 Stage {currentStage}
          </div>
          
          {/* Score */}
          <div className="pixel-font text-white text-xs sm:text-base md:text-xl bg-black/50 px-2 py-1 sm:px-3 rounded mt-1 sm:mt-2">
            ⭐ {score}
          </div>
          
          {/* Coins - Show saved + session */}
          <div className="pixel-font text-white text-xs sm:text-base md:text-xl bg-black/50 px-2 py-1 sm:px-3 rounded">
            🪙 {(player?.inGameCoins || 0)} {sessionCoins > 0 && `+${sessionCoins}`}
          </div>
        </div>
      </div>

      {/* Bottom right - Buttons */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-auto sm:right-4 z-20 flex flex-row sm:flex-col gap-1 sm:gap-2 pointer-events-auto">
        <button
          onClick={() => { playSound('button'); setShowShop(true); }}
          className="nes-btn is-warning pixel-font text-xs py-1 px-2 sm:px-3 flex-1 sm:flex-none"
        >
          🎮 SHOP
        </button>
        <button
          onClick={() => { playSound('button'); router.push('/marketplace'); }}
          className="nes-btn is-success pixel-font text-xs py-1 px-2 sm:px-3 flex-1 sm:flex-none"
        >
          🛒 MARKET
        </button>
        <button
          onClick={() => { playSound('button'); setShowNFTs(true); }}
          className="nes-btn is-primary pixel-font text-xs py-1 px-2 sm:px-3 flex-1 sm:flex-none"
        >
          📦 NFTs
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-auto p-2 sm:p-4">
          <div className="nes-container pixel-art max-w-[95%] sm:max-w-md w-full" style={{ backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="text-center mb-3 sm:mb-4">
              <p className="pixel-font text-base sm:text-lg md:text-xl text-gray-800 mb-2">Collection</p>
              <p className="pixel-font text-sm sm:text-base">🪙 {player?.inGameCoins || 0} Game Coins</p>
              <p className="pixel-font text-xs sm:text-sm text-gray-600">💎 {player?.tokensEarned || 0} QuestCoin Tokens</p>
            </div>

            <div className="space-y-2 mb-4">
              {/* Stage 1 Badge */}
              {(() => {
                const stage1Unlocked = player?.completedStages?.includes(1) || (player?.currentStage && player.currentStage >= 2);
                const stage1TokensClaimed = player?.tokensClaimedStages?.includes(1);
                const stage1NFTClaimed = player?.nftClaimedStages?.includes(1);
                const stage1FullyClaimed = player?.claimedStages?.includes(1);

                return (
                  <div className={`p-3 border border-gray-300 rounded ${stage1Unlocked ? 'bg-green-50' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">🎯 Explorer Badge</span>
                        <span className="text-xs text-gray-500">Stage 1 • 20 QuestCoin Tokens</span>
                      </div>
                      <span className={`pixel-font text-xs ${stage1Unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                        {stage1FullyClaimed ? '✓ CLAIMED' : stage1Unlocked ? '🔓 UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    {stage1Unlocked && !stage1FullyClaimed && (
                      <button
                        onClick={() => handleMintRewards(1, 'Explorer Badge', 20)}
                        className="nes-btn is-success pixel-font w-full text-xs"
                        disabled={isSavingSession || isMinting}
                      >
                        {isMinting ? '🔄 MINTING...' :
                         stage1TokensClaimed && !stage1NFTClaimed ? '🎖️ RETRY NFT MINT' :
                         !stage1TokensClaimed && stage1NFTClaimed ? '💰 RETRY TOKEN MINT' :
                         '🎖️ MINT NFT + TOKENS'}
                      </button>
                    )}
                    {stage1FullyClaimed && (
                      <div className="text-center p-2 bg-green-100 rounded border">
                        <p className="pixel-font text-xs text-green-700 mb-1">✅ REWARDS CLAIMED</p>
                        <p className="text-xs text-gray-600">You have received:</p>
                        <p className="text-xs text-gray-600">• 20 QuestCoin tokens</p>
                        <p className="text-xs text-gray-600">• Explorer Badge NFT</p>
                      </div>
                    )}
                    {stage1TokensClaimed && !stage1NFTClaimed && (
                      <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-300 mt-2">
                        <p className="pixel-font text-xs text-yellow-700">⚠️ PARTIAL CLAIM</p>
                        <p className="text-xs text-gray-600">✅ Tokens claimed</p>
                        <p className="text-xs text-gray-600">❌ NFT pending</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stage 2 Badge */}
              {(() => {
                const stage2Unlocked = player?.completedStages?.includes(2) || (player?.currentStage && player.currentStage >= 3);
                const stage2TokensClaimed = player?.tokensClaimedStages?.includes(2);
                const stage2NFTClaimed = player?.nftClaimedStages?.includes(2);
                const stage2FullyClaimed = player?.claimedStages?.includes(2);

                return (
                  <div className={`p-3 border border-gray-300 rounded ${stage2Unlocked ? 'bg-green-50' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">⚔️ Adventurer Badge</span>
                        <span className="text-xs text-gray-500">Stage 2 • 50 QuestCoin Tokens</span>
                      </div>
                      <span className={`pixel-font text-xs ${stage2Unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                        {stage2FullyClaimed ? '✓ CLAIMED' : stage2Unlocked ? '🔓 UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    {stage2Unlocked && !stage2FullyClaimed && (
                      <button
                        onClick={() => handleMintRewards(2, 'Adventurer Badge', 50)}
                        className="nes-btn is-success pixel-font w-full text-xs"
                        disabled={isSavingSession || isMinting}
                      >
                        {isMinting ? '🔄 MINTING...' :
                         stage2TokensClaimed && !stage2NFTClaimed ? '🎖️ RETRY NFT MINT' :
                         !stage2TokensClaimed && stage2NFTClaimed ? '💰 RETRY TOKEN MINT' :
                         '🎖️ MINT NFT + TOKENS'}
                      </button>
                    )}
                    {stage2FullyClaimed && (
                      <div className="text-center p-2 bg-green-100 rounded border">
                        <p className="pixel-font text-xs text-green-700 mb-1">✅ REWARDS CLAIMED</p>
                        <p className="text-xs text-gray-600">You have received:</p>
                        <p className="text-xs text-gray-600">• 50 QuestCoin tokens</p>
                        <p className="text-xs text-gray-600">• Adventurer Badge NFT</p>
                      </div>
                    )}
                    {stage2TokensClaimed && !stage2NFTClaimed && (
                      <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-300 mt-2">
                        <p className="pixel-font text-xs text-yellow-700">⚠️ PARTIAL CLAIM</p>
                        <p className="text-xs text-gray-600">✅ Tokens claimed</p>
                        <p className="text-xs text-gray-600">❌ NFT pending</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stage 3 Badge */}
              {(() => {
                const stage3Unlocked = player?.completedStages?.includes(3);
                const stage3TokensClaimed = player?.tokensClaimedStages?.includes(3);
                const stage3NFTClaimed = player?.nftClaimedStages?.includes(3);
                const stage3FullyClaimed = player?.claimedStages?.includes(3);

                return (
                  <div className={`p-3 border border-gray-300 rounded ${stage3Unlocked ? 'bg-green-50' : 'opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="font-semibold">👑 Master Badge</span>
                        <span className="text-xs text-gray-500">Stage 3 • 100 QuestCoin Tokens</span>
                      </div>
                      <span className={`pixel-font text-xs ${stage3Unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                        {stage3FullyClaimed ? '✓ CLAIMED' : stage3Unlocked ? '🔓 UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    {stage3Unlocked && !stage3FullyClaimed && (
                      <button
                        onClick={() => handleMintRewards(3, 'Master Badge', 100)}
                        className="nes-btn is-success pixel-font w-full text-xs"
                        disabled={isSavingSession || isMinting}
                      >
                        {isMinting ? '🔄 MINTING...' :
                         stage3TokensClaimed && !stage3NFTClaimed ? '🎖️ RETRY NFT MINT' :
                         !stage3TokensClaimed && stage3NFTClaimed ? '💰 RETRY TOKEN MINT' :
                         '🎖️ MINT NFT + TOKENS'}
                      </button>
                    )}
                    {stage3FullyClaimed && (
                      <div className="text-center p-2 bg-green-100 rounded border">
                        <p className="pixel-font text-xs text-green-700 mb-1">✅ REWARDS CLAIMED</p>
                        <p className="text-xs text-gray-600">You have received:</p>
                        <p className="text-xs text-gray-600">• 100 QuestCoin tokens</p>
                        <p className="text-xs text-gray-600">• Master Badge NFT</p>
                      </div>
                    )}
                    {stage3TokensClaimed && !stage3NFTClaimed && (
                      <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-300 mt-2">
                        <p className="pixel-font text-xs text-yellow-700">⚠️ PARTIAL CLAIM</p>
                        <p className="text-xs text-gray-600">✅ Tokens claimed</p>
                        <p className="text-xs text-gray-600">❌ NFT pending</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { playSound('button'); setShowNFTs(false); setShowLeaderboard(true); }}
                className="nes-btn is-success pixel-font flex-1 text-xs sm:text-sm py-1"
              >
                LEADERBOARD
              </button>
              <button
                onClick={() => { playSound('button'); setShowNFTs(false); }}
                className="nes-btn pixel-font flex-1 text-xs sm:text-sm py-1"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal - Enhanced */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-auto p-2 sm:p-4">
          <div className="nes-container pixel-art w-full max-w-[95%] sm:max-w-xl md:max-w-2xl mx-auto" style={{ backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="text-center mb-3 sm:mb-4">
              <p className="pixel-font text-base sm:text-xl md:text-2xl text-gray-800 mb-1">🏆 Leaderboard</p>
              <p className="pixel-font text-xs sm:text-sm text-gray-600">Top Players - All Stages</p>
            </div>

            <div className="space-y-2 mb-4">
              {leaderboardData.length > 0 ? (
                leaderboardData.slice(0, 10).map((entry, index) => {
                  // Medal for top 3
                  const getMedal = (rank: number) => {
                    if (rank === 0) return '🥇';
                    if (rank === 1) return '🥈';
                    if (rank === 2) return '🥉';
                    return '';
                  };

                  const medal = getMedal(index);
                  const bgColor = index === 0 ? 'bg-yellow-50 border-yellow-300' :
                                  index === 1 ? 'bg-gray-50 border-gray-300' :
                                  index === 2 ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200';

                  // Clean username - remove any special characters
                  const cleanUsername = (name: string) => {
                    if (!name) return 'Anonymous';
                    // Remove any non-printable characters and trim
                    return name.replace(/[^\x20-\x7E]/g, '').trim() || `Player ${entry.player?.slice(-4)}`;
                  };

                  return (
                    <div
                      key={`${entry.player}-${index}`}
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 rounded ${bgColor} hover:shadow-md transition-shadow`}
                    >
                      {/* Rank with Medal */}
                      <div className="flex-shrink-0 w-10 sm:w-12 text-center">
                        {medal ? (
                          <div className="text-xl sm:text-2xl leading-none">{medal}</div>
                        ) : (
                          <div className="pixel-font text-base sm:text-lg font-bold text-gray-600">#{index + 1}</div>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-grow min-w-0">
                        <div className="pixel-font text-sm sm:text-base font-bold text-gray-800 truncate">
                          {cleanUsername(entry.username || '')}
                        </div>
                        <div className="pixel-font text-xs text-gray-500 truncate">
                          {entry.player?.slice(0, 6)}...{entry.player?.slice(-4)}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex-shrink-0 text-right">
                        <div className="pixel-font text-base sm:text-lg font-bold text-gray-800">
                          {entry.score || 0} pts
                        </div>
                        <div className="pixel-font text-xs text-gray-500">
                          {entry.totalCoins || entry.coinsCollected || 0} coins
                        </div>
                        {entry.totalGames && entry.totalGames > 1 && (
                          <div className="pixel-font text-xs text-gray-400">
                            {entry.totalGames} games
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <div className="pixel-font text-base text-gray-500 mb-2">No games recorded yet!</div>
                  <div className="pixel-font text-sm text-gray-400">Complete a stage to appear on the leaderboard</div>
                </div>
              )}
            </div>

            <button
              onClick={() => { playSound('button'); setShowLeaderboard(false); }}
              className="nes-btn is-primary pixel-font w-full"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* In-Game Shop Modal - Coming Soon */}
      {showShop && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-auto p-2 sm:p-4">
          <div className="nes-container pixel-art w-full max-w-[95%] sm:max-w-md md:max-w-lg mx-auto" style={{ backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="text-center mb-3 sm:mb-4">
              <p className="pixel-font text-base sm:text-lg md:text-xl text-gray-800 mb-1">🎮 Shop</p>
              <p className="pixel-font text-sm sm:text-base text-green-600">🪙 {player?.inGameCoins || 0} Coins</p>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              {/* Coming Soon Message */}
              <div className="text-center py-6 sm:py-12">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">🚧</div>
                <div className="pixel-font text-lg sm:text-xl md:text-2xl text-gray-800 mb-3 sm:mb-4 font-bold">COMING SOON</div>
                <div className="pixel-font text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                  Spend your in-game coins on power-ups and cosmetics!
                </div>

                <div className="bg-purple-50 border-2 border-purple-300 rounded p-3 sm:p-4 text-left max-w-sm mx-auto">
                  <p className="pixel-font text-xs sm:text-sm text-purple-800 font-bold mb-2">🎁 Coming Items:</p>
                  <ul className="pixel-font text-xs text-purple-700 space-y-1">
                    <li>• 🚀 Speed Boost - Run faster</li>
                    <li>• 🛡️ Shield - Block obstacles</li>
                    <li>• 💰 Double Coins - 2x rewards</li>
                    <li>• 🎭 Character Skins - Cosmetics</li>
                    <li>• ✨ Special Effects - Trails</li>
                  </ul>
                </div>

                <div className="mt-4 sm:mt-6 px-4">
                  <p className="pixel-font text-xs text-gray-500">
                    Power-ups will be added in the next update!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => { playSound('button'); setShowShop(false); }}
              className="nes-btn is-primary pixel-font w-full text-xs sm:text-sm py-1"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    </>
  );
}
