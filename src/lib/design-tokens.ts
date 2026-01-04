/**
 * Design Tokens - 일관된 디자인을 위한 토큰 시스템
 * Poker Duel 프로젝트의 모든 색상, 간격, 타이포그래피를 중앙 관리합니다.
 */

// 색상 토큰
export const colors = {
  // 주요 색상
  primary: {
    50: 'bg-amber-50',
    100: 'bg-amber-100',
    500: 'bg-amber-500',
    600: 'bg-amber-600',
    text: 'text-amber-500',
    textLight: 'text-amber-400',
    border: 'border-amber-500',
    ring: 'ring-amber-500',
  },

  // 성공/정답
  success: {
    bg: 'bg-emerald-500',
    bgSubtle: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/50',
    shadow: 'shadow-emerald-500/20',
  },

  // 에러/오답
  error: {
    bg: 'bg-red-500',
    bgSubtle: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/50',
    shadow: 'shadow-red-500/20',
  },

  // 경고
  warning: {
    bg: 'bg-amber-500',
    bgSubtle: 'bg-amber-500/20',
    text: 'text-amber-500',
    textLight: 'text-amber-400',
    border: 'border-amber-500/50',
  },

  // 플레이어
  player: {
    bg: 'bg-blue-500',
    bgSubtle: 'bg-blue-500/20',
    bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    shadow: 'shadow-blue-500/20',
  },

  // 컴퓨터
  computer: {
    bg: 'bg-red-500',
    bgSubtle: 'bg-red-500/20',
    bgGradient: 'bg-gradient-to-br from-red-500 to-red-700',
    text: 'text-red-400',
    border: 'border-red-500/50',
    shadow: 'shadow-red-500/20',
  },

  // 배경/표면
  surface: {
    primary: 'bg-slate-900',
    secondary: 'bg-slate-800',
    tertiary: 'bg-slate-700',
    overlay: 'bg-slate-800/90',
    glass: 'bg-slate-800/80 backdrop-blur-sm',
  },

  // 텍스트
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
    subtle: 'text-slate-500',
  },

  // 테두리
  border: {
    default: 'border-slate-700',
    subtle: 'border-slate-600',
    active: 'border-amber-500',
  },
} as const;

// 간격 토큰
export const spacing = {
  // 컴포넌트 내부 패딩
  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  // 컴포넌트 간 간격
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  },

  // 섹션 간 마진
  margin: {
    xs: 'mb-2',
    sm: 'mb-3',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
  },
} as const;

// 타이포그래피 토큰
export const typography = {
  // 제목
  heading: {
    xl: 'text-4xl font-bold',
    lg: 'text-3xl font-bold',
    md: 'text-2xl font-bold',
    sm: 'text-xl font-bold',
    xs: 'text-lg font-semibold',
  },

  // 본문
  body: {
    lg: 'text-lg',
    md: 'text-base',
    sm: 'text-sm',
    xs: 'text-xs',
  },

  // 특수 텍스트
  special: {
    mono: 'font-mono',
    tabular: 'tabular-nums',
    label: 'text-sm font-medium uppercase tracking-wider',
  },
} as const;

// 그림자 토큰
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: {
    primary: 'shadow-lg shadow-amber-500/20',
    success: 'shadow-lg shadow-emerald-500/20',
    error: 'shadow-lg shadow-red-500/20',
    player: 'shadow-lg shadow-blue-500/20',
  },
} as const;

// 라운드 토큰
export const rounded = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
} as const;

// 트랜지션 토큰
export const transitions = {
  fast: 'transition-all duration-150',
  default: 'transition-all duration-300',
  slow: 'transition-all duration-500',
  colors: 'transition-colors duration-200',
} as const;

// 난이도별 색상
export const difficultyColors = {
  easy: {
    bg: 'bg-emerald-500',
    bgSubtle: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/50',
  },
  normal: {
    bg: 'bg-blue-500',
    bgSubtle: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
  },
  hard: {
    bg: 'bg-amber-500',
    bgSubtle: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
  },
  expert: {
    bg: 'bg-purple-500',
    bgSubtle: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/50',
  },
  master: {
    bg: 'bg-red-500',
    bgSubtle: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/50',
  },
} as const;

// 라운드 이름 (한글)
export const roundNames = {
  preflop: '프리플랍',
  flop: '플랍',
  turn: '턴',
  river: '리버',
} as const;

// 난이도 이름 (한글)
export const difficultyNames = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  expert: '전문가',
  master: '홀덤의 신',
} as const;
