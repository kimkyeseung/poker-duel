'use client';

import { Howl, Howler } from 'howler';
import { BGM_CONFIG, BGMType, SFXType, CROSSFADE_DURATION } from './config';
import { synthSound } from './SynthSound';

class AudioManager {
  private static instance: AudioManager | null = null;
  private bgmInstances: Map<BGMType, Howl> = new Map();
  private currentBGM: BGMType | null = null;
  private pendingBGM: BGMType | null = null;
  private isInitialized = false;
  private isMuted = false;
  private masterVolume = 1;
  private bgmVolume = 1;
  private sfxVolume = 1;
  private bgmLoadedStates: Map<BGMType, boolean> = new Map();
  private initPromise: Promise<void> | null = null;

  private constructor() {
    console.log('[AudioManager] Constructor called');
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      console.log('[AudioManager] Creating new instance');
      AudioManager.instance = new AudioManager();

      // 브라우저 환경에서만 자동 초기화 시도
      if (typeof window !== 'undefined') {
        AudioManager.instance.setupAutoInit();
      }
    }
    return AudioManager.instance;
  }

  // 자동 초기화 설정
  private setupAutoInit(): void {
    console.log('[AudioManager] Setting up auto-init');

    // 이미 사용자 인터랙션이 있었는지 확인
    const initOnInteraction = () => {
      console.log('[AudioManager] User interaction detected');
      this.init();
    };

    // 클릭, 터치, 키 입력 시 초기화
    document.addEventListener('click', initOnInteraction, { once: true, capture: true });
    document.addEventListener('touchstart', initOnInteraction, { once: true, capture: true });
    document.addEventListener('keydown', initOnInteraction, { once: true, capture: true });

    // 바로 초기화도 시도 (Tauri 등 데스크톱 앱용)
    setTimeout(() => {
      if (!this.isInitialized) {
        console.log('[AudioManager] Attempting immediate init');
        this.init();
      }
    }, 500);
  }

  // 초기화
  init(): void {
    if (this.isInitialized) {
      console.log('[AudioManager] Already initialized');
      return;
    }

    console.log('[AudioManager] Initializing...');

    try {
      // BGM 프리로드
      Object.entries(BGM_CONFIG).forEach(([key, config]) => {
        const bgmType = key as BGMType;
        this.bgmLoadedStates.set(bgmType, false);

        console.log(`[AudioManager] Creating BGM: ${key}, src: ${config.src}`);

        const howl = new Howl({
          src: [config.src],
          loop: true,
          volume: 0,
          preload: true,
          html5: true,
          onload: () => {
            console.log(`[AudioManager] BGM loaded: ${key}`);
            this.bgmLoadedStates.set(bgmType, true);

            // 대기 중인 BGM이 이 타입이면 재생
            if (this.pendingBGM === bgmType && !this.isMuted) {
              console.log(`[AudioManager] Playing pending BGM: ${key}`);
              this.playBGMInternal(bgmType);
            }
          },
          onloaderror: (id, error) => {
            console.error(`[AudioManager] BGM load error (${key}):`, error);
          },
          onplayerror: (id, error) => {
            console.error(`[AudioManager] BGM play error (${key}):`, error);
            // 재생 실패 시 컨텍스트 resume 후 재시도
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
              Howler.ctx.resume().then(() => {
                console.log('[AudioManager] AudioContext resumed, retrying play');
                howl.play();
              });
            }
          },
        });
        this.bgmInstances.set(bgmType, howl);
      });

      this.isInitialized = true;
      console.log('[AudioManager] Initialization complete');

    } catch (error) {
      console.error('[AudioManager] Init error:', error);
    }
  }

  // BGM 재생 요청
  playBGM(type: BGMType): void {
    console.log(`[AudioManager] playBGM: ${type}`);

    this.pendingBGM = type;

    if (!this.isInitialized) {
      console.log(`[AudioManager] Not initialized yet, BGM queued: ${type}`);
      return;
    }

    if (this.isMuted) {
      console.log('[AudioManager] Muted, BGM queued but not playing');
      return;
    }

    if (this.currentBGM === type) {
      console.log('[AudioManager] Same BGM already playing');
      return;
    }

    // BGM이 로드됐으면 재생, 아니면 onload에서 재생
    if (this.bgmLoadedStates.get(type)) {
      this.playBGMInternal(type);
    } else {
      console.log(`[AudioManager] BGM not loaded yet, will play when ready: ${type}`);
    }
  }

  // 실제 BGM 재생 (내부용)
  private playBGMInternal(type: BGMType): void {
    const newBGM = this.bgmInstances.get(type);
    if (!newBGM) {
      console.warn(`[AudioManager] BGM instance not found: ${type}`);
      return;
    }

    const config = BGM_CONFIG[type];
    const targetVolume = config.volume * this.bgmVolume * this.masterVolume;

    console.log(`[AudioManager] Playing BGM: ${type}, targetVolume: ${targetVolume}`);

    // 현재 BGM 페이드아웃
    if (this.currentBGM && this.currentBGM !== type) {
      const currentBGMInstance = this.bgmInstances.get(this.currentBGM);
      if (currentBGMInstance) {
        currentBGMInstance.fade(currentBGMInstance.volume(), 0, CROSSFADE_DURATION);
        const bgmToStop = this.currentBGM;
        setTimeout(() => {
          this.bgmInstances.get(bgmToStop)?.stop();
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

  // 효과음 재생 (SynthSound 전용)
  playSFX(type: SFXType): void {
    if (this.isMuted) return;

    synthSound.setMuted(this.isMuted);
    synthSound.setVolume(this.sfxVolume * this.masterVolume);

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
    }
  }

  // 음소거 토글
  setMuted(muted: boolean): void {
    console.log(`[AudioManager] setMuted: ${muted}`);
    this.isMuted = muted;
    Howler.mute(muted);
    synthSound.setMuted(muted);

    if (muted) {
      this.stopBGM();
    } else if (this.pendingBGM && this.isInitialized) {
      // 음소거 해제 시 대기 중인 BGM 재생
      if (this.bgmLoadedStates.get(this.pendingBGM)) {
        this.playBGMInternal(this.pendingBGM);
      }
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
  }

  getBGMVolume(): number {
    return this.bgmVolume;
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    synthSound.setVolume(this.sfxVolume * this.masterVolume);
  }

  getSFXVolume(): number {
    return this.sfxVolume;
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

  getCurrentBGM(): BGMType | null {
    return this.currentBGM;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  dispose(): void {
    this.bgmInstances.forEach(howl => howl.unload());
    this.bgmInstances.clear();
    this.bgmLoadedStates.clear();
    this.isInitialized = false;
    this.currentBGM = null;
    this.pendingBGM = null;
  }
}

export const audioManager = AudioManager.getInstance();
export default audioManager;
