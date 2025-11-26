'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useGameStore, Player, LeaderboardEntry } from '@/store/gameStore';
import { useMindoraRunner, usePlayerData, useLeaderboard, useStageCompletion } from '@/hooks/useMindoraRunner';
import { hederaService } from '@/services/hederaService';
import { getContractAddresses } from '@/config/contracts';

export function ContractManager() {
  const { address, isConnected } = useAccount();
  const { setContractCallbacks, setConnected, setWalletAddress, setPlayer } = useGameStore();

  const mindoraHook = useMindoraRunner();
  const { registerPlayer, saveGameSession, isPending, isConfirming, isSuccess, hash } = mindoraHook;
  const { player: contractPlayer, refetch: refetchPlayer } = usePlayerData(address);
  // Use dynamic stage for leaderboard - use current player stage or default to 1
  const leaderboardStage = contractPlayer?.currentStage || 1;
  const { leaderboard, refetch: refetchLeaderboard } = useLeaderboard(leaderboardStage, 10);

  // Get stage completion status for all stages
  const stage1Completion = useStageCompletion(address, 1);
  const stage2Completion = useStageCompletion(address, 2);
  const stage3Completion = useStageCompletion(address, 3);

  // Debug stage completions
  useEffect(() => {
    if (address && contractPlayer) {
      console.log('🔍 ContractManager - Stage completions DEBUG:', {
        address,
        playerCurrentStage: contractPlayer.currentStage,
        stage1Hook: stage1Completion.isCompleted,
        stage2Hook: stage2Completion.isCompleted,
        stage3Hook: stage3Completion.isCompleted,
        stage1Loading: stage1Completion.isLoading,
        stage2Loading: stage2Completion.isLoading,
        stage3Loading: stage3Completion.isLoading,
        calculatedCompletedStages: [
          ...(stage1Completion.isCompleted || Number(contractPlayer.currentStage) >= 2 ? [1] : []),
          ...(stage2Completion.isCompleted || Number(contractPlayer.currentStage) >= 3 ? [2] : []),
          ...(stage3Completion.isCompleted ? [3] : [])
        ],
        stage1Check: `${stage1Completion.isCompleted} || ${Number(contractPlayer.currentStage)} >= 2 = ${stage1Completion.isCompleted || Number(contractPlayer.currentStage) >= 2}`,
        stage2Check: `${stage2Completion.isCompleted} || ${Number(contractPlayer.currentStage)} >= 3 = ${stage2Completion.isCompleted || Number(contractPlayer.currentStage) >= 3}`
      });
    }
  }, [address, contractPlayer?.currentStage, stage1Completion.isCompleted, stage2Completion.isCompleted, stage3Completion.isCompleted]);

  // Use refs to store current values without causing re-renders
  const hooksRef = useRef({
    registerPlayer,
    saveGameSession,
    refetchPlayer,
    refetchLeaderboard,
    contractPlayer,
    leaderboard
  });

  // Update refs with current values
  useEffect(() => {
    hooksRef.current = {
      registerPlayer,
      saveGameSession,
      refetchPlayer,
      refetchLeaderboard,
      contractPlayer,
      leaderboard
    };
  });

  // Update connection state when wallet connects/disconnects
  useEffect(() => {
    setConnected(isConnected);
    setWalletAddress(isConnected ? address || null : null);
  }, [isConnected, address, setConnected, setWalletAddress]);

  // Update game store when contract player data changes
  useEffect(() => {
    if (contractPlayer && address) {
      console.log('🔄 ContractManager - Contract player data changed:', contractPlayer);
      console.log('🔄 ContractManager - Current player stage info:', {
        currentStage: contractPlayer.currentStage,
        totalScore: contractPlayer.totalScore,
        questTokensEarned: contractPlayer.questTokensEarned,
        inGameCoins: contractPlayer.inGameCoins,
      });

      if (contractPlayer.isRegistered) {
        const playerData: Player = {
          id: address,
          walletAddress: address,
          username: contractPlayer.username || undefined,
          currentStage: Math.max(contractPlayer.currentStage, 1),
          totalScore: contractPlayer.totalScore,
          inGameCoins: contractPlayer.inGameCoins,
          tokensEarned: contractPlayer.questTokensEarned,
          nftsEarned: 0,
          completedStages: (() => {
            const completed = [];
            const currentStageNum = Number(contractPlayer.currentStage);
            const tokensEarned = Number(contractPlayer.questTokensEarned);

            console.log('🔍 Building completedStages:', {
              currentStageNum,
              tokensEarned,
              stage1Hook: stage1Completion.isCompleted,
              stage2Hook: stage2Completion.isCompleted,
              stage3Hook: stage3Completion.isCompleted,
              isLoading: stage1Completion.isLoading || stage2Completion.isLoading || stage3Completion.isLoading,
            });

            // Use contract hooks first (most accurate)
            console.log('🔍 Checking individual stage completions:', {
              stage1Completed: stage1Completion.isCompleted,
              stage2Completed: stage2Completion.isCompleted,
              stage3Completed: stage3Completion.isCompleted,
            });

            if (stage1Completion.isCompleted) {
              completed.push(1);
              console.log('✅ Stage 1 marked as completed (from contract hook)');
            }

            if (stage2Completion.isCompleted) {
              completed.push(2);
              console.log('✅ Stage 2 marked as completed (from contract hook)');
            }

            if (stage3Completion.isCompleted) {
              completed.push(3);
              console.log('✅ Stage 3 marked as completed (from contract hook)');
            }

            // Fallback: If you have tokens, you must have completed some stages
            if (completed.length === 0 && tokensEarned > 0) {
              console.log('🔄 No stages marked complete by hooks, but you have tokens. Using fallback logic.');

              // 20 tokens = Stage 1, 70 tokens = Stage 1+2, 170 tokens = all stages
              if (tokensEarned >= 20) {
                completed.push(1);
                console.log('✅ Stage 1 marked as completed (from token count)');
              }
              if (tokensEarned >= 70) {
                completed.push(2);
                console.log('✅ Stage 2 marked as completed (from token count)');
              }
              if (tokensEarned >= 170) {
                completed.push(3);
                console.log('✅ Stage 3 marked as completed (from token count)');
              }
            }

            // Final fallback: If currentStage > 1 but still no completed stages, something is wrong
            if (completed.length === 0 && currentStageNum > 1) {
              console.log('⚠️ Fallback: You are in stage', currentStageNum, 'but no stages marked complete. Marking stage 1 as complete.');
              completed.push(1);
            }

            console.log('🔍 Final completed stages:', completed);
            return completed;
          })(),
          totalGamesPlayed: contractPlayer.totalGamesPlayed,
          isRegistered: true,
          registrationTime: contractPlayer.registrationTime,
        };

        console.log('✅ ContractManager - Setting registered player in store:', playerData);
        setPlayer(playerData);
      } else {
        const unregisteredPlayer: Player = {
          id: address,
          walletAddress: address,
          username: undefined,
          currentStage: 1,
          totalScore: 0,
          inGameCoins: 0,
          tokensEarned: 0,
          nftsEarned: 0,
          completedStages: [],
          totalGamesPlayed: 0,
          isRegistered: false,
          registrationTime: 0,
        };

        console.log('❌ ContractManager - Setting unregistered player in store:', unregisteredPlayer);
        setPlayer(unregisteredPlayer);
      }
    }
  }, [
    contractPlayer?.isRegistered,
    contractPlayer?.username,
    contractPlayer?.currentStage,
    contractPlayer?.totalScore,
    contractPlayer?.inGameCoins,
    contractPlayer?.questTokensEarned,
    contractPlayer?.totalGamesPlayed,
    contractPlayer?.registrationTime,
    stage1Completion.isCompleted,
    stage2Completion.isCompleted,
    stage3Completion.isCompleted,
    stage1Completion.isLoading,
    stage2Completion.isLoading,
    stage3Completion.isLoading,
    address
  ]); // Added isLoading to dependencies to trigger updates when data loads

  // Separate effect to force player data update when stage completion data changes
  useEffect(() => {
    if (contractPlayer?.isRegistered && address &&
        !stage1Completion.isLoading && !stage2Completion.isLoading && !stage3Completion.isLoading) {

      console.log('🔄 ContractManager - Forcing player update due to stage completion changes');

      // Force recalculation of completed stages
      const completed = [];

      if (stage1Completion.isCompleted) {
        completed.push(1);
        console.log('✅ Stage 1 marked as completed (forced update)');
      }

      if (stage2Completion.isCompleted) {
        completed.push(2);
        console.log('✅ Stage 2 marked as completed (forced update)');
      }

      if (stage3Completion.isCompleted) {
        completed.push(3);
        console.log('✅ Stage 3 marked as completed (forced update)');
      }

      console.log('🔍 Forced update - Final completed stages:', completed);

      const updatedPlayer: Player = {
        id: address,
        walletAddress: address,
        username: contractPlayer.username || undefined,
        currentStage: Math.max(Number(contractPlayer.currentStage), 1),
        totalScore: contractPlayer.totalScore,
        inGameCoins: contractPlayer.inGameCoins,
        tokensEarned: contractPlayer.questTokensEarned,
        nftsEarned: 0,
        completedStages: completed,
        totalGamesPlayed: contractPlayer.totalGamesPlayed,
        isRegistered: true,
        registrationTime: contractPlayer.registrationTime,
      };

      console.log('🔄 ContractManager - Setting updated player with stage completions:', updatedPlayer);
      setPlayer(updatedPlayer);
    }
  }, [
    stage1Completion.isCompleted,
    stage2Completion.isCompleted,
    stage3Completion.isCompleted,
    stage1Completion.isLoading,
    stage2Completion.isLoading,
    stage3Completion.isLoading,
    contractPlayer?.isRegistered,
    contractPlayer?.username,
    contractPlayer?.currentStage,
    contractPlayer?.totalScore,
    contractPlayer?.inGameCoins,
    contractPlayer?.questTokensEarned,
    contractPlayer?.totalGamesPlayed,
    contractPlayer?.registrationTime,
    address,
    setPlayer
  ]);

  // Monitor wagmi transaction states and update game store
  useEffect(() => {
    const { isSavingSession, saveSuccess } = useGameStore.getState();

    console.log('🔍 Transaction states:', { isPending, isConfirming, isSuccess, hash: hash?.slice(0, 10) });

    // Handle transaction submission (isPending)
    if (isPending && !isSavingSession) {
      console.log('💾 Transaction submitted, setting saving state');
      useGameStore.setState({ isSavingSession: true });
    }

    // Handle transaction confirmation (isSuccess)
    if (isSuccess && isSavingSession && !saveSuccess) {
      console.log('✅ Transaction confirmed, setting success state');

      // Update player coins and reset session data only AFTER confirmation
      const { player, sessionCoins, score, finalScore, currentStage } = useGameStore.getState();

      if (player) {
        const currentCoins = player.inGameCoins || 0;
        const coinsToAdd = sessionCoins || 0;
        const completionBonus = 0; // We can determine this from the transaction context if needed
        const newInGameCoins = currentCoins + coinsToAdd + completionBonus;

        console.log('💰 Updating coins after confirmation:', {
          currentCoins,
          coinsToAdd,
          newInGameCoins
        });

        useGameStore.setState({
          isSavingSession: false,
          saveSuccess: true,
          // DON'T reset sessionCoins - keep them visible to show what was just saved
          // Only reset other session data
          showQuiz: false,
          currentQuestion: null,
          quizAnswers: {},
          // Update player data
          player: {
            ...player,
            inGameCoins: newInGameCoins,
            totalScore: player.totalScore + (finalScore || 0),
            totalGamesPlayed: player.totalGamesPlayed + 1,
          }
        });
      } else {
        useGameStore.setState({
          isSavingSession: false,
          saveSuccess: true
        });
      }

      // Refetch player data after successful transaction
      setTimeout(() => refetchPlayer(), 2000);
    }
  }, [isPending, isConfirming, isSuccess, hash, refetchPlayer]);

  // Initialize Hedera service with contract address
  useEffect(() => {
    const contractAddresses = getContractAddresses();
    hederaService.setContractAddress(contractAddresses.MINDORA_RUNNER);
    console.log('🔧 ContractManager - Hedera service initialized with contract:', contractAddresses.MINDORA_RUNNER);
  }, []);

  // Set up contract callbacks only once when the component mounts
  useEffect(() => {
    const callbacks = {
      registerPlayer: async (username: string): Promise<boolean> => {
        try {
          await hooksRef.current.registerPlayer(username);
          // Wait a bit for the transaction to be mined, then refetch
          setTimeout(() => hooksRef.current.refetchPlayer(), 3000);
          return true;
        } catch (error) {
          console.error('Register player failed:', error);
          return false;
        }
      },

      saveGameSession: async (
        stage: number,
        finalScore: number,
        coinsCollected: number,
        questionsCorrect: number,
        stageCompleted: boolean
      ): Promise<{ success: boolean; transactionId?: string }> => {
        try {
          console.log('💾 ContractManager - Starting save game session:', {stage, finalScore, coinsCollected, stageCompleted});

          // Call the wagmi hook - this will trigger the transaction
          await hooksRef.current.saveGameSession(stage, finalScore, coinsCollected, questionsCorrect, stageCompleted);

          // Stage completion is now saved to contract - minting handled separately via Collection UI
          if (stageCompleted) {
            console.log('🏆 ContractManager - Stage completed! Progress saved to blockchain. Use Collection to mint rewards.');
          }

          // The transaction states will be handled by the useEffect above
          return { success: true };
        } catch (error) {
          console.error('Save game session failed:', error);
          return { success: false };
        }
      },

      loadPlayerData: async (walletAddress: string): Promise<Player | null> => {
        try {
          console.log('🔄 ContractManager - Starting loadPlayerData for:', walletAddress);
          await hooksRef.current.refetchPlayer();

          // Wait a moment for refetch to complete
          await new Promise(resolve => setTimeout(resolve, 500));

          const { contractPlayer } = hooksRef.current;

          console.log('🔧 ContractManager - Raw contract data:', contractPlayer);
          console.log('🔧 ContractManager - isRegistered check:', {
            contractPlayer: !!contractPlayer,
            isRegistered: contractPlayer?.isRegistered,
            username: contractPlayer?.username
          });

          // Contract always returns player data, check isRegistered to determine if they're registered
          if (contractPlayer) {
            // If player is registered, use contract data
            if (contractPlayer.isRegistered) {
              console.log('✅ ContractManager - Player is registered, returning registered player data');
              return {
                id: walletAddress,
                walletAddress: walletAddress,
                username: contractPlayer.username || undefined,
                currentStage: Math.max(contractPlayer.currentStage, 1), // Ensure at least stage 1
                totalScore: contractPlayer.totalScore,
                inGameCoins: contractPlayer.inGameCoins,
                tokensEarned: contractPlayer.questTokensEarned,
                nftsEarned: 0, // Not tracked in contract yet
                completedStages: [], // We'd need to query this separately
                totalGamesPlayed: contractPlayer.totalGamesPlayed,
                isRegistered: true,
                registrationTime: contractPlayer.registrationTime,
              };
            } else {
              console.log('❌ ContractManager - Player is NOT registered, returning unregistered player data');
              // Player exists in contract but not registered - return unregistered player
              return {
                id: walletAddress,
                walletAddress: walletAddress,
                username: undefined,
                currentStage: 1, // Default to stage 1 for unregistered
                totalScore: 0,
                inGameCoins: 0,
                tokensEarned: 0,
                nftsEarned: 0,
                completedStages: [],
                totalGamesPlayed: 0,
                isRegistered: false,
                registrationTime: 0,
              };
            }
          }

          // If contractPlayer is null/undefined, return a default unregistered player
          return {
            id: walletAddress,
            walletAddress: walletAddress,
            username: undefined,
            currentStage: 1,
            totalScore: 0,
            inGameCoins: 0,
            tokensEarned: 0,
            nftsEarned: 0,
            completedStages: [],
            totalGamesPlayed: 0,
            isRegistered: false,
            registrationTime: 0,
          };
        } catch (error) {
          console.error('Load player data failed:', error);
          // Return default unregistered player on error
          return {
            id: walletAddress,
            walletAddress: walletAddress,
            username: undefined,
            currentStage: 1,
            totalScore: 0,
            inGameCoins: 0,
            tokensEarned: 0,
            nftsEarned: 0,
            completedStages: [],
            totalGamesPlayed: 0,
            isRegistered: false,
            registrationTime: 0,
          };
        }
      },

      loadLeaderboard: async (stage: number, limit: number): Promise<LeaderboardEntry[]> => {
        try {
          console.log('🔄 ContractManager - Loading leaderboard with usernames for stage:', stage);
          await hooksRef.current.refetchLeaderboard();
          const rawLeaderboard = hooksRef.current.leaderboard || [];

          console.log('🔄 ContractManager - Raw leaderboard entries:', rawLeaderboard);

          // Aggregate leaderboard data - keep best score per player
          const playerBestScores = new Map();

          rawLeaderboard.forEach((entry: { player: string; score: number; stage: number; coinsCollected: number; stageCompleted: boolean; timestamp: number }) => {
            const playerId = entry.player;
            const existing = playerBestScores.get(playerId);

            if (!existing || entry.score > existing.score ||
                (entry.score === existing.score && entry.coinsCollected > existing.coinsCollected)) {
              playerBestScores.set(playerId, {
                ...entry,
                totalGames: (existing?.totalGames || 0) + 1, // Count number of games played
                totalCoins: (existing?.totalCoins || 0) + Number(entry.coinsCollected), // Sum all coins collected
              });
            } else {
              // Update games count and total coins even if this isn't the best score
              existing.totalGames = (existing.totalGames || 0) + 1;
              existing.totalCoins = (existing.totalCoins || 0) + Number(entry.coinsCollected);
            }
          });

          console.log('🔄 ContractManager - Aggregated player data:', Array.from(playerBestScores.values()));

          // Convert to array and sort by best score
          const aggregatedEntries = Array.from(playerBestScores.values())
            .sort((a, b) => b.score - a.score || b.coinsCollected - a.coinsCollected);

          // Enhance with usernames
          const enhancedLeaderboard = await Promise.all(
            aggregatedEntries.map(async (entry: { player: string; score: number; stage: number; coinsCollected: number; stageCompleted: boolean; timestamp: number; totalCoins: number; totalGames: number }, index: number) => {
              try {
                // Get player data to fetch username
                const playerData = await hederaService.getPlayer(entry.player);

                return {
                  rank: index + 1, // Recalculate rank after aggregation
                  player: entry.player,
                  username: playerData?.username || `Player ${entry.player.slice(-4)}`,
                  stage: entry.stage,
                  score: entry.score, // Best score
                  coinsCollected: entry.coinsCollected, // Coins from best game
                  totalCoins: entry.totalCoins, // Total coins across all games
                  totalGames: entry.totalGames, // Number of games played
                  stageCompleted: entry.stageCompleted,
                  timestamp: entry.timestamp,
                };
              } catch (error) {
                console.error('Failed to get player data for:', entry.player, error);
                return {
                  rank: index + 1,
                  player: entry.player,
                  username: `Player ${entry.player.slice(-4)}`,
                  stage: entry.stage,
                  score: entry.score,
                  coinsCollected: entry.coinsCollected,
                  totalCoins: entry.totalCoins,
                  totalGames: entry.totalGames,
                  stageCompleted: entry.stageCompleted,
                  timestamp: entry.timestamp,
                };
              }
            })
          );

          console.log('✅ ContractManager - Enhanced leaderboard with usernames:', enhancedLeaderboard);
          return enhancedLeaderboard;
        } catch (error) {
          console.error('Load leaderboard failed:', error);
          return [];
        }
      },

      mintRewards: async (stage: number, badgeName: string, tokenAmount: number, walletAddress: string): Promise<boolean> => {
        try {
          console.log(`🎖️ ContractManager - Starting mint rewards for ${badgeName}:`, { stage, tokenAmount, walletAddress });

          // Try to mint QuestCoin tokens
          console.log(`🪙 Minting ${tokenAmount} QuestCoin tokens...`);
          const questCoinSuccess = await hederaService.mintQuestCoins(tokenAmount, walletAddress);

          // Try to mint NFT
          console.log(`🎖️ Minting ${badgeName} NFT...`);
          const nftSuccess = await hederaService.mintNFTBadge(badgeName, walletAddress);

          console.log(`✅ ContractManager - Mint results:`, { questCoinSuccess, nftSuccess });

          // Return true if either succeeded
          return questCoinSuccess || nftSuccess;
        } catch (error) {
          console.error('❌ ContractManager - Mint rewards failed:', error);
          return false;
        }
      },

      waitForTransactionConfirmation: async (transactionId: string): Promise<boolean> => {
        try {
          console.log(`⏳ Waiting for transaction confirmation: ${transactionId}`);
          return await hederaService.waitForTransactionConfirmation(transactionId);
        } catch (error) {
          console.error('❌ Transaction confirmation failed:', error);
          return false;
        }
      },
    };

    setContractCallbacks(callbacks);
  }, [setContractCallbacks]); // Only depend on setContractCallbacks

  // This component doesn't render anything, it just manages contract interactions
  return null;
}