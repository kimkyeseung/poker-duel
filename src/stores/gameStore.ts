'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  Difficulty,
  GameRound,
  GameState,
  WinRateResult,
  AnswerResult,
  DIFFICULTY_CONFIG,
  PREFLOP_TIME_LIMIT,
  initialGameState,
  OPPONENT_CONFIGS,
  OpponentType,
} from '@/types';
import {
  createDeck,
  shuffleDeck,
  seededShuffleDeck,
  getDailySeed,
} from '@/lib/poker';
import { isSameStrength } from '@/lib/poker/starting-hands';
import { generateOpponentHand } from '@/lib/poker/hand-matcher';

interface GameStore extends GameState {
  // 액션
  initGame: (difficulty: Difficulty, isDaily?: boolean) => void;
  startRound: () => void;
  submitAnswer: (answer: string | number, winRateResult: WinRateResult) => void;
  nextRound: () => void;
  nextDifficulty: () => void;
  nextOpponent: () => void;  // 다음 상대로 전환
  defeatCurrentOpponent: () => void;  // 현재 상대 패배 처리
  gameOver: (message: string) => void;
  victory: () => void;
  resetGame: () => void;

  // 타이머
  startTimer: () => void;
  stopTimer: () => void;
  decrementTimer: () => void;

  // 카드 공개
  revealFlop: () => void;
  revealTurn: () => void;
  revealRiver: () => void;

  // 카드 공개 애니메이션
  isRevealingCards: boolean;
  startCardReveal: () => void;
  endCardReveal: () => void;

  // 유틸
  getTimeLimit: () => number;
  shouldSkipPreflop: () => boolean;
  getCurrentOpponent: () => typeof OPPONENT_CONFIGS[number] | null;
  isLastOpponent: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,
  isRevealingCards: false,

  // 게임 초기화
  initGame: (difficulty: Difficulty, isDaily = false) => {
    const gameId = uuidv4();
    let deck: Card[];

    if (isDaily) {
      // 일일 챌린지: 날짜 기반 시드
      const seed = getDailySeed();
      deck = seededShuffleDeck(createDeck(), seed);
    } else {
      deck = shuffleDeck(createDeck());
    }

    // 플레이어 카드 배분
    const playerHand: [Card, Card] = [deck[0], deck[1]];
    const remainingAfterPlayer = deck.slice(2);

    // 첫 번째 상대 (opponent1) 핸드 생성
    const firstOpponentType: OpponentType = OPPONENT_CONFIGS[0].type;
    const computerHand = generateOpponentHand(
      firstOpponentType,
      playerHand,
      remainingAfterPlayer
    ) || [remainingAfterPlayer[0], remainingAfterPlayer[1]];

    // 상대 카드 제외한 덱
    const remainingDeck = remainingAfterPlayer.filter(
      (card) =>
        !computerHand.some((c) => c.suit === card.suit && c.rank === card.rank)
    );

    set({
      ...initialGameState,
      gameId,
      difficulty,
      status: 'playing',
      currentRound: 'preflop',
      playerHand,
      computerHand,
      deck: remainingDeck,
      communityCards: [],
      currentOpponentIndex: 0,
      opponentsDefeated: [false, false, false, false, false],
      timeRemaining: PREFLOP_TIME_LIMIT,
    });
  },

  // 라운드 시작
  startRound: () => {
    const state = get();
    const timeLimit = state.getTimeLimit();

    set({
      status: 'answering',
      timeRemaining: timeLimit,
      isTimerRunning: true,
    });
  },

  // 정답 제출
  submitAnswer: (answer: string | number, winRateResult: WinRateResult) => {
    const state = get();
    const { currentRound, difficulty, answers } = state;

    // 정답 확인은 외부에서 처리 후 isCorrect 전달
    const result: AnswerResult = {
      round: currentRound,
      playerAnswer: answer,
      correctAnswer: winRateResult.playerWinRate,
      isCorrect: true, // 임시, checkAnswer로 검증
      winRateResult,
    };

    set({
      answers: [...answers, result],
      winRateResult,
      isTimerRunning: false,
    });
  },

  // 다음 라운드
  nextRound: () => {
    const state = get();
    const { currentRound, deck, communityCards } = state;

    const roundOrder: GameRound[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = roundOrder.indexOf(currentRound);

    if (currentIndex < roundOrder.length - 1) {
      const nextRound = roundOrder[currentIndex + 1];

      // 커뮤니티 카드 추가
      let newCommunityCards = [...communityCards];
      let newDeck = [...deck];

      if (nextRound === 'flop') {
        // 번 카드 1장 + 플랍 3장
        newCommunityCards = [deck[1], deck[2], deck[3]];
        newDeck = deck.slice(4);
      } else if (nextRound === 'turn') {
        // 번 카드 1장 + 턴 1장
        newCommunityCards = [...communityCards, deck[1]];
        newDeck = deck.slice(2);
      } else if (nextRound === 'river') {
        // 번 카드 1장 + 리버 1장
        newCommunityCards = [...communityCards, deck[1]];
        newDeck = deck.slice(2);
      }

      set({
        currentRound: nextRound,
        communityCards: newCommunityCards,
        deck: newDeck,
        status: 'playing',
        winRateResult: null,
      });
    }
  },

  // 다음 난이도
  nextDifficulty: () => {
    const state = get();
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'god'];
    const currentIndex = difficulties.indexOf(state.difficulty);

    if (currentIndex < difficulties.length - 1) {
      const nextDifficultyLevel = difficulties[currentIndex + 1];
      get().initGame(nextDifficultyLevel);
    } else {
      // 모든 난이도 클리어
      get().victory();
    }
  },

