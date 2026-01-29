// 오디오 설정

export type BGMType = 'home' | 'game' | 'result-win' | 'result-lose';

// SFX는 SynthSound로 생성되므로 파일 불필요
export type SFXType =
  | 'card-hover'
  | 'card-flip'
  | 'card-deal'
  | 'button-click'
  | 'button-hover'
  | 'correct'
  | 'wrong'
  | 'timer-tick'
  | 'timer-warning'
  | 'level-up'
  | 'victory'
  | 'game-over'
  | 'round-start'
  | 'submit';

// BGM 설정
export const BGM_CONFIG: Record<BGMType, { src: string; volume: number }> = {
  'home': {
    src: '/audio/bgm/home.mp3',
    volume: 0.4,
  },
  'game': {
    src: '/audio/bgm/game.mp3',
    volume: 0.3,
  },
  'result-win': {
    src: '/audio/bgm/result-win.mp3',
    volume: 0.4,
  },
  'result-lose': {
    src: '/audio/bgm/result-lose.mp3',
    volume: 0.4,
  },
};

// 크로스페이드 시간 (ms)
export const CROSSFADE_DURATION = 1000;
