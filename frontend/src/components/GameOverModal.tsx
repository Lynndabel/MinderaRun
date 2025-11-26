'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameSounds } from '@/hooks/useGameSounds';

export function GameOverModal() {
  const {
    isGameOver,
    gameOverReason,
    finalScore,
    finalCoins,
    sessionCoins,
    currentStage,
    player,
    restartGame,
    isSavingSession,
    saveSuccess,
    setCurrentStage,
    saveGameSession,
    showNotification
  } = useGameStore();
  
  const { playSound } = useGameSounds();

  // Reset save states when modal opens
  useEffect(() => {
    if (isGameOver && (isSavingSession || saveSuccess)) {
      // States will be managed by the store
    }
  }, [isGameOver]);

  if (!isGameOver) return null;

  const getStageTokenReward = (stage: number) => {
    if (stage === 1) return 20;
    if (stage === 2) return 50;
    if (stage === 3) return 100;
    return 0;
  };

  const getStageBadgeName = (stage: number) => {
    if (stage === 1) return 'Explorer Badge';
    if (stage === 2) return 'Adventurer Badge';
    if (stage === 3) return 'Master Badge';
    return 'Badge';
  };

  const getGameOverTitle = () => {
    switch (gameOverReason) {
      case 'obstacle':
        return '💥 Game Over!';
      case 'question':
        return '❌ Wrong Answer!';
      case 'completed':
        return '🎉 Stage Complete!';
      default:
        return '🎯 Game Over!';
    }
  };

  const getGameOverMessage = () => {
    switch (gameOverReason) {
      case 'obstacle':
        return 'You hit an obstacle! Save your progress to the blockchain?';
      case 'question':
        return 'You answered incorrectly! Save your progress to the blockchain?';
      case 'completed':
        return `Congratulations! You completed Stage ${currentStage}! Save your achievement to earn tokens?`;
      default:
        return 'Save your progress to the blockchain?';
    }
  };

  const handleTryAgain = () => {
    restartGame();
  };

  const handleSaveProgress = async () => {
    playSound('button');
    const stageCompleted = gameOverReason === 'completed';
    console.log('🎮 GameOverModal - Starting save process with values:', {
      finalScore,
      sessionCoins,
      stageCompleted,
      gameOverReason,
      player,
      walletConnected: !!player?.walletAddress
    });

    // Check if wallet is connected
    if (!player || !player.walletAddress) {
      showNotification('warning', 'Wallet Not Connected', 'Please connect your wallet first to save progress to blockchain!');
      return;
    }

    try {
      console.log('📞 Calling saveGameSession...');
      // Show toast like AGRO does
      console.log('Transaction submitted! Waiting for confirmation...');

      const success = await saveGameSession(finalScore, stageCompleted);
      console.log('📞 saveGameSession returned:', success);

      if (!success) {
        console.log('❌ Transaction failed or was rejected');
        // Error handling is managed by the store
      }
      // If success, the isSavingSession state will handle the UI
    } catch (error) {
      console.error('❌ Exception in handleSaveProgress:', error);
      // Error handling is managed by the store
    }
  };

  const handleNextStage = () => {
    playSound('button');
    // Progress to next stage
    if (currentStage < 3) {
      setCurrentStage(currentStage + 1);
    }
    restartGame();
  };

  const handleSkipSave = () => {
    playSound('button');
    // User has been warned in the UI already, just restart
    restartGame();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 pointer-events-auto p-2 sm:p-4">
      <div className="nes-container with-title is-centered pixel-art max-w-sm sm:max-w-md lg:max-w-lg w-full" style={{ backgroundColor: 'white', border: '3px solid #000' }}>
        <p className="title pixel-font text-primary text-sm sm:text-base" style={{ fontWeight: 'bold' }}>{getGameOverTitle()}</p>

        {/* Game Over Content */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">
            {gameOverReason === 'completed' ? '🏆' :
             gameOverReason === 'obstacle' ? '💥' :
             gameOverReason === 'question' ? '❌' : '🎯'}
          </div>

          <p className="pixel-font text-xs sm:text-sm text-gray-700 mb-2">
            {getGameOverMessage()}
          </p>
        </div>

        {/* Score and Progress */}
        <div className="nes-container is-dark mb-3 text-center">
          <div className="pixel-font text-white space-y-1 text-sm sm:text-base">
            <div>📊 Score: {finalScore} • 🪙 Coins: {sessionCoins}</div>
            {gameOverReason === 'completed' && (
              <div className="text-yellow-300 text-xs sm:text-sm mt-1">
                💎 {getStageTokenReward(currentStage)} Tokens + 🏆 {getStageBadgeName(currentStage)}
              </div>
            )}
          </div>
        </div>

        {/* Merged Warning and Save Info */}
        <div className="nes-container mb-3 text-center" style={{ backgroundColor: gameOverReason === 'completed' ? '#28a745' : '#ffc107', border: '3px solid #000' }}>
            <div className="pixel-font text-black text-xs sm:text-sm" style={{ fontWeight: 'bold' }}>
              {gameOverReason === 'completed' ? (
                <div>
                  💰 Save to earn {getStageTokenReward(currentStage)} QuestCoin + {getStageBadgeName(currentStage)} NFT!
                  <div className="mt-1 text-xs">⚠️ Progress not saved yet • Requires wallet signature</div>
                </div>
              ) : (
                <div>
                  ⚠️ Progress NOT saved: {finalScore} points • {sessionCoins} coins
                  <div className="mt-1 text-xs">💰 Save to blockchain or lose progress</div>
                </div>
              )}
            </div>
        </div>

        {/* Transaction Status */}
        {saveSuccess ? (
          <div className="nes-container mb-3 text-center" style={{ backgroundColor: '#28a745', border: '3px solid #155724' }}>
            <div className="pixel-font text-white text-sm sm:text-base" style={{ fontWeight: 'bold' }}>
              ✅ SAVED TO BLOCKCHAIN!
              <div className="mt-1 text-xs">🎉 Progress permanently saved on Hedera!</div>
            </div>
          </div>
        ) : isSavingSession ? (
          <div className="nes-container mb-3 text-center" style={{ backgroundColor: '#007bff', border: '3px solid #0056b3' }}>
            <div className="pixel-font text-white text-sm sm:text-base" style={{ fontWeight: 'bold' }}>
              💾 SAVING... <span className="animate-pulse">⛓️</span>
              <div className="mt-1 text-xs">Please wait for confirmation</div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Primary Save Action */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveProgress}
              className="nes-btn is-success pixel-font flex-1 text-xs sm:text-sm"
              disabled={isSavingSession || saveSuccess}
            >
              {saveSuccess ? '✅ SAVED!' :
               isSavingSession ? '💾 SAVING...' :
               gameOverReason === 'completed' ? '💎 SAVE & EARN' : '💰 SAVE'}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            {gameOverReason === 'completed' && currentStage < 3 ? (
              <>
                <button
                  onClick={handleNextStage}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-sm"
                  disabled={isSavingSession}
                >
                  NEXT STAGE
                </button>
                <button
                  onClick={saveSuccess ? restartGame : handleSkipSave}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-sm"
                  disabled={isSavingSession}
                >
                  {saveSuccess ? 'PLAY AGAIN' : 'REPLAY'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={saveSuccess ? restartGame : handleSkipSave}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-sm"
                  disabled={isSavingSession}
                >
                  {saveSuccess ? 'PLAY AGAIN' : 'TRY AGAIN'}
                </button>
                <button
                  onClick={() => {
                    playSound('button');
                    window.location.reload();
                  }}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-sm"
                  disabled={isSavingSession}
                >
                  MAIN MENU
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}