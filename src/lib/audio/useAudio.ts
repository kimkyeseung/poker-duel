'use client';

import { useCallback, useEffect, useState } from 'react';
import { audioManager } from './AudioManager';
import { BGMType, SFXType } from './config';
import { getSettings, updateSettings } from '@/lib/storage';

export function useAudio() {
  // Initialize state from audioManager synchronously to avoid cascading renders
  const [isInitialized, setIsInitialized] = useState(() => {
    try {
      return audioManager.getIsInitialized();
    } catch {
      return false;
    }
  });

  const [isMuted, setIsMuted] = useState(() => {
    try {
      return audioManager.getMuted();
    } catch {
      return false;
    }
  });

  // Sync settings on mount (only apply settings, don't update state)
  useEffect(() => {
    try {
      const settings = getSettings();
      const shouldMute = !settings.soundEnabled;

      if (audioManager.getMuted() !== shouldMute) {
        audioManager.setMuted(shouldMute);
      }
    } catch {
      // Ignore errors - audio is not critical
    }
  }, []);

  // Initialize audio
  const initAudio = useCallback(() => {
    try {
      if (!audioManager.getIsInitialized()) {
        audioManager.init();
        setIsInitialized(true);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Play BGM
  const playBGM = useCallback((type: BGMType) => {
    try {
      if (!audioManager.getIsInitialized()) {
        audioManager.init();
        setIsInitialized(true);
      }
      audioManager.playBGM(type);
    } catch {
      // Ignore errors
    }
  }, []);

  // Stop BGM
  const stopBGM = useCallback(() => {
    try {
      audioManager.stopBGM();
    } catch {
      // Ignore errors
    }
  }, []);

  // Play SFX
  const playSFX = useCallback((type: SFXType) => {
    try {
      audioManager.playSFX(type);
    } catch {
      // Ignore errors
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    try {
      const newMuted = !audioManager.getMuted();
      audioManager.setMuted(newMuted);
      setIsMuted(newMuted);
      updateSettings({ soundEnabled: !newMuted });
    } catch {
      // Ignore errors
    }
  }, []);

  // Set muted
  const setMuted = useCallback((muted: boolean) => {
    try {
      audioManager.setMuted(muted);
      setIsMuted(muted);
      updateSettings({ soundEnabled: !muted });
    } catch {
      // Ignore errors
    }
  }, []);

  // Volume controls
  const setMasterVolume = useCallback((volume: number) => {
    try {
      audioManager.setMasterVolume(volume);
    } catch {
      // Ignore errors
    }
  }, []);

  const setBGMVolume = useCallback((volume: number) => {
    try {
      audioManager.setBGMVolume(volume);
    } catch {
      // Ignore errors
    }
  }, []);

  const setSFXVolume = useCallback((volume: number) => {
    try {
      audioManager.setSFXVolume(volume);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    isInitialized,
    isMuted,
    initAudio,
    playBGM,
    stopBGM,
    playSFX,
    toggleMute,
    setMuted,
    setMasterVolume,
    setBGMVolume,
    setSFXVolume,
  };
}

// Simple SFX hook for components
export function useSFX() {
  const playSFX = useCallback((type: SFXType) => {
    try {
      audioManager.playSFX(type);
    } catch {
      // Silently fail - audio errors should not break the UI
    }
  }, []);

  return { playSFX };
}

// BGM hook for pages
export function useBGM(type: BGMType) {
  useEffect(() => {
    // Delay slightly for smoother page transitions
    const timer = setTimeout(() => {
      try {
        audioManager.playBGM(type);
      } catch {
        // Ignore errors
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [type]);
}
