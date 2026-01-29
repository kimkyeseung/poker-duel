'use client';

import { useState, useEffect } from 'react';
import { audioManager } from '@/lib/audio/AudioManager';

interface ClickToStartProps {
  onStart: () => void;
}

export function ClickToStart({ onStart }: ClickToStartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already interacted in this session
    const hasStarted = sessionStorage.getItem('poker-duel-started');
    if (!hasStarted) {
      setIsVisible(true);
    } else {
      // Already started, trigger onStart
      onStart();
    }
  }, [onStart]);

  const handleClick = async () => {
    // Mark as started first (before any potential errors)
    sessionStorage.setItem('poker-duel-started', 'true');

    try {
      // Initialize audio system
      await audioManager.init();
    } catch {
      // Ignore audio errors - they shouldn't block the game
    }

    setIsVisible(false);
    onStart();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer"
      style={{
        background: 'radial-gradient(circle at center, #1a0b2e 0%, #0a0a1a 100%)',
      }}
      onClick={handleClick}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8b5cf6]/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00d4ff]/15 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative text-center space-y-8">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="block text-gradient-secondary">POKER</span>
            <span className="block text-gradient-primary">DUEL</span>
          </h1>
        </div>

        {/* Click to Start */}
        <div className="space-y-4">
          <div className="relative inline-flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute w-24 h-24 rounded-full border-2 border-[#00d4ff]/50 animate-ping" />
            <div className="absolute w-20 h-20 rounded-full border border-[#00d4ff]/30 animate-pulse" />

            {/* Play button */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shadow-lg shadow-[#00d4ff]/30">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <p className="text-white/70 text-lg font-medium animate-pulse">
            Click anywhere to start
          </p>

          <p className="text-white/40 text-sm">
            Sound will be enabled
          </p>
        </div>

        {/* Decorative Cards */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-2 opacity-30">
          <div className="w-12 h-16 rounded-lg bg-white/10 border border-white/20 -rotate-12" />
          <div className="w-12 h-16 rounded-lg bg-white/10 border border-white/20 rotate-6" />
          <div className="w-12 h-16 rounded-lg bg-white/10 border border-white/20 rotate-12" />
        </div>
      </div>
    </div>
  );
}
