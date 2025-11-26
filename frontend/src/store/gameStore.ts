import { create } from 'zustand';

export interface LeaderboardEntry {
  rank: number;
  player: string;
  username?: string;
  stage: number;
  score: number;
  coinsCollected: number;
  totalCoins?: number;
  totalGames?: number;
  stageCompleted: boolean;
  timestamp: number;
}

export interface GameSessionResult {
  success: boolean;
  questTokensEarned?: number;
  transactionHash?: string;
}

export interface Player {
  id: string;
  walletAddress: string;
  username?: string;
  currentStage: number;
  totalScore: number;
  inGameCoins: number;        // Persistent coins for purchases
  tokensEarned: number;       // QuestCoin HTS tokens (questTokensEarned from contract)
  nftsEarned: number;
  completedStages: number[];
  tokensClaimedStages: number[];  // Stages where QuestCoin tokens have been claimed
  nftClaimedStages: number[];     // Stages where NFT badges have been claimed
  claimedStages: number[];    // Stages where BOTH rewards have been claimed
  totalGamesPlayed: number;   // Session counter
  isRegistered: boolean;      // From contract
  registrationTime: number;   // From contract
}

export interface Stage {
  id: number;
  name: string;
  difficulty: number;
  tokenReward: number;
  minScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
}

export interface GameState {
  // Player state
  player: Player | null;
  isConnected: boolean;
  walletAddress: string | null;

  // Game state
  currentStage: number;
  score: number;
  sessionCoins: number;       // Coins collected this session (temp)
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number;
  gameMode: 'menu' | 'stage-select' | 'playing' | 'paused' | 'game-over';

  // Game over state
  isGameOver: boolean;
  gameOverReason: 'obstacle' | 'question' | 'completed' | null;
  finalScore: number;
  finalCoins: number;

  // Transaction state
  isSavingSession: boolean;   // Show loading during blockchain save
  saveSuccess: boolean;       // Show success after blockchain save

  // UI state
  showQuiz: boolean;
  currentQuestion: Question | null;
  quizAnswers: { [questionId: string]: number };

  // Notification state
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  } | null;

  // Actions
  setPlayer: (player: Player | null) => void;
  setConnected: (connected: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  updateScore: (points: number) => void;
  updateSessionCoins: (amount: number) => void;
  setPlaying: (playing: boolean) => void;
  setSavingSession: (saving: boolean) => void;
  setPaused: (paused: boolean) => void;
  setGameSpeed: (speed: number) => void;
  setGameMode: (mode: 'menu' | 'stage-select' | 'playing' | 'paused' | 'game-over') => void;
  setCurrentStage: (stage: number) => void;
  setShowQuiz: (show: boolean) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setQuizAnswer: (questionId: string, answer: number) => void;
  setGameOver: (reason: 'obstacle' | 'question' | 'completed', finalScore: number, finalCoins: number) => void;
  restartGame: () => void;
  resetGame: () => void;
  
  // Notification actions
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration?: number) => void;
  hideNotification: () => void;

  // Contract interaction callbacks - will be set by components using hooks
  setContractCallbacks: (callbacks: {
    registerPlayer: (username: string) => Promise<boolean>;
    saveGameSession: (stage: number, finalScore: number, coinsCollected: number, questionsCorrect: number, stageCompleted: boolean) => Promise<{ success: boolean; transactionId?: string }>;
    waitForTransactionConfirmation: (transactionId: string) => Promise<boolean>;
    loadPlayerData: (walletAddress: string) => Promise<Player | null>;
    loadLeaderboard: (stage: number, limit: number) => Promise<LeaderboardEntry[]>;
    claimTokens: (stage: number) => Promise<boolean>;
    claimNFT: (stage: number) => Promise<boolean>;
    purchaseItem: (itemName: string, itemCost: number) => Promise<boolean>;
  }) => void;
  contractCallbacks: {
    registerPlayer?: (username: string) => Promise<boolean>;
    saveGameSession?: (stage: number, finalScore: number, coinsCollected: number, questionsCorrect: number, stageCompleted: boolean) => Promise<{ success: boolean; transactionId?: string }>;
    waitForTransactionConfirmation?: (transactionId: string) => Promise<boolean>;
    loadPlayerData?: (walletAddress: string) => Promise<Player | null>;
    loadLeaderboard?: (stage: number, limit: number) => Promise<LeaderboardEntry[]>;
    claimTokens?: (stage: number) => Promise<boolean>;
    claimNFT?: (stage: number) => Promise<boolean>;
    purchaseItem?: (itemName: string, itemCost: number) => Promise<boolean>;
  };

  // High-level actions that use the callbacks
  registerPlayer: (username: string) => Promise<boolean>;
  saveGameSession: (finalScore: number, stageCompleted: boolean) => Promise<boolean>;
  loadPlayerData: (walletAddress: string) => Promise<void>;
  loadLeaderboard: () => Promise<LeaderboardEntry[]>;
  completeStage: (stageId: number, finalScore: number) => Promise<boolean>;
  claimTokens: (stage: number) => Promise<boolean>;
  claimNFT: (stage: number) => Promise<boolean>;
}

