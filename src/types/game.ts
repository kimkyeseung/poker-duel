import { Card, Difficulty, GameRound, WinRateResult } from './poker';

// 게임 상태
export type GameStatus = 'waiting' | 'playing' | 'answering' | 'result' | 'gameover' | 'victory';

// 상대 타입 (5명의 상대)
export type OpponentType = 'opponent1' | 'opponent2' | 'smallBlind' | 'bigBlind' | 'dealer';

// 핸드 매칭 규칙
export type HandMatchingRule = 'random' | 'range30' | 'range15' | 'range5';

// 상대 설정
export interface OpponentConfig {
  type: OpponentType;
  label: string;
  labelKey: string;  // i18n key
  profileImage: string;
  handMatchingRule: HandMatchingRule;
  filterVisuallyObvious: boolean;  // 눈에 띄는 차이 필터링 여부
}

// 상대 설정 배열 (순서대로)
export const OPPONENT_CONFIGS: OpponentConfig[] = [
  {
    type: 'opponent1',
    label: 'Opponent 1',
    labelKey: 'game.opponents.opponent1',
    profileImage: '/profiles/opponent1.png',
    handMatchingRule: 'random',
    filterVisuallyObvious: false,
  },
  {
    type: 'opponent2',
    label: 'Opponent 2',
    labelKey: 'game.opponents.opponent2',
    profileImage: '/profiles/opponent2.png',
    handMatchingRule: 'random',
    filterVisuallyObvious: false,
  },
  {
    type: 'smallBlind',
    label: 'Small Blind',
    labelKey: 'game.opponents.smallBlind',
    profileImage: '/profiles/small-blind.png',
    handMatchingRule: 'range30',
    filterVisuallyObvious: false,
  },
  {
    type: 'bigBlind',
    label: 'Big Blind',
    labelKey: 'game.opponents.bigBlind',
    profileImage: '/profiles/big-blind.png',
    handMatchingRule: 'range15',
    filterVisuallyObvious: true,
  },
  {
    type: 'dealer',
    label: 'Dealer',
    labelKey: 'game.opponents.dealer',
    profileImage: '/profiles/dealer.png',
    handMatchingRule: 'range5',
    filterVisuallyObvious: true,
  },
];

// 핸드 순위 정보 (프리플랍용)
export interface HandRankInfo {
  name: string;
  rank: number; // 1~169 순위
}

// 정답 결과
export interface AnswerResult {
  round: GameRound;
  playerAnswer: string | number;
  correctAnswer: string | number; // 프리플랍: 'player'|'computer', 그 외: 승률 숫자
  isCorrect: boolean;
  winRateResult: WinRateResult;
  playerHandRank?: HandRankInfo; // 프리플랍 핸드 순위
  computerHandRank?: HandRankInfo; // 프리플랍 핸드 순위
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
  computerHand: [Card, Card] | null;  // 현재 상대의 핸드 (하위 호환성 유지)
  communityCards: Card[];
  deck: Card[];

  // 다중 상대 시스템
  currentOpponentIndex: number;  // 0~4 (5명의 상대)
  opponentsDefeated: boolean[];  // 각 상대 패배 여부

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
  currentOpponentIndex: 0,
  opponentsDefeated: [false, false, false, false, false],
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
    king: { played: 0, cleared: 0 },
    god: { played: 0, cleared: 0 },
  },
  achievements: [],
  currentTitle: 'beginner',
  handHistory: [],
  dailyChallengeHistory: {},
};
