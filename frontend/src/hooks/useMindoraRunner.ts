import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getEvmContractAddresses, MindoraRunnerABI } from '@/config/contracts';
import { useState } from 'react';

// Get contract addresses - this will be called every time the hook is used
// This ensures we always use the latest contract address
const contracts = getEvmContractAddresses();

// Log contract address on import for debugging
console.log('🔍 useMindoraRunner - Contract Address:', {
  MINDORA_RUNNER: contracts.MINDORA_RUNNER,
  envVar: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'not set'
});

// Types based on our contract
export interface Player {
  username: string;
  isRegistered: boolean;
  currentStage: bigint;
  totalScore: bigint;
  inGameCoins: bigint;
  questTokensEarned: bigint;
  totalGamesPlayed: bigint;
  registrationTime: bigint;
}

export interface GameSession {
  player: string;
  stage: bigint;
  score: bigint;
  coinsCollected: bigint;
  stageCompleted: boolean;
  timestamp: bigint;
}

// Main hook for Mindora Runner contract interactions
export const useMindoraRunner = () => {
  const { writeContract, writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Write Functions
  const registerPlayer = async (username: string) => {
    try {
      console.log('📝 Registering player:', username);
      const result = writeContract({
        address: contracts.MINDORA_RUNNER,
        abi: MindoraRunnerABI,
        functionName: 'registerPlayer',
        args: [username],
      });
      console.log('✅ Registration transaction submitted');
      return result;
    } catch (error) {
      console.error('❌ Failed to register player:', error);
      throw error;
    }
  };

  const saveGameSession = async (
    stage: number,
    finalScore: number,
    coinsCollected: number,
    questionsCorrect: number,
    stageCompleted: boolean
  ) => {
    try {
      console.log('💾 Saving game session:', { stage, finalScore, coinsCollected, questionsCorrect, stageCompleted });

      // Validate parameters and provide defaults for undefined values
      const validStage = stage || 1;
      const validScore = finalScore || 0;
      const validCoins = coinsCollected || 0;
      const validQuestions = questionsCorrect || 0;

      console.log('💾 Validated parameters:', { validStage, validScore, validCoins, validQuestions, stageCompleted });

      // Use writeContractAsync to properly await the transaction submission
      const txHash = await writeContractAsync({
        address: contracts.MINDORA_RUNNER,
        abi: MindoraRunnerABI,
        functionName: 'saveGameSession',
        args: [
          BigInt(validStage),
          BigInt(validScore),
          BigInt(validCoins),
          BigInt(validQuestions),
          stageCompleted
        ],
      });
      console.log('✅ Game session save transaction submitted, hash:', txHash);
      console.log('⏳ Transaction is being mined... Please wait for confirmation.');
      return txHash;
    } catch (error) {
      console.error('❌ Failed to save game session:', error);
      throw error;
    }
  };

  const purchaseItem = async (itemType: string, cost: number) => {
    try {
      console.log('🛒 Purchasing item:', { itemType, cost });
      const result = writeContract({
        address: contracts.MINDORA_RUNNER,
        abi: MindoraRunnerABI,
        functionName: 'purchaseItem',
        args: [itemType, BigInt(cost)],
      });
      console.log('✅ Item purchase transaction submitted');
      return result;
    } catch (error) {
      console.error('❌ Failed to purchase item:', error);
      throw error;
    }
  };

  const claimTokens = async (stage: number) => {
    try {
      console.log('💰 Claiming tokens for stage:', stage);
      console.log('📤 Submitting transaction to blockchain...');

      const txHash = await writeContractAsync({
        address: contracts.MINDORA_RUNNER,
        abi: MindoraRunnerABI,
        functionName: 'claimTokens',
        args: [BigInt(stage)],
      });

      console.log('✅ Claim tokens transaction submitted, hash:', txHash);
      console.log('⏳ Transaction is being mined... Please wait for confirmation.');

      // Return the transaction hash
      return txHash;
    } catch (error) {
      console.error('❌ Failed to claim tokens:', error);
      throw error;
    }
  };

  const claimNFT = async (stage: number) => {
    try {
      console.log('🎖️ Claiming NFT for stage:', stage);
      console.log('📤 Submitting transaction to blockchain...');

      const txHash = await writeContractAsync({
        address: contracts.MINDORA_RUNNER,
        abi: MindoraRunnerABI,
        functionName: 'claimNFT',
        args: [BigInt(stage)],
      });

      console.log('✅ Claim NFT transaction submitted, hash:', txHash);
      console.log('⏳ Transaction is being mined... Please wait for confirmation.');

      // Return the transaction hash
      return txHash;
    } catch (error) {
      console.error('❌ Failed to claim NFT:', error);
      throw error;
    }
  };

  return {
    // Write functions
    registerPlayer,
    saveGameSession,
    purchaseItem,
    claimTokens,
    claimNFT,

    // Transaction state
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    lastTxHash,
  };
};

// Hook for reading player data
export const usePlayerData = (playerAddress?: string) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.MINDORA_RUNNER,
    abi: MindoraRunnerABI,
    functionName: 'getPlayer',
    args: playerAddress ? [playerAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!playerAddress,
    },
  });

  // Transform the data to a more usable format
  console.log('🔍 usePlayerData - Raw contract response:', {
    data,
    playerAddress,
    isLoading,
    error: error?.message
  });

  const player = data ? {
    username: data.username,
    isRegistered: data.isRegistered,
    currentStage: Number(data.currentStage || 0),
    totalScore: Number(data.totalScore || 0),
    inGameCoins: Number(data.inGameCoins || 0),
    questTokensEarned: Number(data.questTokensEarned || 0),
    totalGamesPlayed: Number(data.totalGamesPlayed || 0),
    registrationTime: Number(data.registrationTime || 0),
  } : null;

  console.log('🔍 usePlayerData - Transformed player:', {
    player,
    rawIsRegistered: data?.isRegistered,
    finalIsRegistered: player?.isRegistered
  });

  return {
    player,
    isLoading,
    error,
    refetch,
    raw: data, // Raw data if needed
  };
};

