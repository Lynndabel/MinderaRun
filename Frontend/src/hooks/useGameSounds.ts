import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing game sound effects
 * Handles loading, caching, and playing of audio files
 * Includes volume control and mute functionality
 */

export type SoundType = 
  | 'jump'
  | 'coin'
  | 'obstacle'
  | 'complete'
  | 'quiz'
  | 'start'
  | 'button'
  | 'answerCorrect'
  | 'answerWrong';

interface SoundConfig {
  [key: string]: {
    src: string;
    volume?: number;
  };
}

const SOUND_CONFIG: SoundConfig = {
  jump: { src: '/sounds/mixkit-player-jumping-in-a-video-game-2043.wav', volume: 0.3 },
  coin: { src: '/sounds/mixkit-winning-a-coin-video-game-2069.wav', volume: 0.4 },
  obstacle: { src: '/sounds/mixkit-player-losing-or-failing-2042.wav', volume: 0.5 },
  complete: { src: '/sounds/mixkit-game-level-completed-2059.wav', volume: 0.6 },
  quiz: { src: '/sounds/mixkit-game-bonus-reached-2065.wav', volume: 0.4 },
  start: { src: '/sounds/mixkit-game-experience-level-increased-2062.wav', volume: 0.5 },
  button: { src: '/sounds/mixkit-casino-bling-achievement-2067.wav', volume: 0.2 },
  answerCorrect: { src: '/sounds/mixkit-game-bonus-reached-2065.wav', volume: 0.5 },
  answerWrong: { src: '/sounds/mixkit-player-losing-or-failing-2042.wav', volume: 0.5 },
};

export function useGameSounds() {
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  // Preload all sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const soundEntries = Object.entries(SOUND_CONFIG) as [SoundType, typeof SOUND_CONFIG[string]][];
        
        for (const [key, config] of soundEntries) {
          try {
            const audio = new Audio(config.src);
            audio.volume = (config.volume || 0.5) * masterVolume;
            audio.preload = 'auto';
            
            // Store the audio element
            audioRefs.current.set(key, audio);
          } catch (err) {
            // Silently fail if sound file doesn't exist
            console.warn(`Failed to load sound: ${key}`, err);
          }
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.warn('Error loading sounds:', error);
        setIsLoaded(true); // Still set loaded to true so game continues
      }
    };

    loadSounds();

    // Cleanup on unmount
    return () => {
      audioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current.clear();
    };
  }, []);

  // Update volume when masterVolume changes
  useEffect(() => {
    audioRefs.current.forEach((audio, key) => {
      const config = SOUND_CONFIG[key];
      audio.volume = (config.volume || 0.5) * masterVolume;
    });
  }, [masterVolume]);

  /**
   * Play a sound effect
   * Safe to call even if sound file doesn't exist
   */
  const playSound = (soundType: SoundType) => {
    if (isMuted) return;
    
    try {
      const audio = audioRefs.current.get(soundType);
      
      if (audio) {
        // Reset to start if already playing
        audio.currentTime = 0;
        
        // Play the sound (returns a promise)
        audio.play().catch(err => {
          // Ignore errors (e.g., user hasn't interacted with page yet)
          console.debug(`Sound play prevented: ${soundType}`, err);
        });
      }
    } catch (error) {
      // Silently fail - don't break game if sound fails
      console.debug(`Error playing sound: ${soundType}`, error);
    }
  };

  /**
   * Toggle mute on/off
   */
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  /**
   * Set master volume (0-1)
   */
  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMasterVolume(clampedVolume);
  };

  return {
    playSound,
    toggleMute,
    setVolume,
    isMuted,
    masterVolume,
    isLoaded,
  };
}
