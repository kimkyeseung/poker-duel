'use client';

import { useCallback, useEffect, useState } from 'react';
import { audioManager } from './AudioManager';
import { BGMType, SFXType } from './config';
import { getSettings, updateSettings } from '@/lib/storage';

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // 설정에서 음소거 상태 로드
  useEffect(() => {
    const settings = getSettings();
    setIsMuted(!settings.soundEnabled);
    audioManager.setMuted(!settings.soundEnabled);
  }, []);

  // 오디오 초기화 (사용자 인터랙션 시 호출)
  const initAudio = useCallback(() => {
    if (!audioManager.getIsInitialized()) {
      audioManager.init();
      setIsInitialized(true);

      // 설정에 따라 음소거 상태 적용
      const settings = getSettings();
      audioManager.setMuted(!settings.soundEnabled);
      setIsMuted(!settings.soundEnabled);
    }
  }, []);

  // BGM 재생
  const playBGM = useCallback((type: BGMType) => {
    if (!audioManager.getIsInitialized()) {
      audioManager.init();
      setIsInitialized(true);
    }
    audioManager.playBGM(type);
  }, []);

  // BGM 정지
  const stopBGM = useCallback(() => {
    audioManager.stopBGM();
  }, []);

  // 효과음 재생
  const playSFX = useCallback((type: SFXType) => {
    audioManager.playSFX(type);
  }, []);

  // 음소거 토글
  const toggleMute = useCallback(() => {
    const newMuted = !audioManager.getMuted();
    audioManager.setMuted(newMuted);
    setIsMuted(newMuted);

    // 설정에 저장
    updateSettings({ soundEnabled: !newMuted });
  }, []);

  // 음소거 설정
  const setMuted = useCallback((muted: boolean) => {
    audioManager.setMuted(muted);
    setIsMuted(muted);
    updateSettings({ soundEnabled: !muted });
  }, []);

  // 마스터 볼륨 설정
  const setMasterVolume = useCallback((volume: number) => {
    audioManager.setMasterVolume(volume);
  }, []);

  // BGM 볼륨 설정
  const setBGMVolume = useCallback((volume: number) => {
    audioManager.setBGMVolume(volume);
  }, []);

  // SFX 볼륨 설정
  const setSFXVolume = useCallback((volume: number) => {
    audioManager.setSFXVolume(volume);
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

// 간단한 효과음 훅 (컴포넌트에서 바로 사용)
export function useSFX() {
  const playSFX = useCallback((type: SFXType) => {
    audioManager.playSFX(type);
  }, []);

  return { playSFX };
}

// BGM 훅 (페이지에서 사용)
export function useBGM(type: BGMType) {
  useEffect(() => {
    // 약간의 딜레이 후 BGM 재생 (페이지 전환 시 부드럽게)
    const timer = setTimeout(() => {
      if (audioManager.getIsInitialized()) {
        audioManager.playBGM(type);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [type]);
}
