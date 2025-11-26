  'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { questions } from '@/data/questions';
import { useGameSounds } from '../hooks/useGameSounds';

export function SimpleGameCanvas() {
  const { playSound } = useGameSounds();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const collisionUpdatesRef = useRef<{coins: number, score: number}>({coins: 0, score: 0});
  const gameEndRef = useRef<{shouldEnd: boolean, finalScore: number, stageCompleted: boolean}>({shouldEnd: false, finalScore: 0, stageCompleted: false});
  // Physics tuning (easier jump)
  const gravityRef = useRef(0.8);
  const jumpImpulseRef = useRef(-18);
  const terminalVelocityRef = useRef(20);
  const jumpCooldownMsRef = useRef(140);
  const coyoteTimeMsRef = useRef(150);
  const jumpBufferMsRef = useRef(120);
  const lastJumpTimeRef = useRef(0);
  const lastGroundedTimeRef = useRef(0);
  const lastJumpPressTimeRef = useRef(0);
  const isJumpHeldRef = useRef(false);
  const [gameState, setGameState] = useState({
    playerX: 100,
    playerY: 350,  // Fixed: player standing on visible grass surface
    playerVelocityY: 0,
    coins: [] as Array<{ x: number; y: number; id: number; collected: boolean }>,
    obstacles: [] as Array<{ x: number; y: number; id: number; type: 'spike' | 'pit' | 'block' }>,
    knowledgeWalls: [] as Array<{ x: number; y: number; id: number; question: string; answered: boolean }>,
    stageProgress: 0,
    isJumping: false,
    gameSpeed: 2,
    isGrounded: true,
    gameTime: 0,
    stageLength: 2000, // Distance to complete stage
    currentCheckpoint: 0
  });

  const {
    score,
    updateScore,
    updateSessionCoins,
    setShowQuiz,
    setCurrentQuestion,
    currentStage,
    isPlaying,
    setPlaying,
    saveGameSession,
    setCurrentStage,
    isSavingSession,
    setGameOver,
    sessionCoins,
    isGameOver,
    walletAddress
  } = useGameStore();

  // Helper functions for drawing background elements
  const drawMountain = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();
  };

  const drawHill = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y, width / 2, height, 0, 0, Math.PI);
    ctx.fill();
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Cloud main body
    ctx.beginPath();
    ctx.arc(x + 25, y + 15, 15, 0, Math.PI * 2);
    ctx.arc(x + 45, y + 15, 20, 0, Math.PI * 2);
    ctx.arc(x + 65, y + 15, 15, 0, Math.PI * 2);
    ctx.arc(x + 35, y, 12, 0, Math.PI * 2);
    ctx.arc(x + 55, y, 12, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFlower = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Flower center
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Petals
    const currentColor = ctx.fillStyle;
    ctx.fillStyle = '#FFFF88';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * 5;
      const py = y + Math.sin(angle) * 5;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = currentColor;
  };

  // Stage completion handler with new coin system
  const handleGameEnd = (finalScore: number, stageCompleted: boolean) => {
    setPlaying(false);

    // Show game over modal - user will choose whether to save to blockchain
    const reason = stageCompleted ? 'completed' : 'obstacle';
    setGameOver(reason, finalScore, sessionCoins);

    // No automatic blockchain saving - user will decide in the modal
  };

  // Initialize stage based on current stage
  const initializeStage = (stage: number) => {
    const stageData = {
      1: {
        coins: Array.from({ length: 40 }, (_, i) => ({
          x: 200 + i * 100,
          y: 300 + Math.sin(i * 0.5) * 20,
          id: i,
          collected: false
        })),
        obstacles: [
          { x: 400, y: 390, id: 1, type: 'spike' as const },
          { x: 650, y: 390, id: 2, type: 'pit' as const },
          { x: 900, y: 390, id: 3, type: 'block' as const },
          { x: 1200, y: 390, id: 4, type: 'spike' as const },
          { x: 1500, y: 390, id: 5, type: 'pit' as const },
          { x: 1800, y: 390, id: 6, type: 'block' as const },
          { x: 2100, y: 390, id: 7, type: 'spike' as const },
          { x: 2400, y: 390, id: 8, type: 'pit' as const },
          { x: 2700, y: 390, id: 9, type: 'block' as const },
          { x: 3000, y: 390, id: 10, type: 'spike' as const }
        ],
        knowledgeWalls: [
          { x: 2000, y: 100, id: 1, question: "What is HBAR used for?", answered: false },
          { x: 3500, y: 100, id: 2, question: "What is Hedera Hashgraph?", answered: false }
        ],
        speed: 2,
        length: 4000
      },
      2: {
        coins: Array.from({ length: 60 }, (_, i) => ({
          x: 200 + i * 80,
          y: 280 + Math.sin(i * 0.3) * 25,
          id: i,
          collected: false
        })),
        obstacles: [
          { x: 300, y: 390, id: 1, type: 'spike' as const },
          { x: 500, y: 390, id: 2, type: 'pit' as const },
          { x: 700, y: 390, id: 3, type: 'block' as const },
          { x: 900, y: 390, id: 4, type: 'spike' as const },
          { x: 1100, y: 390, id: 5, type: 'pit' as const },
          { x: 1300, y: 390, id: 6, type: 'block' as const },
          { x: 1500, y: 390, id: 7, type: 'spike' as const },
          { x: 1750, y: 390, id: 8, type: 'pit' as const },
          { x: 2000, y: 390, id: 9, type: 'block' as const },
          { x: 2250, y: 390, id: 10, type: 'spike' as const },
          { x: 2500, y: 390, id: 11, type: 'pit' as const },
          { x: 2750, y: 390, id: 12, type: 'block' as const },
          { x: 3000, y: 390, id: 13, type: 'spike' as const },
          { x: 3250, y: 390, id: 14, type: 'pit' as const },
          { x: 3500, y: 390, id: 15, type: 'block' as const },
          { x: 3750, y: 390, id: 16, type: 'spike' as const },
          { x: 4000, y: 390, id: 17, type: 'pit' as const }
        ],
        knowledgeWalls: [
          { x: 2500, y: 100, id: 1, question: "What is a smart contract?", answered: false },
          { x: 4500, y: 100, id: 2, question: "What is Hedera's consensus mechanism?", answered: false },
          { x: 6000, y: 100, id: 3, question: "What is HTS?", answered: false }
        ],
        speed: 3,
        length: 6500
      },
      3: {
        coins: Array.from({ length: 100 }, (_, i) => ({
          x: 200 + i * 90,
          y: 260 + Math.sin(i * 0.2) * 35,
          id: i,
          collected: false
        })),
        obstacles: [
          // Wave 1: Early obstacles (easier spacing)
          { x: 300, y: 390, id: 1, type: 'spike' as const },
          { x: 500, y: 390, id: 2, type: 'pit' as const },
          { x: 700, y: 390, id: 3, type: 'block' as const },
          { x: 900, y: 390, id: 4, type: 'spike' as const },

          // Wave 2: Medium difficulty (tighter spacing)
          { x: 1100, y: 390, id: 5, type: 'pit' as const },
          { x: 1250, y: 390, id: 6, type: 'block' as const },
          { x: 1400, y: 390, id: 7, type: 'spike' as const },
          { x: 1550, y: 390, id: 8, type: 'pit' as const },
          { x: 1700, y: 390, id: 9, type: 'block' as const },

          // Wave 3: High difficulty (very tight spacing)
          { x: 1850, y: 390, id: 10, type: 'spike' as const },
          { x: 1970, y: 390, id: 11, type: 'pit' as const },
          { x: 2090, y: 390, id: 12, type: 'block' as const },
          { x: 2210, y: 390, id: 13, type: 'spike' as const },
          { x: 2330, y: 390, id: 14, type: 'pit' as const },
          { x: 2450, y: 390, id: 15, type: 'block' as const },

          // Wave 4: Extreme section (very close obstacles)
          { x: 2600, y: 390, id: 16, type: 'spike' as const },
          { x: 2700, y: 390, id: 17, type: 'pit' as const },
          { x: 2800, y: 390, id: 18, type: 'block' as const },
          { x: 2900, y: 390, id: 19, type: 'spike' as const },
          { x: 3000, y: 390, id: 20, type: 'pit' as const },
          { x: 3100, y: 390, id: 21, type: 'block' as const },

          // Wave 5: Final gauntlet (breathing room but still challenging)
          { x: 3300, y: 390, id: 22, type: 'spike' as const },
          { x: 3500, y: 390, id: 23, type: 'pit' as const },
          { x: 3700, y: 390, id: 24, type: 'block' as const },
          { x: 3900, y: 390, id: 25, type: 'spike' as const },
          { x: 4100, y: 390, id: 26, type: 'pit' as const },

          // Wave 6: Long range obstacles
          { x: 4400, y: 390, id: 27, type: 'block' as const },
          { x: 4700, y: 390, id: 28, type: 'spike' as const },
          { x: 5000, y: 390, id: 29, type: 'pit' as const },
          { x: 5300, y: 390, id: 30, type: 'block' as const },
          { x: 5600, y: 390, id: 31, type: 'spike' as const },

          // Wave 7: Final challenge before knowledge walls
          { x: 5900, y: 390, id: 32, type: 'pit' as const },
          { x: 6100, y: 390, id: 33, type: 'block' as const },
          { x: 6300, y: 390, id: 34, type: 'spike' as const },
          { x: 6500, y: 390, id: 35, type: 'pit' as const },
          { x: 6700, y: 390, id: 36, type: 'block' as const },

          // Final obstacles before end
          { x: 7200, y: 390, id: 37, type: 'spike' as const },
          { x: 7500, y: 390, id: 38, type: 'pit' as const },
          { x: 7800, y: 390, id: 39, type: 'block' as const },
          { x: 8100, y: 390, id: 40, type: 'spike' as const }
        ],
        knowledgeWalls: [
          { x: 3000, y: 100, id: 1, question: "What is HTS?", answered: false },
          { x: 5500, y: 100, id: 2, question: "What is HCS?", answered: false },
          { x: 7000, y: 100, id: 3, question: "What is Hedera's gas fee?", answered: false },
          { x: 8500, y: 100, id: 4, question: "What makes Hashgraph unique?", answered: false }
        ],
        speed: 4,
        length: 9000
      }
    };

    return stageData[stage as keyof typeof stageData] || stageData[1];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize stage
    const stageData = initializeStage(currentStage);
    setGameState(prev => ({
      ...prev,
      coins: stageData.coins,
      obstacles: stageData.obstacles,
      knowledgeWalls: stageData.knowledgeWalls,
      gameSpeed: stageData.speed,
      stageLength: stageData.length,
      stageProgress: 0,
      currentCheckpoint: 0
    }));

    // Initial render function - shows game even when not playing
    const initialRender = () => {
      if (!ctx) return;

      // Disable image smoothing for pixel art
      ctx.imageSmoothingEnabled = false;

      // Clear canvas with beautiful sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(0.6, '#B0E0E6');
      skyGradient.addColorStop(1, '#98FB98');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, 800, 400);

      // Static background elements for preview
      // Distant mountains
      ctx.fillStyle = '#9370DB';
      drawMountain(ctx, 100, 300, 150, 80);
      drawMountain(ctx, 300, 300, 150, 80);
      drawMountain(ctx, 500, 300, 150, 80);

      // Hills
      ctx.fillStyle = '#32CD32';
      drawHill(ctx, 50, 350, 120, 60);
      drawHill(ctx, 200, 350, 120, 60);
      drawHill(ctx, 350, 350, 120, 60);
      drawHill(ctx, 500, 350, 120, 60);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      drawCloud(ctx, 100, 50);
      drawCloud(ctx, 350, 80);
      drawCloud(ctx, 600, 60);

      // Ground with beautiful grass - moved up to match game ground level
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 400, 800, 200);

      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, 400, 800, 25);

      ctx.fillStyle = '#32CD32';
      ctx.fillRect(0, 400, 800, 15);

      // Grass details
      ctx.fillStyle = '#90EE90';
      for (let i = 0; i < 40; i++) {
        const x = i * 20;
        ctx.fillRect(x, 395, 3, 10);
        ctx.fillRect(x + 10, 398, 2, 7);
      }

      // Ground flowers
      const flowerColors = ['#FFB6C1', '#FFD700', '#FF69B4', '#DDA0DD'];
      for (let i = 0; i < 15; i++) {
        const x = i * 50;
        ctx.fillStyle = flowerColors[i % flowerColors.length];
        drawFlower(ctx, x, 390);
      }

      // Draw a few coins for visual preview
      const previewCoins = [300, 400, 500];
      previewCoins.forEach(x => {
        ctx.save();
        ctx.translate(x, 350);

        let coinColor, glowColor;

        if (currentStage === 1) {
          // Stage 1: Golden coins
          coinColor = '#FFD700';
          glowColor = 'rgba(255, 215, 0, 0.8)';
        } else if (currentStage === 2) {
          // Stage 2: Bright silver coins
          coinColor = '#C0C0C0';
          glowColor = 'rgba(255, 255, 255, 0.9)';
        } else {
          // Stage 3: Bright cyan coins
          coinColor = '#00FFFF';
          glowColor = 'rgba(0, 255, 255, 0.8)';
        }

        // Coin glow
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        glowGradient.addColorStop(0, glowColor);
        glowGradient.addColorStop(1, glowColor.replace(/[^,]+\)/, '0)'));
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        // Coin body
        ctx.fillStyle = coinColor;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Coin shine
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-3, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw pixel art player at initial position
      ctx.save();
      ctx.translate(100, 350);  // Fixed: positioned on grass surface

      // Disable image smoothing for pixel art
      ctx.imageSmoothingEnabled = false;

      // Player body (red overalls like Mario-style)
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(0, 0, 30, 30);

      // Player head (skin tone)
      ctx.fillStyle = '#FFDBAC';
      ctx.fillRect(3, -18, 24, 18);

      // Hat (red cap)
      ctx.fillStyle = '#DC143C';
      ctx.fillRect(0, -21, 30, 15);

      // Hat visor
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(-3, -12, 12, 6);

      // Eyes (black pixels)
      ctx.fillStyle = '#000';
      ctx.fillRect(9, -12, 3, 3);
      ctx.fillRect(18, -12, 3, 3);

      // Nose (small pink pixel)
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(15, -9, 3, 3);

      // Mustache (brown pixels)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(12, -6, 9, 3);

      // Legs (blue pants)
      ctx.fillStyle = '#4169E1';
      ctx.fillRect(6, 30, 6, 18);
      ctx.fillRect(18, 30, 6, 18);

      // Shoes (brown)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(3, 48, 12, 6);
      ctx.fillRect(15, 48, 12, 6);

      // Arms (skin tone)
      ctx.fillStyle = '#FFDBAC';
      ctx.fillRect(-6, 6, 6, 15);
      ctx.fillRect(30, 6, 6, 15);

      // Gloves (white)
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-9, 18, 9, 6);
      ctx.fillRect(30, 18, 9, 6);

      ctx.restore();
    };

    // Single game loop that handles both updates and rendering
    const gameLoop = () => {
      if (!ctx || !isPlaying || isGameOver) return;

      // Update game state and render in one go
      setGameState(prev => {
        const newState = { ...prev };

        // Apply gravity and clamp velocity (variable jump: lighter gravity while rising and holding jump)
        const gravityMultiplier = (isJumpHeldRef.current && newState.playerVelocityY < 0) ? 0.6 : 1;
        newState.playerVelocityY += gravityRef.current * gravityMultiplier;
        if (newState.playerVelocityY > terminalVelocityRef.current) {
          newState.playerVelocityY = terminalVelocityRef.current;
        }
        newState.playerY += newState.playerVelocityY;

        // Ground collision - fix ground level to match visible grass surface
        if (newState.playerY >= 350) {
          newState.playerY = 350;
          newState.playerVelocityY = 0;
          newState.isJumping = false;
          newState.isGrounded = true;
          lastGroundedTimeRef.current = performance.now();
          // If a buffered jump exists, consume it now
          const now = performance.now();
          const bufferActive = (now - lastJumpPressTimeRef.current) <= jumpBufferMsRef.current;
          const cooldownReady = (now - lastJumpTimeRef.current) >= jumpCooldownMsRef.current;
          if (bufferActive && cooldownReady) {
            lastJumpTimeRef.current = now;
            newState.playerVelocityY = jumpImpulseRef.current;
            newState.isJumping = true;
            newState.isGrounded = false;
          }
        } else {
          newState.isGrounded = false;
        }

        // Move all objects (this creates the running effect)
        newState.coins = newState.coins.map(coin => ({
          ...coin,
          x: coin.x - newState.gameSpeed,
          y: coin.y + Math.sin(coin.x * 0.01) * 0.5
        })).filter(coin => coin.x > -50);

        newState.obstacles = newState.obstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - newState.gameSpeed
        })).filter(obstacle => obstacle.x > -50);

        newState.knowledgeWalls = newState.knowledgeWalls.map(wall => ({
          ...wall,
          x: wall.x - newState.gameSpeed
        })).filter(wall => wall.x > -100);

        // Update stage progress
        newState.stageProgress += newState.gameSpeed;
        newState.gameTime += 1;

        // Draw frame with new state
        drawFrame(newState);

        // Check collisions with new state
        checkCollisions(newState);

        return newState;
      });

      // Continue game loop
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    // Collision detection function
    const checkCollisions = (state: typeof gameState) => {
      // Check coin collisions
      state.coins.forEach(coin => {
        if (!coin.collected &&
            Math.abs(coin.x - state.playerX) < 25 &&
            Math.abs(coin.y - state.playerY) < 25) {
          coin.collected = true;
          updateSessionCoins(1);
          updateScore(10);
          playSound('coin'); // 🔊 Coin collection sound
          console.log('🪙 Coin collected! New score should be:', score + 10);
        }
      });

      // Check obstacle collisions
      state.obstacles.forEach(obstacle => {
        let collision = false;

        if (obstacle.type === 'spike' || obstacle.type === 'pit') {
          collision = (
            Math.abs(obstacle.x - state.playerX) < 30 &&
            state.playerY > obstacle.y - 50
          );
        } else if (obstacle.type === 'block') {
          collision = (
            Math.abs(obstacle.x - state.playerX) < 25 &&
            state.playerY < obstacle.y &&
            state.playerY + 50 > obstacle.y - 50
          );
        }

        if (collision) {
          console.log('💥 Collision! Score values:', {
            gameStoreScore: score,
            gameStoreSessionCoins: sessionCoins,
            collision: true
          });
          playSound('obstacle'); // 🔊 Obstacle collision sound
          setPlaying(false);
          // Use the current score from the store
          const currentStore = useGameStore.getState();
          setGameOver('obstacle', currentStore.score, currentStore.sessionCoins);
        }
      });

      // Check knowledge wall collisions
      state.knowledgeWalls.forEach(wall => {
        if (!wall.answered &&
            Math.abs(wall.x - state.playerX) < 50 &&
            state.playerY > wall.y && state.playerY < wall.y + 300) {
          // Seeded randomness per user and wall for fairness and anti-memorization
          const seedBase = `${walletAddress || 'guest'}-${currentStage}-${wall.id}`;
          let hash = 0;
          for (let i = 0; i < seedBase.length; i++) {
            hash = (hash * 31 + seedBase.charCodeAt(i)) >>> 0;
          }
          const qIndex = hash % questions.length;
          const q = questions[qIndex];

          playSound('quiz'); // 🔊 Knowledge wall sound
          setCurrentQuestion({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 50,
            timeLimit: 30
          });
          setShowQuiz(true);
          setPlaying(false);

          // Mark wall as answered to prevent multiple triggers
          wall.answered = true;
        }
      });

      // Check stage completion
      if (state.stageProgress >= state.stageLength) {
        console.log('🎉 Stage completed! Score values:', {
          gameStoreScore: score,
          gameStoreSessionCoins: sessionCoins,
          completed: true
        });
        playSound('complete'); // 🔊 Stage completion sound
        setPlaying(false);
        // Use the current score from the store
        const currentStore = useGameStore.getState();
        setGameOver('completed', currentStore.score, currentStore.sessionCoins);
      }
    };

    // Draw function that uses current state
    const drawFrame = (state: typeof gameState) => {
      if (!ctx) return;

      // Disable image smoothing for pixel art
      ctx.imageSmoothingEnabled = false;

      // Different backgrounds for each stage
      const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);

      if (currentStage === 1) {
        // Stage 1: Morning meadow theme
        skyGradient.addColorStop(0, '#87CEEB');  // Sky blue
        skyGradient.addColorStop(0.6, '#B0E0E6'); // Light steel blue
        skyGradient.addColorStop(1, '#98FB98');   // Pale green
      } else if (currentStage === 2) {
        // Stage 2: Sunset/dusk theme
        skyGradient.addColorStop(0, '#FF6B35');   // Orange red
        skyGradient.addColorStop(0.4, '#F7931E');  // Orange
        skyGradient.addColorStop(0.8, '#FFD23F');  // Golden yellow
        skyGradient.addColorStop(1, '#FFA500');    // Orange ground
      } else if (currentStage === 3) {
        // Stage 3: Night/twilight theme
        skyGradient.addColorStop(0, '#191970');   // Midnight blue
        skyGradient.addColorStop(0.3, '#483D8B');  // Dark slate blue
        skyGradient.addColorStop(0.7, '#6A5ACD');  // Slate blue
        skyGradient.addColorStop(1, '#2F4F4F');    // Dark slate gray
      }

      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, 800, 400);

      // Parallax background layers
      const scroll = state.stageProgress * 0.1;

      // Distant mountains/hills (slowest parallax) - different colors per stage
      if (currentStage === 1) {
        ctx.fillStyle = '#9370DB'; // Purple mountains (morning)
      } else if (currentStage === 2) {
        ctx.fillStyle = '#8B0000'; // Dark red mountains (sunset)
      } else {
        ctx.fillStyle = '#2F2F2F'; // Dark gray mountains (night)
      }

      for (let i = 0; i < 5; i++) {
        const x = (i * 200 - scroll * 0.2) % 1000;
        drawMountain(ctx, x, 300, 150, 80);
      }

      // Middle layer hills (medium parallax) - different colors per stage
      if (currentStage === 1) {
        ctx.fillStyle = '#32CD32'; // Lime green hills (morning)
      } else if (currentStage === 2) {
        ctx.fillStyle = '#DAA520'; // Golden rod hills (sunset)
      } else {
        ctx.fillStyle = '#1C1C1C'; // Very dark hills (night)
      }

      for (let i = 0; i < 6; i++) {
        const x = (i * 150 - scroll * 0.5) % 900;
        drawHill(ctx, x, 350, 120, 60);
      }

      // Floating clouds/particles (medium-slow parallax) - different per stage
      for (let i = 0; i < 4; i++) {
        const x = (i * 250 - scroll * 0.3) % 1050;
        const y = 50 + Math.sin(state.gameTime * 0.01 + i) * 20;

        if (currentStage === 1) {
          // Stage 1: White clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          drawCloud(ctx, x, y);
        } else if (currentStage === 2) {
          // Stage 2: Orange/yellow clouds (sunset)
          ctx.fillStyle = 'rgba(255, 200, 100, 0.7)';
          drawCloud(ctx, x, y);
        } else {
          // Stage 3: Dark purple clouds (night)
          ctx.fillStyle = 'rgba(75, 0, 130, 0.6)';
          drawCloud(ctx, x, y);
        }
      }

      // Flying particles (faster parallax) - different per stage
      for (let i = 0; i < 8; i++) {
        const x = (i * 100 - scroll * 0.8) % 900;
        const y = 200 + Math.sin(state.gameTime * 0.02 + i) * 50;

        if (currentStage === 1) {
          // Stage 1: Colorful flowers/petals
          const colors = ['#FFB6C1', '#FFD700', '#FF69B4', '#DDA0DD'];
          ctx.fillStyle = colors[i % colors.length];
        } else if (currentStage === 2) {
          // Stage 2: Golden leaves/embers
          const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'];
          ctx.fillStyle = colors[i % colors.length];
        } else {
          // Stage 3: Stars/sparkles
          const colors = ['#FFFFFF', '#FFD700', '#C0C0C0', '#87CEEB'];
          ctx.fillStyle = colors[i % colors.length];
        }

        if (currentStage === 3) {
          // Make stars twinkle
          const twinkle = Math.sin(state.gameTime * 0.05 + i) > 0 ? 12 : 6;
          ctx.fillRect(x, y, twinkle, twinkle);
        } else {
          ctx.fillRect(x, y, 8, 8);
        }
      }

      // Draw ground with beautiful grass pattern - moved up to fix collision
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 400, 800, 200);

      // Multiple grass layers for depth
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, 400, 800, 25);

      ctx.fillStyle = '#32CD32';
      ctx.fillRect(0, 400, 800, 15);

      // Grass details
      ctx.fillStyle = '#90EE90';
      for (let i = 0; i < 40; i++) {
        const x = (i * 20 - scroll) % 800;
        ctx.fillRect(x, 395, 3, 10);
        ctx.fillRect(x + 10, 398, 2, 7);
      }

      // Ground flowers
      const flowerColors = ['#FFB6C1', '#FFD700', '#FF69B4', '#DDA0DD'];
      for (let i = 0; i < 15; i++) {
        const x = (i * 50 - scroll * 1.2) % 850;
        ctx.fillStyle = flowerColors[i % flowerColors.length];
        drawFlower(ctx, x, 390);
      }

      // Draw pixel art player (like the mockup character)
      ctx.save();
      ctx.translate(state.playerX, state.playerY);

      // Disable image smoothing for pixel art
      ctx.imageSmoothingEnabled = false;

      // Player body (red overalls like Mario-style)
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(0, 0, 30, 30);

      // Player head (skin tone)
      ctx.fillStyle = '#FFDBAC';
      ctx.fillRect(3, -18, 24, 18);

      // Hat (red cap)
      ctx.fillStyle = '#DC143C';
      ctx.fillRect(0, -21, 30, 15);

      // Hat visor
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(-3, -12, 12, 6);

      // Eyes (black pixels)
      ctx.fillStyle = '#000';
      ctx.fillRect(9, -12, 3, 3);
      ctx.fillRect(18, -12, 3, 3);

      // Nose (small pink pixel)
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(15, -9, 3, 3);

      // Mustache (brown pixels)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(12, -6, 9, 3);

      // Legs (blue pants)
      ctx.fillStyle = '#4169E1';
      ctx.fillRect(6, 30, 6, 18);
      ctx.fillRect(18, 30, 6, 18);

      // Shoes (brown)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(3, 48, 12, 6);
      ctx.fillRect(15, 48, 12, 6);

      // Running animation - arms
      const armOffset = Math.sin(state.gameTime * 0.3) * 3;
      ctx.fillStyle = '#FFDBAC';
      // Left arm
      ctx.fillRect(-6, 6 + armOffset, 6, 15);
      // Right arm
      ctx.fillRect(30, 6 - armOffset, 6, 15);

      // Gloves (white)
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-9, 18 + armOffset, 9, 6);
      ctx.fillRect(30, 18 - armOffset, 9, 6);

      ctx.restore();

      // Draw coins - different colors per stage
      state.coins.forEach(coin => {
        if (!coin.collected) {
          ctx.save();
          ctx.translate(coin.x, coin.y);

          let coinColor, glowColor;

          if (currentStage === 1) {
            // Stage 1: Golden coins (original)
            coinColor = '#FFD700';
            glowColor = 'rgba(255, 215, 0, 0.8)';
          } else if (currentStage === 2) {
            // Stage 2: Bright silver coins (visible against sunset)
            coinColor = '#C0C0C0';
            glowColor = 'rgba(255, 255, 255, 0.9)';
          } else {
            // Stage 3: Bright cyan coins (visible against night)
            coinColor = '#00FFFF';
            glowColor = 'rgba(0, 255, 255, 0.8)';
          }

          // Coin glow
          const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
          glowGradient.addColorStop(0, glowColor);
          glowGradient.addColorStop(1, glowColor.replace(/[^,]+\)/, '0)'));
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();

          // Coin body
          ctx.fillStyle = coinColor;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          // Coin shine
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(-3, -3, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // Draw obstacles positioned correctly on ground
      state.obstacles.forEach(obstacle => {
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);

        switch (obstacle.type) {
          case 'spike':
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(0, 0);     // tip of spike at obstacle.y
            ctx.lineTo(20, 50);   // base of spike below
            ctx.lineTo(-20, 50);
            ctx.closePath();
            ctx.fill();
            break;
          case 'pit':
            ctx.fillStyle = '#000';
            ctx.fillRect(-30, 0, 60, 50);  // pit starts at obstacle.y
            break;
          case 'block':
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-25, -50, 50, 50); // block sits ON the ground (above obstacle.y)
            break;
        }

        ctx.restore();
      });

      // Draw knowledge walls
      state.knowledgeWalls.forEach(wall => {
        if (!wall.answered) {
          ctx.save();
          ctx.translate(wall.x, wall.y);

          // Wall background
          const wallGradient = ctx.createLinearGradient(0, 0, 100, 0);
          wallGradient.addColorStop(0, '#9B59B6');
          wallGradient.addColorStop(1, '#8E44AD');
          ctx.fillStyle = wallGradient;
          ctx.fillRect(0, 0, 100, 300);

          // Wall border
          ctx.strokeStyle = '#6C3483';
          ctx.lineWidth = 3;
          ctx.strokeRect(0, 0, 100, 300);

          // Question mark
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('?', 50, 150);

          // Question text
          ctx.font = 'bold 12px Arial';
          ctx.fillText('KNOWLEDGE', 50, 180);
          ctx.fillText('WALL', 50, 200);

          ctx.restore();
        }
      });
    };

    // Always show initial render
    initialRender();

    if (isPlaying) {
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStage, updateScore, updateSessionCoins, setShowQuiz, setCurrentQuestion, setPlaying]);

  // Apply accumulated collision updates
  useEffect(() => {
    const applyUpdates = () => {
      const updates = collisionUpdatesRef.current;
      if (updates.coins > 0 || updates.score > 0) {
        if (updates.coins > 0) {
          updateSessionCoins(updates.coins);
          updates.coins = 0;
        }
        if (updates.score > 0) {
          updateScore(updates.score);
          updates.score = 0;
        }
      }
    };

    const interval = setInterval(applyUpdates, 100); // Apply updates every 100ms
    return () => clearInterval(interval);
  }, [updateSessionCoins, updateScore]);

  // Handle game end processing
  useEffect(() => {
    const handleEndProcessing = () => {
      const gameEnd = gameEndRef.current;
      if (gameEnd.shouldEnd) {
        handleGameEnd(gameEnd.finalScore, gameEnd.stageCompleted);
        gameEndRef.current = {shouldEnd: false, finalScore: 0, stageCompleted: false};
      }
    };

    const interval = setInterval(handleEndProcessing, 50); // Check every 50ms
    return () => clearInterval(interval);
  }, [handleGameEnd]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !isPlaying) return;
      e.preventDefault();
      isJumpHeldRef.current = true;
      const now = performance.now();
      lastJumpPressTimeRef.current = now; // buffer the press

      const canJumpByCooldown = now - lastJumpTimeRef.current >= jumpCooldownMsRef.current;
      const recentlyGrounded = now - lastGroundedTimeRef.current <= coyoteTimeMsRef.current;

      if ((gameState.isGrounded || recentlyGrounded) && canJumpByCooldown) {
        lastJumpTimeRef.current = now;
        playSound('jump'); // 🔊 Jump sound
        setGameState(prev => ({
          ...prev,
          playerVelocityY: jumpImpulseRef.current,
          isJumping: true,
          isGrounded: false
        }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      isJumpHeldRef.current = false;
      // Short hop: cut upward velocity when released early
      setGameState(prev => {
        if (prev.playerVelocityY < -6) {
          return { ...prev, playerVelocityY: -6 };
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isGrounded, isPlaying, playSound]);

  // Touch/Click controls for mobile devices
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchOrClick = (e: TouchEvent | MouseEvent) => {
      if (gameState.isGrounded && isPlaying) {
        e.preventDefault(); // Prevent default touch behavior
        playSound('jump'); // 🔊 Jump sound
        setGameState(prev => ({
          ...prev,
          playerVelocityY: -18,
          isJumping: true
        }));
      }
    };

    // Add both touch and click events for maximum compatibility
    canvas.addEventListener('touchstart', handleTouchOrClick);
    canvas.addEventListener('click', handleTouchOrClick);
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchOrClick);
      canvas.removeEventListener('click', handleTouchOrClick);
    };
  }, [gameState.isGrounded, isPlaying]);

  // Start game when component mounts
  useEffect(() => {
    if (isPlaying) {
      setGameState(prev => ({
        ...prev,
        playerX: 100,
        playerY: 350,  // Fixed: start on grass surface
        playerVelocityY: 0,
        gameSpeed: 3,
        gameTime: 0
      }));
      lastGroundedTimeRef.current = performance.now();
      lastJumpTimeRef.current = 0;
      lastJumpPressTimeRef.current = 0;
      isJumpHeldRef.current = false;
    }
  }, [isPlaying]);

  return (
    <div className="flex justify-center items-center min-h-[250px] sm:min-h-[350px] md:min-h-[450px] relative z-10 w-full">
      <div className="relative w-full max-w-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="nes-container pixel-art shadow-2xl w-full h-auto"
          style={{
            background: 'linear-gradient(to bottom, #87CEEB, #98FB98)',
            imageRendering: 'pixelated',
            maxWidth: '100%',
            height: 'auto',
            aspectRatio: '4/3',
            display: 'block'
          }}
        />

        {/* Game Overlay UI */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-2 sm:p-4">
            <div className="nes-container with-title is-centered pixel-art w-full max-w-[280px] sm:max-w-sm mx-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <p className="title pixel-font text-primary text-xs sm:text-sm">MINDORA RUNNER</p>
              <h2 className="pixel-font text-xs sm:text-sm md:text-base mb-2 text-gray-800">Ready to Learn & Earn?</h2>
              <p className="text-xs mb-2 sm:mb-3 text-gray-700 pixel-font">
                <span className="hidden sm:inline">Press SPACE to jump and collect coins!</span>
                <span className="sm:hidden">Tap to jump & collect coins!</span>
              </p>
              <button
                onClick={() => { playSound('start'); setPlaying(true); }}
                className="nes-btn is-primary pixel-font text-xs sm:text-sm w-full py-1"
              >
                ▶ START GAME
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