// Hook for reading leaderboard data
export const useLeaderboard = (stage: number, limit: number = 10) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.MINDORA_RUNNER,
    abi: MindoraRunnerABI,
    functionName: 'getStageLeaderboard',
    args: [BigInt(stage), BigInt(limit)],
  });

  // Transform leaderboard data
  console.log('🔍 useLeaderboard - Raw data:', {data, stage, limit, isLoading, error});

  const leaderboard = data ? data.map((session: { player: string; stage: bigint; score: bigint; coinsCollected: bigint; stageCompleted: boolean; timestamp: bigint }, index: number) => {
    console.log('🔍 useLeaderboard - Processing session:', session);

    // Handle both array and object formats
    const entry = {
      rank: index + 1,
      player: session?.player || 'Unknown',
      stage: Number(session?.stage || 0),
      score: Number(session?.score || 0),
      coinsCollected: Number(session?.coinsCollected || 0),
      stageCompleted: session?.stageCompleted || false,
      timestamp: Number(session?.timestamp || 0),
    };

    console.log('🔍 useLeaderboard - Transformed entry:', entry);
    return entry;
  }) : [];

  console.log('🔍 useLeaderboard - Final leaderboard:', leaderboard);

  return {
    leaderboard,
    isLoading,
    error,
    refetch,
    raw: data,
  };
};

// Hook for checking stage completion
export const useStageCompletion = (playerAddress?: string, stage?: number) => {
  const { data, isLoading, error } = useReadContract({
    address: contracts.MINDORA_RUNNER,
    abi: MindoraRunnerABI,
    functionName: 'isStageCompleted',
    args: playerAddress && stage ? [playerAddress as `0x${string}`, BigInt(stage)] : undefined,
    query: {
      enabled: !!playerAddress && stage !== undefined,
    },
  });

  console.log(`🔍 useStageCompletion - Stage ${stage} for ${playerAddress?.slice(-4)}:`, {
    data,
    isLoading,
    error: error?.message,
    enabled: !!playerAddress && stage !== undefined,
    args: playerAddress && stage ? [playerAddress, stage] : 'undefined'
  });

  return {
    isCompleted: data || false,
    isLoading,
    error,
  };
};

// Hook for checking if tokens are claimed
export const useTokensClaimed = (playerAddress?: string, stage?: number) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.MINDORA_RUNNER,
    abi: MindoraRunnerABI,
    functionName: 'areTokensClaimed',
    args: playerAddress && stage ? [playerAddress as `0x${string}`, BigInt(stage)] : undefined,
    query: {
      enabled: !!playerAddress && stage !== undefined,
    },
  });

  console.log(`🔍 useTokensClaimed - Stage ${stage} for ${playerAddress?.slice(-4)}:`, {
    data,
    isLoading,
    error: error?.message,
  });

  return {
    isClaimed: data || false,
    isLoading,
    error,
    refetch,
  };
};

// Hook for checking if NFT is claimed
export const useNFTClaimed = (playerAddress?: string, stage?: number) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.MINDORA_RUNNER,
    abi: MindoraRunnerABI,
    functionName: 'isNFTClaimed',
    args: playerAddress && stage ? [playerAddress as `0x${string}`, BigInt(stage)] : undefined,
    query: {
      enabled: !!playerAddress && stage !== undefined,
    },
  });

  console.log(`🔍 useNFTClaimed - Stage ${stage} for ${playerAddress?.slice(-4)}:`, {
    data,
    isLoading,
    error: error?.message,
  });

  return {
    isClaimed: data || false,
    isLoading,
    error,
    refetch,
  };
};

// Hook for general leaderboard (all stages combined)
export const useGeneralLeaderboard = (limit: number = 10) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.MINDORA_RUNNER,
    abi: MindoraRunnerABI,
    functionName: 'getGeneralLeaderboard',
    args: [BigInt(limit)],
  });

  console.log('🔍 useGeneralLeaderboard - Raw data:', {data, limit, isLoading, error});

  const leaderboard = data ? data.map((session: { player: string; stage: bigint; score: bigint; coinsCollected: bigint; stageCompleted: boolean; timestamp: bigint }, index: number) => {
    return {
      rank: index + 1,
      player: session?.player || 'Unknown',
      stage: Number(session?.stage || 0),
      score: Number(session?.score || 0),
      coinsCollected: Number(session?.coinsCollected || 0),
      stageCompleted: session?.stageCompleted || false,
      timestamp: Number(session?.timestamp || 0),
    };
  }) : [];

  return {
    leaderboard,
    isLoading,
    error,
    refetch,
    raw: data,
  };
};

// Hook for game statistics
export const useGameStats = () => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.MINDORA_RUNNER,
    abi: MindoraRunnerABI,
    functionName: 'getGameStats',
  });

  const stats = data ? {
    totalPlayers: Number(data[0]),
    totalGamesPlayed: Number(data[1]),
  } : null;

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};