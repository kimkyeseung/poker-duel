'use client';

import { BGM_CONFIG, BGMType, SFXType, CROSSFADE_DURATION } from './config';

// Type definitions for lazy-loaded modules
type HowlClass = import('howler').Howl;
type HowlerType = typeof import('howler').Howler;
type SynthSoundType = import('./SynthSound').SynthSoundManager;

class AudioManager {
  private static instance: AudioManager | null = null;
  private bgmInstances: Map<BGMType, HowlClass> = new Map();
  private currentBGM: BGMType | null = null;
  private pendingBGM: BGMType | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private isMuted = false;
  private masterVolume = 1;
  private bgmVolume = 1;
  private sfxVolume = 1;
  private bgmLoadedStates: Map<BGMType, boolean> = new Map();

  // Lazy loaded modules
  private Howl: typeof import('howler').Howl | null = null;
  private Howler: HowlerType | null = null;
  private synthSound: SynthSoundType | null = null;

  private constructor() {
    // Constructor is private for singleton pattern
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Load dependencies asynchronously
  private async loadDependencies(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (!this.Howl || !this.Howler) {
        const howlerModule = await import('howler');
        this.Howl = howlerModule.Howl;
        this.Howler = howlerModule.Howler;
      }
      if (!this.synthSound) {
        const synthModule = await import('./SynthSound');
        this.synthSound = synthModule.synthSound;
      }
      return true;
    } catch (e) {
      console.error('[AudioManager] Failed to load dependencies:', e);
      return false;
    }
  }

  // Initialize audio system
  async init(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    try {
      const loaded = await this.loadDependencies();
      if (!loaded || !this.Howl) {
        console.warn('[AudioManager] Dependencies not loaded');
        this.isInitializing = false;
        return;
      }

      // Preload all BGM
      for (const [key, config] of Object.entries(BGM_CONFIG)) {
        const bgmType = key as BGMType;
        this.bgmLoadedStates.set(bgmType, false);

        try {
          const howl = new this.Howl({
            src: [config.src],
            loop: true,
            volume: 0,
            preload: true,
            html5: true,
            onload: () => {
              this.bgmLoadedStates.set(bgmType, true);
              // Play pending BGM if this is the one we're waiting for
              if (this.pendingBGM === bgmType && !this.isMuted) {
                this.playBGMInternal(bgmType);
              }
            },
            onloaderror: (_id: number, error: unknown) => {
              console.warn(`[AudioManager] BGM load error (${key}):`, error);
            },
            onplayerror: (_id: number, _error: unknown) => {
              // Try to resume audio context
              if (this.Howler?.ctx?.state === 'suspended') {
                this.Howler.ctx.resume().then(() => {
                  howl.play();
                });
              }
            },
          });
          this.bgmInstances.set(bgmType, howl);
        } catch (e) {
          console.warn(`[AudioManager] Failed to create BGM: ${key}`, e);
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[AudioManager] Init error:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  // Request BGM playback
  playBGM(type: BGMType): void {
    this.pendingBGM = type;

    if (!this.isInitialized) {
      // Try to initialize if not yet done
      this.init();
      return;
    }

    if (this.isMuted) {
      return;
    }

    if (this.currentBGM === type) {
      return;
    }

    // Play if loaded, otherwise onload callback will handle it
    if (this.bgmLoadedStates.get(type)) {
      this.playBGMInternal(type);
    }
  }

  // Internal BGM playback
  private playBGMInternal(type: BGMType): void {
    const newBGM = this.bgmInstances.get(type);
    if (!newBGM) {
      return;
    }

    const config = BGM_CONFIG[type];
    const targetVolume = config.volume * this.bgmVolume * this.masterVolume;

    // Fade out current BGM
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

    // Fade in new BGM
    newBGM.volume(0);
    newBGM.play();
    newBGM.fade(0, targetVolume, CROSSFADE_DURATION);

    this.currentBGM = type;
  }

  // Stop BGM
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

  // Play SFX (using SynthSound)
  playSFX(type: SFXType): void {
    if (this.isMuted) return;

    // Lazy load synthSound if needed
    if (!this.synthSound) {
      import('./SynthSound')
        .then((module) => {
          this.synthSound = module.synthSound;
          this.playSFXInternal(type);
        })
        .catch(() => {
          // Silently fail - audio is not critical
        });
      return;
    }

    this.playSFXInternal(type);
  }

  private playSFXInternal(type: SFXType): void {
    if (!this.synthSound) return;

    try {
      this.synthSound.setMuted(this.isMuted);
      this.synthSound.setVolume(this.sfxVolume * this.masterVolume);

      switch (type) {
        case 'button-click':
          this.synthSound.buttonClick();
          break;
        case 'button-hover':
          this.synthSound.buttonHover();
          break;
        case 'card-hover':
          this.synthSound.cardHover();
          break;
        case 'card-flip':
          this.synthSound.cardFlip();
          break;
        case 'card-deal':
          this.synthSound.cardDeal();
          break;
        case 'correct':
          this.synthSound.success();
          break;
        case 'wrong':
          this.synthSound.error();
          break;
        case 'submit':
          this.synthSound.submit();
          break;
        case 'timer-tick':
          this.synthSound.timerTick();
          break;
        case 'timer-warning':
          this.synthSound.timerWarning();
          break;
        case 'level-up':
          this.synthSound.levelUp();
          break;
        case 'victory':
          this.synthSound.victory();
          break;
        case 'game-over':
          this.synthSound.gameOver();
          break;
        case 'round-start':
          this.synthSound.roundStart();
          break;
      }
    } catch (e) {
      // Silently fail - audio errors should not break the game
    }
  }

  // Set muted state
  setMuted(muted: boolean): void {
    this.isMuted = muted;

    if (this.Howler) {
      this.Howler.mute(muted);
    }

    if (this.synthSound) {
      this.synthSound.setMuted(muted);
    }

    if (muted) {
      this.stopBGM();
    } else if (this.pendingBGM && this.isInitialized) {
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
    if (this.synthSound) {
      this.synthSound.setVolume(this.sfxVolume * this.masterVolume);
    }
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
    this.bgmInstances.forEach((howl) => howl.unload());
    this.bgmInstances.clear();
    this.bgmLoadedStates.clear();
    this.isInitialized = false;
    this.currentBGM = null;
    this.pendingBGM = null;
  }
}

// Create singleton instance
export const audioManager = AudioManager.getInstance();
export default audioManager;
