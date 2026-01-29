// 오디오 설정

export type BGMType = 'home' | 'game' | 'result-win' | 'result-lose';
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

// 효과음 설정
export const SFX_CONFIG: Record<SFXType, { src: string; volume: number }> = {
  'card-hover': {
    src: '/audio/sfx/card-hover.mp3',
    volume: 0.2,
  },
  'card-flip': {
    src: '/audio/sfx/card-flip.mp3',
    volume: 0.5,
  },
  'card-deal': {
    src: '/audio/sfx/card-deal.mp3',
    volume: 0.4,
  },
  'button-click': {
    src: '/audio/sfx/button-click.mp3',
    volume: 0.4,
  },
  'button-hover': {
    src: '/audio/sfx/button-hover.mp3',
    volume: 0.15,
  },
  'correct': {
    src: '/audio/sfx/correct.mp3',
    volume: 0.5,
  },
  'wrong': {
    src: '/audio/sfx/wrong.mp3',
    volume: 0.5,
  },
  'timer-tick': {
    src: '/audio/sfx/timer-tick.mp3',
    volume: 0.3,
  },
  'timer-warning': {
    src: '/audio/sfx/timer-warning.mp3',
    volume: 0.4,
  },
  'level-up': {
    src: '/audio/sfx/level-up.mp3',
    volume: 0.5,
  },
  'victory': {
    src: '/audio/sfx/victory.mp3',
    volume: 0.6,
  },
  'game-over': {
    src: '/audio/sfx/game-over.mp3',
    volume: 0.5,
  },
  'round-start': {
    src: '/audio/sfx/round-start.mp3',
    volume: 0.4,
  },
  'submit': {
    src: '/audio/sfx/submit.mp3',
    volume: 0.4,
  },
};

// 크로스페이드 시간 (ms)
export const CROSSFADE_DURATION = 1000;
