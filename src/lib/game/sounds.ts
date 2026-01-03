'use client';

// 사운드 관리자
class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private audioContext: AudioContext | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private loadSettings(): void {
    try {
      const settings = localStorage.getItem('poker-duel-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.soundEnabled ?? true;
      }
    } catch {
      this.enabled = true;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.audioContext;
  }

  // 간단한 비프음 생성
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.enabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // 오류 무시
    }
  }

  // 카드 뒤집기 효과음
  playCardFlip(): void {
    this.playTone(800, 0.1, 'sine');
  }

  // 정답 효과음
  playCorrect(): void {
    if (!this.enabled) return;

    // 상승하는 음
    setTimeout(() => this.playTone(523, 0.15, 'sine'), 0);
    setTimeout(() => this.playTone(659, 0.15, 'sine'), 100);
    setTimeout(() => this.playTone(784, 0.2, 'sine'), 200);
  }

  // 오답 효과음
  playWrong(): void {
    if (!this.enabled) return;

    // 하강하는 음
    setTimeout(() => this.playTone(392, 0.2, 'sawtooth'), 0);
    setTimeout(() => this.playTone(330, 0.3, 'sawtooth'), 150);
  }

  // 타이머 경고음
  playTimerWarning(): void {
    this.playTone(440, 0.1, 'square');
  }

  // 타이머 긴급음 (마지막 3초)
  playTimerUrgent(): void {
    this.playTone(880, 0.15, 'square');
  }

  // 승리 효과음
  playVictory(): void {
    if (!this.enabled) return;

    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine'), i * 150);
    });
  }

  // 게임오버 효과음
  playGameOver(): void {
    if (!this.enabled) return;

    const notes = [392, 330, 262, 196];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth'), i * 200);
    });
  }

  // 클릭 효과음
  playClick(): void {
    this.playTone(600, 0.05, 'sine');
  }
}

export const soundManager = SoundManager.getInstance();

// 진동 관리자
class VibrationManager {
  private static instance: VibrationManager;
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  static getInstance(): VibrationManager {
    if (!VibrationManager.instance) {
      VibrationManager.instance = new VibrationManager();
    }
    return VibrationManager.instance;
  }

  private loadSettings(): void {
    try {
      const settings = localStorage.getItem('poker-duel-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.vibrationEnabled ?? true;
      }
    } catch {
      this.enabled = true;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.enabled) return;
    if (typeof navigator === 'undefined') return;
    if (!navigator.vibrate) return;

    try {
      navigator.vibrate(pattern);
    } catch {
      // 진동 지원 안 함
    }
  }

  // 짧은 진동
  vibrateShort(): void {
    this.vibrate(50);
  }

  // 정답 진동 패턴
  vibrateCorrect(): void {
    this.vibrate([50, 50, 50]);
  }

  // 오답 진동 패턴
  vibrateWrong(): void {
    this.vibrate([200, 100, 200]);
  }

  // 타이머 경고 진동
  vibrateTimerWarning(): void {
    this.vibrate(100);
  }
}

export const vibrationManager = VibrationManager.getInstance();
