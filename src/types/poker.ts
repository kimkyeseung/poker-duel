// 카드 타입 정의
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

// 핸드 랭킹 (높을수록 강함)
export enum HandRank {
  HIGH_CARD = 1,
  ONE_PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10,
}

export interface HandEvaluation {
  rank: HandRank;
  rankName: string;
  highCards: number[]; // 킥커 비교용
  score: number; // 종합 점수 (비교용)
}

// 프리플랍 핸드 랭킹 (스타팅 핸드)
export interface StartingHandRank {
  cards: [Card, Card];
  tier: number; // 1~8 (1이 가장 강함)
  name: string; // AA, AKs, AKo 등
}

// 승률 계산 결과
export interface WinRateResult {
  playerWinRate: number;
  computerWinRate: number;
  tieRate: number;
  totalCombinations: number;
  playerWins: number;
  computerWins: number;
  ties: number;
}

// 게임 라운드
export type GameRound = 'preflop' | 'flop' | 'turn' | 'river';

// 난이도
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'god';

// 난이도별 설정
export interface DifficultyConfig {
  name: string;
  nameKo: string;
  inputType: 'choice' | 'range' | 'input';
  tolerance?: number; // 오차 허용 범위 (%)
  timeLimit: number; // 초
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    nameKo: '쉬움',
    inputType: 'choice',
    timeLimit: 60,
  },
  normal: {
    name: 'Normal',
    nameKo: '보통',
    inputType: 'range',
    timeLimit: 60,
  },
  hard: {
    name: 'Hard',
    nameKo: '어려움',
    inputType: 'input',
    tolerance: 5,
    timeLimit: 60,
  },
  expert: {
    name: 'Expert',
    nameKo: '전문가',
    inputType: 'input',
    tolerance: 3,
    timeLimit: 60,
  },
  god: {
    name: 'God of Holdem',
    nameKo: '홀덤의 신',
    inputType: 'input',
    tolerance: 1,
    timeLimit: 60,
  },
};

// 프리플랍 제한시간은 별도
export const PREFLOP_TIME_LIMIT = 5;