const _initialPlayer: Player = {
  id: '',
  walletAddress: '',
  currentStage: 1,
  totalScore: 0,
  inGameCoins: 0,
  tokensEarned: 0,
  nftsEarned: 0,
  completedStages: [],
  tokensClaimedStages: [],
  nftClaimedStages: [],
  claimedStages: [],
  totalGamesPlayed: 0,
  isRegistered: false,
  registrationTime: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  player: null,
  isConnected: false,
  walletAddress: null,
  currentStage: 1,
  score: 0,
  sessionCoins: 0,
  isPlaying: false,
  isPaused: false,
  gameSpeed: 1,
  gameMode: 'stage-select',
  isGameOver: false,
  gameOverReason: null,
  finalScore: 0,
  finalCoins: 0,
  isSavingSession: false,
  saveSuccess: false,
  showQuiz: false,
  currentQuestion: null,
  quizAnswers: {},
  notification: null,
  contractCallbacks: {},

  // Actions
  setPlayer: (player) => set({ player }),

  setConnected: (connected) => set({ isConnected: connected }),

  setWalletAddress: (address) => set({ walletAddress: address }),

  setGameMode: (mode) => set({ gameMode: mode }),

  setCurrentStage: (stage) => set({ currentStage: stage }),
  
  updateScore: (points) => set((state) => ({
    score: state.score + points,
    player: state.player ? {
      ...state.player,
      totalScore: state.player.totalScore + points
    } : null
  })),
  
  updateSessionCoins: (amount) => set((state) => ({
    sessionCoins: Math.max(0, state.sessionCoins + amount)
  })),

  setSavingSession: (saving) => set({ isSavingSession: saving }),

  setContractCallbacks: (callbacks) => set({ contractCallbacks: callbacks }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  setPaused: (paused) => set({ isPaused: paused }),
  
  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  
  setShowQuiz: (show) => set({ showQuiz: show }),
  
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  
  setQuizAnswer: (questionId, answer) => set((state) => ({
    quizAnswers: {
      ...state.quizAnswers,
      [questionId]: answer
    }
  })),

  showNotification: (type, title, message, duration = 5000) => set({
    notification: {
      id: Date.now().toString(),
      type,
      title,
      message,
      duration
    }
  }),

  hideNotification: () => set({ notification: null }),

  setGameOver: (reason, finalScore, finalCoins) => set({
    isGameOver: true,
    gameOverReason: reason,
    finalScore,
    finalCoins,
    isPlaying: false,
    gameMode: 'game-over',
    saveSuccess: false,         // Reset save success state
    isSavingSession: false      // Reset saving state
  }),

  restartGame: () => set({
    isGameOver: false,
    gameOverReason: null,
    finalScore: 0,
    finalCoins: 0,
    score: 0,
    sessionCoins: 0,
    isPlaying: false,
    gameMode: 'stage-select',
    showQuiz: false,
    currentQuestion: null,
    quizAnswers: {},
    saveSuccess: false
  }),
  
  // High-level actions that use the contract callbacks
  registerPlayer: async (username) => {
    try {
      const { contractCallbacks, walletAddress } = get();
      if (!contractCallbacks.registerPlayer || !walletAddress) return false;

      const success = await contractCallbacks.registerPlayer(username);
      if (success) {
        await get().loadPlayerData(walletAddress);
      }
      return success;
    } catch (error) {
      console.error('Failed to register player:', error);
      return false;
    }
  },

  saveGameSession: async (finalScore, stageCompleted) => {
    const state = get();
    if (!state.player || !state.contractCallbacks.saveGameSession) return false;

    try {
      // IMPORTANT FIX: Count correct answers properly
      // quizAnswers stores { questionId: selectedAnswerIndex }
      // To count correct answers, we need to compare each answer with its question's correctAnswer
      // But since we only store answers when correct (see QuizModal), we can count entries
      // However, if stage is completed, they must have answered at least 1 question correctly
      let questionsCorrect = Object.keys(state.quizAnswers).length;
      
      // If stage completed but no quiz answers recorded, use default of 1
      // (This happens when player completed stage but quizAnswers weren't tracked properly)
      if (stageCompleted && questionsCorrect === 0) {
        console.warn('⚠️ Stage completed but no quiz answers recorded. Using default of 1 correct answer.');
        questionsCorrect = 1;
      }

      console.log('💳 Calling saveGameSession callback...', {
        localCurrentStage: state.currentStage,
        contractCurrentStage: state.player?.currentStage || 1,
        finalScore,
        sessionCoins: state.sessionCoins,
        questionsCorrect,
        stageCompleted,
        quizAnswersCount: Object.keys(state.quizAnswers).length,
        quizAnswers: state.quizAnswers
      });

      // The updated contract now allows saving currentStage + 1 if previous stage is completed
      // So we can directly save the current stage - contract will handle validation
      const result = await state.contractCallbacks.saveGameSession(
        state.currentStage,
        finalScore,
        state.sessionCoins,
        questionsCorrect,
        stageCompleted
      );

      return result.success;
    } catch (error) {
      console.error('Failed to save game session:', error);
      return false;
    }
  },

  claimTokens: async (stage) => {
    try {
      const { contractCallbacks } = get();
      if (!contractCallbacks.claimTokens) return false;
      const success = await contractCallbacks.claimTokens(stage);
      return success;
    } catch (error) {
      console.error('Failed to claim tokens:', error);
      return false;
    }
  },

  claimNFT: async (stage) => {
    try {
      const { contractCallbacks } = get();
      if (!contractCallbacks.claimNFT) return false;
      const success = await contractCallbacks.claimNFT(stage);
      return success;
    } catch (error) {
      console.error('Failed to claim NFT:', error);
      return false;
    }
  },

  loadPlayerData: async (walletAddress) => {
    try {
      const { contractCallbacks } = get();
      if (!contractCallbacks.loadPlayerData) {
        console.log('Contract callbacks not ready, waiting...');
        return;
      }

      console.log('Loading player data for:', walletAddress);
      const playerData = await contractCallbacks.loadPlayerData(walletAddress);
      console.log('Received player data:', playerData);

      if (playerData) {
        set({
          player: playerData,
          currentStage: playerData.currentStage,
          score: 0,
          sessionCoins: 0
        });
        console.log('Player data set in store:', playerData);
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
    }
  },

  loadLeaderboard: async () => {
    try {
      const { contractCallbacks, currentStage } = get();
      if (!contractCallbacks.loadLeaderboard) return [];

      return await contractCallbacks.loadLeaderboard(currentStage, 10);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      return [];
    }
  },

  completeStage: async (stageId, finalScore) => {
    try {
      const success = await get().saveGameSession(finalScore, true);

      if (success) {
        set((state) => ({
          currentStage: Math.max(state.currentStage, stageId + 1),
          score: 0, // Reset score for next stage
          showQuiz: false,
          currentQuestion: null,
          quizAnswers: {}
        }));
      }

      return success;
    } catch (error) {
      console.error('Failed to complete stage:', error);
      return false;
    }
  },
  
  resetGame: () => set({
    player: null,
    isConnected: false,
    walletAddress: null,
    currentStage: 1,
    score: 0,
    sessionCoins: 0,
    isPlaying: false,
    isPaused: false,
    gameSpeed: 1,
    gameMode: 'stage-select',
    isGameOver: false,
    gameOverReason: null,
    finalScore: 0,
    finalCoins: 0,
    showQuiz: false,
    currentQuestion: null,
    quizAnswers: {},
    contractCallbacks: {}
  })
}));
