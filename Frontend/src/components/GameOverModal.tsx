'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameSounds } from '@/hooks/useGameSounds';

export function GameOverModal() {
  const { playSound } = useGameSounds();
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
    saveGameSession
  } = useGameStore();

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
      alert('Please connect your wallet first to save progress to blockchain!');
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
    // Progress to next stage
    if (currentStage < 3) {
      setCurrentStage(currentStage + 1);
    }
    restartGame();
  };

  const handleSkipSave = () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: You will lose ALL progress!\n\n' +
      `• Your ${finalScore} points will be lost\n` +
      `• Your ${sessionCoins} coins will be lost\n` +
      `• Stage progress will NOT be saved\n\n` +
      'Are you sure you want to continue without saving to the blockchain?'
    );

    if (confirmed) {
      restartGame();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 pointer-events-auto p-2 sm:p-4">
      <div className="nes-container with-title is-centered pixel-art max-w-lg w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'white', border: '4px solid #000' }}>
        <p className="title pixel-font text-primary text-sm sm:text-base md:text-lg" style={{ fontWeight: 'bold' }}>{getGameOverTitle()}</p>

        {/* Game Over Content */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
            {gameOverReason === 'completed' ? '🏆' :
             gameOverReason === 'obstacle' ? '💥' :
             gameOverReason === 'question' ? '❌' : '🎯'}
          </div>

          <p className="pixel-font text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
            {getGameOverMessage()}
          </p>
        </div>

        {/* Score and Progress */}
        <div className="nes-container is-dark mb-3 sm:mb-4 text-center">
          <div className="pixel-font text-white space-y-1 sm:space-y-2 text-xs sm:text-base">
            <div>📊 Final Score: {finalScore}</div>
            <div>🪙 Coins Collected: {sessionCoins}</div>
            <div>💰 Total Coins: {(player?.inGameCoins || 0) + sessionCoins}</div>
            {gameOverReason === 'completed' && (
              <div className="space-y-1">
                <div className="text-yellow-300">💎 {getStageTokenReward(currentStage)} QuestCoin Tokens Earned!</div>
                <div className="text-blue-300">🏆 {getStageBadgeName(currentStage)} NFT Badge Earned!</div>
              </div>
            )}
          </div>
        </div>

        {/* Warning about unsaved progress */}
        <div className="nes-container is-warning mb-3 sm:mb-4 text-center">
            <div className="pixel-font text-black text-xs sm:text-sm" style={{ fontWeight: 'bold' }}>
              ⚠️ IMPORTANT: Your progress is NOT saved yet!
              <div className="mt-2 text-xs">
                If you don&apos;t save to blockchain, you will lose:
                <div className="mt-1">
                  • {finalScore} points earned • {sessionCoins} coins collected • Stage progress
                </div>
              </div>
            </div>
        </div>

        {/* Blockchain Save Options - Using AGRO Pattern */}
        {saveSuccess ? (
          <div className="nes-container is-success mb-4 text-center" style={{ backgroundColor: '#28a745', border: '4px solid #155724' }}>
            <div className="pixel-font text-white text-lg" style={{ fontWeight: 'bold' }}>
              ✅ SUCCESSFULLY SAVED TO BLOCKCHAIN!
              <div className="mt-2 text-sm text-white">
                🎉 Your progress has been permanently saved on Hedera!
                {gameOverReason === 'completed' && (
                  <div className="mt-1">
                    🏆 {getStageTokenReward(currentStage)} QuestCoin tokens + {getStageBadgeName(currentStage)} NFT earned!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : isSavingSession ? (
          <div className="nes-container is-primary mb-3 sm:mb-4 text-center" style={{ backgroundColor: '#007bff', border: '4px solid #0056b3' }}>
            <div className="pixel-font text-white text-sm sm:text-lg" style={{ fontWeight: 'bold' }}>
              💾 SAVING TO BLOCKCHAIN...
              <div className="mt-3">
                <div className="animate-pulse text-xl">🔗 ⛓️ 🔗</div>
              </div>
              <div className="mt-3 text-sm bg-white text-black p-3 rounded border-2 border-black" style={{ fontWeight: 'bold' }}>
                📱 TRANSACTION IN PROGRESS<br/>
                <div className="mt-1" style={{ fontWeight: 'normal' }}>
                  Your transaction is being processed on the blockchain.<br/>
                  <strong>Please wait for confirmation...</strong>
                </div>
              </div>
              {gameOverReason === 'completed' && (
                <div className="mt-2 text-sm text-white">
                  Minting {getStageTokenReward(currentStage)} QuestCoin tokens + {getStageBadgeName(currentStage)} NFT...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="nes-container is-success mb-3 sm:mb-4 text-center" style={{ backgroundColor: '#28a745', border: '4px solid #155724' }}>
            <div className="pixel-font text-white text-sm sm:text-lg" style={{ fontWeight: 'bold' }}>
              {gameOverReason === 'completed' ? (
                <div>
                  💰 Save to earn {getStageTokenReward(currentStage)} QuestCoin tokens + {getStageBadgeName(currentStage)} NFT!
                  <div className="mt-1">
                    <div className="text-sm text-white">🔗 Requires wallet signature • HTS tokens will be minted</div>
                  </div>
                </div>
              ) : (
                <div>
                  💰 Save your progress and coins on Hedera blockchain!
                  <div className="mt-2">
                    <div className="text-sm text-white">🔗 Requires wallet signature</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Save Action */}
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => { playSound('button'); handleSaveProgress(); }}
              className="nes-btn is-success pixel-font flex-1 text-xs sm:text-base"
              disabled={isSavingSession || saveSuccess}
            >
              {saveSuccess ? '✅ SAVED!' :
               isSavingSession ? '💾 SAVING...' :
               gameOverReason === 'completed' ? '💎 SAVE & EARN TOKENS' : '💰 SAVE PROGRESS'}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex space-x-2 sm:space-x-3">
            {gameOverReason === 'completed' && currentStage < 3 ? (
              <>
                <button
                  onClick={() => { playSound('button'); handleNextStage(); }}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-base"
                  disabled={isSavingSession}
                >
                  SKIP TO NEXT
                </button>
                <button
                  onClick={() => { playSound('button'); saveSuccess ? restartGame() : handleSkipSave(); }}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-base"
                  disabled={isSavingSession}
                >
                  {saveSuccess ? 'PLAY AGAIN' : 'REPLAY STAGE'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { playSound('button'); saveSuccess ? restartGame() : handleSkipSave(); }}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-base"
                  disabled={isSavingSession}
                >
                  {saveSuccess ? 'PLAY AGAIN' : 'TRY AGAIN'}
                </button>
                <button
                  onClick={() => {
                    playSound('button');
                    if (saveSuccess) {
                      window.location.reload();
                    } else {
                      const confirmed = window.confirm(
                        '⚠️ WARNING: You will lose ALL progress!\n\n' +
                        `• Your ${finalScore} points will be lost\n` +
                        `• Your ${sessionCoins} coins will be lost\n` +
                        `• Stage progress will NOT be saved\n\n` +
                        'Are you sure you want to go to main menu without saving?'
                      );

                      if (confirmed) {
                        window.location.reload();
                      }
                    }
                  }}
                  className="nes-btn pixel-font flex-1 text-xs sm:text-base"
                  disabled={isSavingSession}
                >
                  MAIN MENU
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Note */}
        <div className="mt-4 text-center">
          <p className="pixel-font text-xs text-gray-600">
            {isSavingSession ?
              '⛓️ Saving to Hedera blockchain...' :
              '💡 Choose to save progress on blockchain or continue playing locally'
            }
          </p>
        </div>
      </div>
    </div>
  );
}