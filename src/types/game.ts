import { Card, Difficulty, GameRound, WinRateResult } from './poker';

// 게임 상태
export type GameStatus = 'waiting' | 'playing' | 'answering' | 'result' | 'gameover' | 'victory';

// 플레이어 타입
export type PlayerType = 'player' | 'computer';

// 정답 결과
export interface AnswerResult {
  round: GameRound;
  playerAnswer: string | number;
  correctAnswer: number;
  isCorrect: boolean;
  winRateResult: WinRateResult;
}

// 게임 상태
export interface GameState {
  // 게임 ID
  gameId: string;

  // 난이도
  difficulty: Difficulty;

  // 현재 상태
  status: GameStatus;

  // 현재 라운드
  currentRound: GameRound;

  // 카드
  playerHand: [Card, Card] | null;
  computerHand: [Card, Card] | null;
  communityCards: Card[];
  deck: Card[];

  // 결과
  winRateResult: WinRateResult | null;
  answers: AnswerResult[];

  // 타이머
  timeRemaining: number;
  isTimerRunning: boolean;

  // 게임 결과
  isVictory: boolean;
  finalMessage: string;
}

// 게임 통계
export interface GameStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  maxStreak: number;
  currentStreak: number;
  difficultyStats: Record<Difficulty, {
    played: number;
    cleared: number;
  }>;
  achievements: string[];
  currentTitle: string;
  handHistory: HandRecord[];
  dailyChallengeHistory: Record<string, DailyChallengeRecord>;
}

// 핸드 기록
export interface HandRecord {
  id: string;
  date: string;
  difficulty: Difficulty;
  playerHand: [Card, Card];
  computerHand: [Card, Card];
  communityCards: Card[];
  winRateResult: WinRateResult;
  answers: AnswerResult[];
  isVictory: boolean;
}

// 일일 챌린지 기록
export interface DailyChallengeRecord {
  date: string;
  completed: boolean;
  difficulty: Difficulty;
  isVictory: boolean;
  answers: AnswerResult[];
}

// 칭호 정의
export interface Title {
  id: string;
  name: string;
  description: string;
  condition: () => boolean;
  icon: string;
}

// 도전과제 정의
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

// 엔딩 코멘트
export interface EndingComment {
  id: string;
  author: string;
  content: string;
  date: string;
  difficulty: Difficulty;
}

// 초기 게임 상태
export const initialGameState: GameState = {
  gameId: '',
  difficulty: 'easy',
  status: 'waiting',
  currentRound: 'preflop',
  playerHand: null,
  computerHand: null,
  communityCards: [],
  deck: [],
  winRateResult: null,
  answers: [],
  timeRemaining: 10,
  isTimerRunning: false,
  isVictory: false,
  finalMessage: '',
};

// 초기 통계
export const initialGameStats: GameStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  maxStreak: 0,
  currentStreak: 0,
  difficultyStats: {
    easy: { played: 0, cleared: 0 },
    normal: { played: 0, cleared: 0 },
    hard: { played: 0, cleared: 0 },
    expert: { played: 0, cleared: 0 },
    god: { played: 0, cleared: 0 },
  },
  achievements: [],
  currentTitle: 'beginner',
  handHistory: [],
  dailyChallengeHistory: {},
};
