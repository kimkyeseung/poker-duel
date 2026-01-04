/**
 * Animation System - 일관된 애니메이션과 reduced motion 지원
 * Poker Duel 프로젝트의 모든 애니메이션을 중앙 관리합니다.
 */

// CSS 애니메이션 클래스
export const animations = {
  // 페이드 인/아웃
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',

  // 슬라이드 인
  slideInFromTop: 'animate-in slide-in-from-top-2 fade-in',
  slideInFromBottom: 'animate-in slide-in-from-bottom-2 fade-in',
  slideInFromLeft: 'animate-in slide-in-from-left-2 fade-in',
  slideInFromRight: 'animate-in slide-in-from-right-2 fade-in',

  // 줌 인/아웃
  zoomIn: 'animate-in zoom-in',
  zoomOut: 'animate-out zoom-out',

  // 스핀
  spin: 'animate-spin',

  // 펄스
  pulse: 'animate-pulse',

  // 바운스
  bounce: 'animate-bounce',
} as const;

// 애니메이션 지속 시간
export const durations = {
  fastest: 'duration-75',
  faster: 'duration-100',
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500',
  slower: 'duration-700',
  slowest: 'duration-1000',
} as const;

// 애니메이션 딜레이
export const delays = {
  0: 'delay-0',
  75: 'delay-75',
  100: 'delay-100',
  150: 'delay-150',
  200: 'delay-200',
  300: 'delay-300',
  500: 'delay-500',
  700: 'delay-700',
  1000: 'delay-1000',
} as const;

// 이징 함수
export const easings = {
  linear: 'ease-linear',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out',
} as const;

// Reduced motion 지원을 위한 유틸리티
export const motionSafe = {
  fadeIn: 'motion-safe:animate-in motion-safe:fade-in',
  slideInFromBottom: 'motion-safe:animate-in motion-safe:slide-in-from-bottom-2 motion-safe:fade-in',
  zoomIn: 'motion-safe:animate-in motion-safe:zoom-in',
  pulse: 'motion-safe:animate-pulse',
  bounce: 'motion-safe:animate-bounce',
  spin: 'motion-safe:animate-spin',
} as const;

// 트랜지션 프리셋
export const transitions = {
  // 빠른 트랜지션 (호버 효과 등)
  fast: 'transition-all duration-150 ease-out',

  // 기본 트랜지션
  default: 'transition-all duration-300 ease-out',

  // 느린 트랜지션 (큰 레이아웃 변화)
  slow: 'transition-all duration-500 ease-out',

  // 색상만 트랜지션
  colors: 'transition-colors duration-200 ease-out',

  // 투명도만 트랜지션
  opacity: 'transition-opacity duration-200 ease-out',

  // 트랜스폼만 트랜지션
  transform: 'transition-transform duration-300 ease-out',

  // 그림자만 트랜지션
  shadow: 'transition-shadow duration-300 ease-out',
} as const;

// 스테거 애니메이션을 위한 딜레이 계산
export function staggerDelay(index: number, baseDelay = 50): string {
  return `${index * baseDelay}ms`;
}

// 카드 뒤집기 애니메이션용 CSS (tailwind.config에 추가할 keyframes)
export const cardFlipKeyframes = {
  flip: {
    '0%': { transform: 'rotateY(0deg)' },
    '100%': { transform: 'rotateY(180deg)' },
  },
  unflip: {
    '0%': { transform: 'rotateY(180deg)' },
    '100%': { transform: 'rotateY(0deg)' },
  },
} as const;

// 성공/실패 애니메이션
export const resultAnimations = {
  success: {
    container: 'motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-300',
    icon: 'motion-safe:animate-bounce',
    text: 'motion-safe:animate-in motion-safe:fade-in motion-safe:delay-200',
  },
  failure: {
    container: 'motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-300',
    icon: 'motion-safe:animate-pulse',
    text: 'motion-safe:animate-in motion-safe:fade-in motion-safe:delay-200',
  },
} as const;

// 타이머 애니메이션
export const timerAnimations = {
  normal: '',
  warning: 'motion-safe:animate-pulse',
  critical: 'motion-safe:animate-pulse text-red-500',
} as const;

// 버튼 클릭 애니메이션
export const buttonAnimations = {
  click: 'active:scale-95 transition-transform duration-150',
  hover: 'hover:-translate-y-0.5 transition-transform duration-200',
  loading: 'opacity-80 cursor-wait',
} as const;

// 카드 호버 애니메이션
export const cardAnimations = {
  idle: 'transition-all duration-300',
  hover: 'hover:shadow-2xl hover:-translate-y-1',
  selected: 'ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20',
  highlighted: 'animate-pulse bg-amber-400/10',
} as const;

// 프로그레스 바 애니메이션
export const progressAnimations = {
  fill: 'transition-all duration-100 ease-linear',
  pulse: 'motion-safe:animate-pulse',
} as const;
