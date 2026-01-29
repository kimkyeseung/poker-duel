'use client';

/**
 * Web Audio API를 사용한 합성 사운드 생성기
 * 파일 다운로드 없이 코드로 UI 사운드 효과 생성
 */

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface SoundOptions {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  decay?: boolean;
  pan?: number; // -1 (left) to 1 (right)
}

export class SynthSoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;
  private volume = 1;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }

    // Resume if suspended (due to browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private playTone(options: SoundOptions): void {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const { frequency, duration, volume, type, decay = true, pan = 0 } = options;

    // Create nodes
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(this.masterGain || ctx.destination);

    // Configure
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    panNode.pan.value = pan;

    const actualVolume = volume * this.volume;
    gainNode.gain.setValueAtTime(actualVolume, ctx.currentTime);

    if (decay) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }

    // Play
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  private playNoise(duration: number, volume: number): void {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain || ctx.destination);

    const actualVolume = volume * this.volume;
    gainNode.gain.setValueAtTime(actualVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + duration);
  }

  // ===== UI 사운드 효과 =====

  /** 버튼 클릭 - 짧고 명확한 클릭음 */
  buttonClick(): void {
    this.playTone({
      frequency: 800,
      duration: 0.08,
      volume: 0.15,
      type: 'sine',
    });
    // 약간의 노이즈로 "클릭" 느낌 추가
    this.playNoise(0.03, 0.05);
  }

  /** 버튼 호버 - 아주 부드럽고 미묘한 소리 */
  buttonHover(): void {
    this.playTone({
      frequency: 1200,
      duration: 0.05,
      volume: 0.05,
      type: 'sine',
    });
  }

  /** 성공/정답 - 상승하는 두 음 */
  success(): void {
    // 첫 번째 음
    setTimeout(() => {
      this.playTone({
        frequency: 523.25, // C5
        duration: 0.15,
        volume: 0.2,
        type: 'sine',
      });
    }, 0);

    // 두 번째 음 (더 높은 음)
    setTimeout(() => {
      this.playTone({
        frequency: 659.25, // E5
        duration: 0.2,
        volume: 0.2,
        type: 'sine',
      });
    }, 100);
  }

  /** 실패/오답 - 하강하는 불협화음 */
  error(): void {
    // 낮은 버저 같은 소리
    this.playTone({
      frequency: 200,
      duration: 0.3,
      volume: 0.2,
      type: 'sawtooth',
    });

    // 약간 불협화음 추가
    setTimeout(() => {
      this.playTone({
        frequency: 180,
        duration: 0.25,
        volume: 0.15,
        type: 'square',
      });
    }, 50);
  }

  /** 카드 호버 - 부드러운 스와이프 느낌 */
  cardHover(): void {
    this.playTone({
      frequency: 400,
      duration: 0.08,
      volume: 0.08,
      type: 'triangle',
    });
  }

  /** 카드 뒤집기 - 페이퍼 플립 느낌 */
  cardFlip(): void {
    this.playNoise(0.1, 0.15);
    this.playTone({
      frequency: 300,
      duration: 0.1,
      volume: 0.1,
      type: 'triangle',
    });
  }

  /** 카드 딜 - 여러 장 배분되는 느낌 */
  cardDeal(): void {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playNoise(0.05, 0.1);
        this.playTone({
          frequency: 250 + i * 30,
          duration: 0.08,
          volume: 0.08,
          type: 'triangle',
        });
      }, i * 80);
    }
  }

  /** 제출 - 확인 느낌의 짧은 소리 */
  submit(): void {
    this.playTone({
      frequency: 600,
      duration: 0.1,
      volume: 0.15,
      type: 'sine',
    });
    setTimeout(() => {
      this.playTone({
        frequency: 800,
        duration: 0.08,
        volume: 0.1,
        type: 'sine',
      });
    }, 60);
  }

  /** 타이머 틱 */
  timerTick(): void {
    this.playTone({
      frequency: 1000,
      duration: 0.05,
      volume: 0.08,
      type: 'sine',
    });
  }

  /** 타이머 경고 - 급박한 느낌 */
  timerWarning(): void {
    this.playTone({
      frequency: 880,
      duration: 0.1,
      volume: 0.2,
      type: 'square',
    });
  }

  /** 레벨업 - 상승하는 아르페지오 */
  levelUp(): void {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          duration: 0.2,
          volume: 0.15,
          type: 'sine',
        });
      }, i * 80);
    });
  }

  /** 승리 - 팡파레 느낌 */
  victory(): void {
    const melody = [
      { freq: 523.25, delay: 0 },     // C5
      { freq: 659.25, delay: 100 },   // E5
      { freq: 783.99, delay: 200 },   // G5
      { freq: 1046.50, delay: 350 },  // C6
      { freq: 1046.50, delay: 500 },  // C6
    ];

    melody.forEach(({ freq, delay }) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          duration: 0.25,
          volume: 0.2,
          type: 'sine',
        });
        // 화음 추가
        this.playTone({
          frequency: freq * 1.25, // 메이저 3도
          duration: 0.2,
          volume: 0.1,
          type: 'sine',
        });
      }, delay);
    });
  }

  /** 게임 오버 - 하강하는 슬픈 느낌 */
  gameOver(): void {
    const notes = [392, 349.23, 293.66, 261.63]; // G4, F4, D4, C4

    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          duration: 0.4,
          volume: 0.15,
          type: 'sine',
        });
      }, i * 200);
    });
  }

  /** 라운드 시작 - 주의를 끄는 소리 */
  roundStart(): void {
    this.playTone({
      frequency: 440,
      duration: 0.15,
      volume: 0.15,
      type: 'sine',
    });
    setTimeout(() => {
      this.playTone({
        frequency: 554.37, // C#5
        duration: 0.2,
        volume: 0.18,
        type: 'sine',
      });
    }, 120);
  }
}

export const synthSound = new SynthSoundManager();
export default synthSound;
