/**
 * Design Tokens - 일관된 디자인을 위한 토큰 시스템
 * Hol'Damn It! 프로젝트의 모든 색상, 간격, 타이포그래피를 중앙 관리합니다.
 */

// 색상 토큰
export const colors = {
  // 주요 색상
  primary: {
    50: 'bg-[#00d4ff]/10',
    100: 'bg-[#00d4ff]/20',
    500: 'bg-[#00d4ff]',
    600: 'bg-[#0066ff]',
    text: 'text-[#00d4ff]',
    textLight: 'text-[#00d4ff]/80',
    border: 'border-[#00d4ff]',
    ring: 'ring-[#00d4ff]',
  },

  // 성공/정답
  success: {
    bg: 'bg-[#00ff88]',
    bgSubtle: 'bg-[#00ff88]/20',
    text: 'text-[#00ff88]',
    border: 'border-[#00ff88]/50',
    shadow: 'shadow-[#00ff88]/20',
  },

  // 에러/오답
  error: {
    bg: 'bg-[#ff4444]',
    bgSubtle: 'bg-[#ff4444]/20',
    text: 'text-[#ff4444]',
    border: 'border-[#ff4444]/50',
    shadow: 'shadow-[#ff4444]/20',
  },

  // 경고
  warning: {
    bg: 'bg-[#ffd700]',
    bgSubtle: 'bg-[#ffd700]/20',
    text: 'text-[#ffd700]',
    textLight: 'text-[#ffb800]',
    border: 'border-[#ffd700]/50',
  },

  // 플레이어 (Cyan)
  player: {
    bg: 'bg-[#00d4ff]',
    bgSubtle: 'bg-[#00d4ff]/20',
    bgGradient: 'bg-gradient-to-br from-[#00d4ff] to-[#0066ff]',
    text: 'text-[#00d4ff]',
    border: 'border-[#00d4ff]/50',
    shadow: 'shadow-[#00d4ff]/20',
  },

  // 컴퓨터/딜러 (Pink)
  computer: {
    bg: 'bg-[#ff4d94]',
    bgSubtle: 'bg-[#ff4d94]/20',
    bgGradient: 'bg-gradient-to-br from-[#ff4d94] to-[#ff0080]',
    text: 'text-[#ff4d94]',
    border: 'border-[#ff4d94]/50',
    shadow: 'shadow-[#ff4d94]/20',
  },

  // 골드 (승리/보상)
  gold: {
    bg: 'bg-[#ffd700]',
    bgSubtle: 'bg-[#ffd700]/20',
    bgGradient: 'bg-gradient-to-br from-[#ffd700] to-[#ffb800]',
    text: 'text-[#ffd700]',
    border: 'border-[#ffd700]/50',
    shadow: 'shadow-[#ffd700]/20',
  },

  // 배경/표면
  surface: {
    primary: 'bg-[#0a0e1a]',
    secondary: 'bg-[#0f1424]',
    tertiary: 'bg-[#1a1f35]',
    overlay: 'bg-[#0f1424]/90',
    glass: 'bg-[#1a1f35]/80 backdrop-blur-sm',
  },

  // 텍스트
  text: {
    primary: 'text-white',
    secondary: 'text-[#94a3b8]',
    muted: 'text-[#64748b]',
    subtle: 'text-[#475569]',
  },

  // 테두리
  border: {
    default: 'border-white/10',
    subtle: 'border-white/5',
    active: 'border-[#00d4ff]',
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
    xl: 'text-4xl font-black',
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
    primary: 'shadow-lg shadow-[#00d4ff]/20',
    success: 'shadow-lg shadow-[#00ff88]/20',
    error: 'shadow-lg shadow-[#ff4444]/20',
    player: 'shadow-lg shadow-[#00d4ff]/20',
    computer: 'shadow-lg shadow-[#ff4d94]/20',
    gold: 'shadow-lg shadow-[#ffd700]/20',
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
    bg: 'bg-[#00ff88]',
    bgSubtle: 'bg-[#00ff88]/20',
    text: 'text-[#00ff88]',
    border: 'border-[#00ff88]/50',
    gradient: 'from-[#00ff88] to-[#00cc66]',
  },
  normal: {
    bg: 'bg-[#00d4ff]',
    bgSubtle: 'bg-[#00d4ff]/20',
    text: 'text-[#00d4ff]',
    border: 'border-[#00d4ff]/50',
    gradient: 'from-[#00d4ff] to-[#0066ff]',
  },
  hard: {
    bg: 'bg-[#ffd700]',
    bgSubtle: 'bg-[#ffd700]/20',
    text: 'text-[#ffd700]',
    border: 'border-[#ffd700]/50',
    gradient: 'from-[#ffd700] to-[#ffb800]',
  },
  expert: {
    bg: 'bg-[#ff4d94]',
    bgSubtle: 'bg-[#ff4d94]/20',
    text: 'text-[#ff4d94]',
    border: 'border-[#ff4d94]/50',
    gradient: 'from-[#ff4d94] to-[#ff0080]',
  },
  master: {
    bg: 'bg-[#ff4444]',
    bgSubtle: 'bg-[#ff4444]/20',
    text: 'text-[#ff4444]',
    border: 'border-[#ff4444]/50',
    gradient: 'from-[#ff4444] to-[#cc0000]',
  },
  god: {
    bg: 'bg-gradient-to-r from-[#ffd700] to-[#ff4d94]',
    bgSubtle: 'bg-gradient-to-r from-[#ffd700]/20 to-[#ff4d94]/20',
    text: 'text-[#ffd700]',
    border: 'border-[#ffd700]/50',
    gradient: 'from-[#ffd700] via-[#ff4d94] to-[#ff0080]',
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
  god: '홀덤의 신',
} as const;
