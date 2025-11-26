'use client';

import { useState, useEffect } from 'react';
import { SimpleGameCanvas } from '@/components/SimpleGameCanvas';
import { NewWalletConnection } from '@/components/NewWalletConnection';
import { GameUI } from '@/components/GameUI';
import { Leaderboard } from '@/components/Leaderboard';
import { QuizModal } from '@/components/QuizModal';
import { GameOverModal } from '@/components/GameOverModal';
import { PixelBackground } from '@/components/PixelBackground';
import { ContractManager } from '@/components/ContractManager';
import { GameNotification } from '@/components/GameNotification';
import { useGameStore } from '@/store/gameStore';
import { useGameSounds } from '@/hooks/useGameSounds';
import { Volume2, VolumeX } from 'lucide-react';

export default function Home() {
  const { isConnected, player, notification, hideNotification } = useGameStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { startBackgroundMusic, stopBackgroundMusic, toggleAllAudio, isAudioEnabled } = useGameSounds();

  // Start background music when component mounts
  useEffect(() => {
    // Delay to allow user interaction (browsers block autoplay)
    const timer = setTimeout(() => {
      startBackgroundMusic();
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopBackgroundMusic();
    };
  }, [startBackgroundMusic, stopBackgroundMusic]);

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Contract Manager - handles contract callbacks */}
      <ContractManager />

      {/* Audio Control */}
      <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50">
        <button
          onClick={toggleAllAudio}
          className="nes-btn is-primary p-2 sm:p-3"
          title={isAudioEnabled ? 'Mute All Audio' : 'Unmute All Audio'}
        >
          {isAudioEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
        </button>
      </div>

      {/* Pixel Art Background */}
      <PixelBackground />

      <main className="relative w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto my-4 sm:my-8">
        {!isConnected || !player?.isRegistered ? (
          <>
            <NewWalletConnection />
          <div className="nes-container with-title is-centered pixel-art relative z-10 max-w-[90%] sm:max-w-md mx-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <p className="title pixel-font text-primary text-sm sm:text-base">MINDORA RUNNER</p>
            <h1 className="pixel-font text-base sm:text-xl mb-4 sm:mb-6 text-gray-800 text-center">
              Run • Learn • Earn
            </h1>

            <div className="text-center mb-4 sm:mb-6">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏃‍♂️</div>
              <p className="pixel-font text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                Jump obstacles, answer questions,<br/>
                earn tokens & NFTs on Hedera!
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-600 mb-3 sm:mb-4">
                {!isConnected ? 'Connect wallet to start' : 'Complete registration to play'}
              </p>
            </div>
          </div>
          </>
        ) : (
          <div className="relative w-full">
            <SimpleGameCanvas />
            <GameUI />
          </div>
        )}
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="nes-container with-title is-centered pixel-art w-full max-w-2xl relative" style={{ backgroundColor: 'white' }}>
            <p className="title pixel-font text-primary">LEADERBOARD</p>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="nes-btn is-error absolute top-4 right-4 text-sm"
            >
              ✕
            </button>
            <Leaderboard />
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal />

      {/* Game Over Modal */}
      <GameOverModal />

      {/* Game Notifications */}
      <GameNotification 
        notification={notification} 
        onClose={hideNotification} 
      />
    </div>
  );
}