  // 다음 상대로 전환
  nextOpponent: () => {
    const state = get();
    const { currentOpponentIndex, playerHand, deck } = state;

    const nextIndex = currentOpponentIndex + 1;

    // 마지막 상대 (딜러)를 이겼으면 다음 난이도로
    if (nextIndex >= OPPONENT_CONFIGS.length) {
      get().nextDifficulty();
      return;
    }

    if (!playerHand) return;

    // 다음 상대 핸드 생성
    const nextOpponentType = OPPONENT_CONFIGS[nextIndex].type;
    const newOpponentHand = generateOpponentHand(
      nextOpponentType,
      playerHand,
      deck
    ) || [deck[0], deck[1]];

    // 상대 카드 제외한 덱
    const newDeck = deck.filter(
      (card) =>
        !newOpponentHand.some((c) => c.suit === card.suit && c.rank === card.rank)
    );

    set({
      currentOpponentIndex: nextIndex,
      computerHand: newOpponentHand,
      deck: newDeck,
      currentRound: 'preflop',
      communityCards: [],
      status: 'playing',
      winRateResult: null,
      answers: [],
      timeRemaining: PREFLOP_TIME_LIMIT,
    });
  },

  // 현재 상대 패배 처리
  defeatCurrentOpponent: () => {
    const state = get();
    const { currentOpponentIndex, opponentsDefeated } = state;

    const newOpponentsDefeated = [...opponentsDefeated];
    newOpponentsDefeated[currentOpponentIndex] = true;

    set({
      opponentsDefeated: newOpponentsDefeated,
    });
  },

  // 게임 오버
  gameOver: (message: string) => {
    set({
      status: 'gameover',
      finalMessage: message,
      isTimerRunning: false,
      isVictory: false,
    });
  },

  // 승리 (모든 난이도 클리어)
  victory: () => {
    set({
      status: 'victory',
      finalMessage: '축하합니다! 홀덤의 신을 클리어했습니다!',
      isTimerRunning: false,
      isVictory: true,
    });
  },

  // 게임 리셋
  resetGame: () => {
    set(initialGameState);
  },

  // 타이머 시작
  startTimer: () => {
    set({ isTimerRunning: true });
  },

  // 타이머 정지
  stopTimer: () => {
    set({ isTimerRunning: false });
  },

  // 타이머 감소 (0.1초 단위)
  decrementTimer: () => {
    const state = get();
    if (state.timeRemaining > 0) {
      set({ timeRemaining: Math.max(0, state.timeRemaining - 0.1) });
    }
  },

  // 플랍 공개
  revealFlop: () => {
    const state = get();
    const { deck } = state;
    // 번 카드 1장 + 플랍 3장
    const flop = [deck[1], deck[2], deck[3]];
    set({
      communityCards: flop,
      deck: deck.slice(4),
    });
  },

  // 턴 공개
  revealTurn: () => {
    const state = get();
    const { deck, communityCards } = state;
    // 번 카드 1장 + 턴 1장
    set({
      communityCards: [...communityCards, deck[1]],
      deck: deck.slice(2),
    });
  },

  // 리버 공개
  revealRiver: () => {
    const state = get();
    const { deck, communityCards } = state;
    // 번 카드 1장 + 리버 1장
    set({
      communityCards: [...communityCards, deck[1]],
      deck: deck.slice(2),
    });
  },

  // 카드 공개 애니메이션 시작
  startCardReveal: () => {
    set({ isRevealingCards: true });
  },

  // 카드 공개 애니메이션 종료
  endCardReveal: () => {
    set({ isRevealingCards: false });
  },

  // 현재 라운드의 제한 시간
  getTimeLimit: () => {
    const state = get();
    if (state.currentRound === 'preflop') {
      return PREFLOP_TIME_LIMIT;
    }
    return DIFFICULTY_CONFIG[state.difficulty].timeLimit;
  },

  // 프리플랍 스킵 여부 (같은 핸드)
  shouldSkipPreflop: () => {
    const state = get();
    if (!state.playerHand || !state.computerHand) return false;
    return isSameStrength(state.playerHand, state.computerHand);
  },

  // 현재 상대 정보 반환
  getCurrentOpponent: () => {
    const state = get();
    return OPPONENT_CONFIGS[state.currentOpponentIndex] || null;
  },

  // 마지막 상대(딜러)인지 확인
  isLastOpponent: () => {
    const state = get();
    return state.currentOpponentIndex === OPPONENT_CONFIGS.length - 1;
  },
}));
