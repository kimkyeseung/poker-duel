'use client';

import { Howl, Howler } from 'howler';
import { BGM_CONFIG, SFX_CONFIG, BGMType, SFXType, CROSSFADE_DURATION } from './config';
import { synthSound } from './SynthSound';

class AudioManager {
  private static instance: AudioManager;
  private bgmInstances: Map<BGMType, Howl> = new Map();
  private sfxInstances: Map<SFXType, Howl> = new Map();
  private currentBGM: BGMType | null = null;
  private pendingBGM: BGMType | null = null;
  private isInitialized = false;
  private isMuted = false;
  private masterVolume = 1;
  private bgmVolume = 1;
  private sfxVolume = 1;
  private bgmLoadedStates: Map<BGMType, boolean> = new Map();

  private constructor() {
    // 페이지 로드 시 자동 초기화 시도 (데스크톱 앱용)
    if (typeof window !== 'undefined') {
      // 약간의 딜레이 후 자동 초기화 시도
      setTimeout(() => this.tryAutoInit(), 100);
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // 자동 초기화 시도 (데스크톱 앱에서는 작동, 브라우저에서는 suspended 상태일 수 있음)
  private tryAutoInit(): void {
    if (this.isInitialized) return;

    try {
      // AudioContext 상태 확인
      const testContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      if (testContext.state === 'running') {
        // 자동재생 가능 - 바로 초기화
        console.log('[AudioManager] Auto-init successful');
        testContext.close();
        this.init();
      } else {
        // suspended 상태 - 사용자 인터랙션 필요
        console.log('[AudioManager] Auto-init blocked, waiting for user interaction');
        testContext.close();

        // 첫 클릭/터치 시 초기화
        const initOnInteraction = () => {
          this.init();
          document.removeEventListener('click', initOnInteraction);
          document.removeEventListener('touchstart', initOnInteraction);
          document.removeEventListener('keydown', initOnInteraction);
        };

        document.addEventListener('click', initOnInteraction, { once: true });
        document.addEventListener('touchstart', initOnInteraction, { once: true });
        document.addEventListener('keydown', initOnInteraction, { once: true });
      }
    } catch (e) {
      console.warn('[AudioManager] Auto-init failed:', e);
    }
  }

  // 초기화
  init(): void {
    if (this.isInitialized) return;

    console.log('[AudioManager] Initializing...');

    // BGM 프리로드
    Object.entries(BGM_CONFIG).forEach(([key, config]) => {
      const bgmType = key as BGMType;
      this.bgmLoadedStates.set(bgmType, false);

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
          if (this.pendingBGM === bgmType) {
            this.playBGM(bgmType);
          }
        },
        onloaderror: (id, error) => {
          console.warn(`[AudioManager] BGM load error (${key}):`, error);
        },
        onplayerror: (id, error) => {
          console.warn(`[AudioManager] BGM play error (${key}):`, error);
          // 재생 실패 시 unlock 후 재시도
          Howler.ctx?.resume().then(() => {
            howl.play();
          });
        },
      });
      this.bgmInstances.set(bgmType, howl);
    });

    // SFX 프리로드
    Object.entries(SFX_CONFIG).forEach(([key, config]) => {
      const howl = new Howl({
        src: [config.src],
        volume: config.volume * this.sfxVolume * this.masterVolume,
        preload: true,
        onloaderror: (id, error) => {
          // SFX 로드 실패는 조용히 처리 (SynthSound가 대체)
        },
      });
      this.sfxInstances.set(key as SFXType, howl);
    });

    this.isInitialized = true;
    console.log('[AudioManager] Initialized');

    // 대기 중인 BGM 재생 시도
    if (this.pendingBGM) {
      // BGM이 로드될 때까지 대기하거나, 이미 로드됐으면 바로 재생
      const pending = this.pendingBGM;
      if (this.bgmLoadedStates.get(pending)) {
        this.playBGM(pending);
      }
      // 아니면 onload 콜백에서 처리됨
    }
  }

  // BGM 재생 (크로스페이드)
  playBGM(type: BGMType): void {
    console.log(`[AudioManager] playBGM called: ${type}, initialized: ${this.isInitialized}, muted: ${this.isMuted}`);

    // 항상 pendingBGM 업데이트 (페이지 전환 시 필요)
    this.pendingBGM = type;

    // 초기화 전이면 대기
    if (!this.isInitialized) {
      console.log(`[AudioManager] Not initialized, BGM queued: ${type}`);
      return;
    }

    if (this.isMuted) {
      console.log('[AudioManager] Muted, skipping BGM');
      return;
    }

    if (this.currentBGM === type) {
      console.log('[AudioManager] Same BGM already playing');
      return;
    }

    const newBGM = this.bgmInstances.get(type);
    if (!newBGM) {
      console.warn(`[AudioManager] BGM not found: ${type}`);
      return;
    }

    // BGM이 로드되지 않았으면 대기 (onload에서 재생됨)
    if (!this.bgmLoadedStates.get(type)) {
      console.log(`[AudioManager] BGM not loaded yet, waiting: ${type}`);
      return;
    }

    const config = BGM_CONFIG[type];
    const targetVolume = config.volume * this.bgmVolume * this.masterVolume;

    console.log(`[AudioManager] Playing BGM: ${type}, volume: ${targetVolume}`);

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
    this.pendingBGM = null;
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
        console.warn(`[AudioManager] Unknown SFX type: ${type}`);
    }
  }

  // 음소거 토글
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    Howler.mute(muted);
    synthSound.setMuted(muted);

    if (muted) {
      this.stopBGM();
    } else if (this.pendingBGM) {
      // 음소거 해제 시 대기 중인 BGM 재생
      this.playBGM(this.pendingBGM);
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
    this.bgmLoadedStates.clear();
    this.isInitialized = false;
    this.currentBGM = null;
    this.pendingBGM = null;
  }
}

export const audioManager = AudioManager.getInstance();
export default audioManager;
