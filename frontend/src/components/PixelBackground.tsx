'use client';

import { useEffect, useState, useMemo } from 'react';

interface CloudProps {
  id: number;
  delay: number;
  size: 'small' | 'medium' | 'large';
  height: number;
}

interface FlowerProps {
  id: number;
  x: number;
  delay: number;
  color: 'pink' | 'yellow' | 'white';
}

export function PixelBackground() {
  const [clouds, setClouds] = useState<CloudProps[]>([]);
  const [flowers, setFlowers] = useState<FlowerProps[]>([]);

  useEffect(() => {
    // Generate clouds
    const cloudArray = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: i * 4,
      size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large',
      height: 20 + Math.random() * 100
    }));
    setClouds(cloudArray);

    // Generate flowers
    const flowerArray = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 6,
      color: ['pink', 'yellow', 'white'][Math.floor(Math.random() * 3)] as 'pink' | 'yellow' | 'white'
    }));
    setFlowers(flowerArray);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Sky Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #98FB98 100%)'
        }}
      />

      {/* Floating Clouds */}
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className={`cloud pixel-art ${cloud.size === 'small' ? 'w-16 h-8' : cloud.size === 'medium' ? 'w-20 h-10' : 'w-24 h-12'}`}
          style={{
            top: `${cloud.height}px`,
            animationDelay: `${cloud.delay}s`,
            animationDuration: `${20 + Math.random() * 10}s`
          }}
        />
      ))}

      {/* Floating Flowers/Petals */}
      {flowers.map((flower) => (
        <div
          key={flower.id}
          className="flower pixel-art"
          style={{
            left: `${flower.x}%`,
            bottom: '0px',
            animationDelay: `${flower.delay}s`,
            backgroundColor: flower.color === 'pink' ? '#FFB6C1' : flower.color === 'yellow' ? '#FFD700' : '#FFFFFF',
            borderRadius: '50%'
          }}
        />
      ))}

      {/* Ground with Grass Pattern */}
      <div
        className="absolute bottom-0 w-full h-32 pixel-art"
        style={{
          background: `
            linear-gradient(90deg, #228B22 0%, #32CD32 50%, #228B22 100%),
            repeating-linear-gradient(
              90deg,
              #228B22 0px,
              #228B22 2px,
              #32CD32 2px,
              #32CD32 4px
            )
          `,
          backgroundSize: '100% 20px, 8px 8px'
        }}
      >
        {/* Scattered Flowers on Ground */}
        <div className="relative w-full h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute pixel-art"
              style={{
                left: `${(i * 5 + (i % 3))}%`,
                bottom: `${8 + (i % 16)}px`,
                width: '12px',
                height: '12px',
                backgroundColor: ['#FFB6C1', '#FFD700', '#FF69B4', '#DDA0DD'][i % 4],
                borderRadius: '50%'
              }}
            />
          ))}
        </div>
      </div>

      {/* Pixel Art Sun */}
      <div
        className="absolute top-16 right-16 w-16 h-16 pixel-art"
        style={{
          background: 'radial-gradient(circle, #FFD700 30%, #FFA500 70%)',
          borderRadius: '50%',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)'
        }}
      >
        {/* Sun rays */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-6 bg-yellow-300 pixel-art"
            style={{
              top: '-8px',
              left: '50%',
              transformOrigin: '50% 40px',
              transform: `translateX(-50%) rotate(${i * 45}deg)`
            }}
          />
        ))}
      </div>

      {/* Moving Stars/Sparkles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white pixel-art animate-pulse"
          style={{
            top: `${(i * 11) % 50}%`,
            left: `${(i * 23) % 100}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );
}