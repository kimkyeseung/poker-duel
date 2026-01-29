'use client';

import { Howl, Howler } from 'howler';
import { BGM_CONFIG, SFX_CONFIG, BGMType, SFXType, CROSSFADE_DURATION } from './config';
import { synthSound } from './SynthSound';

class AudioManager {
  private static instance: AudioManager;
  private bgmInstances: Map<BGMType, Howl> = new Map();
  private sfxInstances: Map<SFXType, Howl> = new Map();
  private currentBGM: BGMType | null = null;
  private isInitialized = false;
  private isMuted = false;
  private masterVolume = 1;
  private bgmVolume = 1;
  private sfxVolume = 1;

  private constructor() {
    // Singleton
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // 초기화 (사용자 인터랙션 후 호출)
  init(): void {
    if (this.isInitialized) return;

    // BGM 프리로드
    Object.entries(BGM_CONFIG).forEach(([key, config]) => {
      const howl = new Howl({
        src: [config.src],
        loop: true,
        volume: 0,
        preload: true,
        html5: true, // 스트리밍으로 메모리 절약
        onloaderror: (id, error) => {
          console.warn(`BGM load error (${key}):`, error);
        },
      });
      this.bgmInstances.set(key as BGMType, howl);
    });

    // SFX 프리로드
    Object.entries(SFX_CONFIG).forEach(([key, config]) => {
      const howl = new Howl({
        src: [config.src],
        volume: config.volume * this.sfxVolume * this.masterVolume,
        preload: true,
        onloaderror: (id, error) => {
          console.warn(`SFX load error (${key}):`, error);
        },
      });
      this.sfxInstances.set(key as SFXType, howl);
    });

    this.isInitialized = true;
  }

  // BGM 재생 (크로스페이드)
  playBGM(type: BGMType): void {
    if (!this.isInitialized || this.isMuted) return;
    if (this.currentBGM === type) return;

    const newBGM = this.bgmInstances.get(type);
    if (!newBGM) return;

    const config = BGM_CONFIG[type];
    const targetVolume = config.volume * this.bgmVolume * this.masterVolume;

    // 현재 BGM 페이드아웃
    if (this.currentBGM) {
      const currentBGMInstance = this.bgmInstances.get(this.currentBGM);
      if (currentBGMInstance) {
        currentBGMInstance.fade(currentBGMInstance.volume(), 0, CROSSFADE_DURATION);
        setTimeout(() => {
          currentBGMInstance.stop();
        }, CROSSFADE_DURATION);
      }
    }

    // 새 BGM 페이드인
    newBGM.volume(0);
    newBGM.play();
    newBGM.fade(0, targetVolume, CROSSFADE_DURATION);

    this.currentBGM = type;
  }

  // BGM 정지
  stopBGM(): void {
    if (this.currentBGM) {
      const currentBGMInstance = this.bgmInstances.get(this.currentBGM);
      if (currentBGMInstance) {
        currentBGMInstance.fade(currentBGMInstance.volume(), 0, CROSSFADE_DURATION / 2);
        setTimeout(() => {
          currentBGMInstance.stop();
        }, CROSSFADE_DURATION / 2);
      }
      this.currentBGM = null;
    }
  }

  // 효과음 재생 (파일이 없으면 SynthSound 사용)
  playSFX(type: SFXType): void {
    if (this.isMuted) return;

    // SynthSound 음소거 상태 동기화
    synthSound.setMuted(this.isMuted);
    synthSound.setVolume(this.sfxVolume * this.masterVolume);

    // 파일 기반 SFX 시도
    const sfx = this.sfxInstances.get(type);
    if (sfx && sfx.state() === 'loaded') {
      const config = SFX_CONFIG[type];
      sfx.volume(config.volume * this.sfxVolume * this.masterVolume);
      sfx.play();
      return;
    }

    // 파일이 없거나 로드 안됐으면 SynthSound 사용
    this.playSynthSFX(type);
  }

  // SynthSound로 효과음 재생
  private playSynthSFX(type: SFXType): void {
    switch (type) {
      case 'button-click':
        synthSound.buttonClick();
        break;
      case 'button-hover':
        synthSound.buttonHover();
        break;
      case 'card-hover':
        synthSound.cardHover();
        break;
      case 'card-flip':
        synthSound.cardFlip();
        break;
      case 'card-deal':
        synthSound.cardDeal();
        break;
      case 'correct':
        synthSound.success();
        break;
      case 'wrong':
        synthSound.error();
        break;
      case 'submit':
        synthSound.submit();
        break;
      case 'timer-tick':
        synthSound.timerTick();
        break;
      case 'timer-warning':
        synthSound.timerWarning();
        break;
      case 'level-up':
        synthSound.levelUp();
        break;
      case 'victory':
        synthSound.victory();
        break;
      case 'game-over':
        synthSound.gameOver();
        break;
      case 'round-start':
        synthSound.roundStart();
        break;
      default:
        console.warn(`Unknown SFX type: ${type}`);
    }
  }

  // 음소거 토글
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    Howler.mute(muted);
    synthSound.setMuted(muted);

    if (muted) {
      this.stopBGM();
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  // 마스터 볼륨 설정 (0-1)
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  // BGM 볼륨 설정 (0-1)
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
  }

  getBGMVolume(): number {
    return this.bgmVolume;
  }

  // SFX 볼륨 설정 (0-1)
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    synthSound.setVolume(this.sfxVolume * this.masterVolume);
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  private updateAllVolumes(): void {
    this.updateBGMVolume();
  }

  private updateBGMVolume(): void {
    if (this.currentBGM) {
      const bgm = this.bgmInstances.get(this.currentBGM);
      const config = BGM_CONFIG[this.currentBGM];
      if (bgm && config) {
        bgm.volume(config.volume * this.bgmVolume * this.masterVolume);
      }
    }
  }

  // 현재 BGM 타입 반환
  getCurrentBGM(): BGMType | null {
    return this.currentBGM;
  }

  // 초기화 상태 확인
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // 정리
  dispose(): void {
    this.bgmInstances.forEach(howl => howl.unload());
    this.sfxInstances.forEach(howl => howl.unload());
    this.bgmInstances.clear();
    this.sfxInstances.clear();
    this.isInitialized = false;
    this.currentBGM = null;
  }
}

export const audioManager = AudioManager.getInstance();
export default audioManager;
