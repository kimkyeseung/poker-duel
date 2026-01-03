'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  Difficulty,
  GameRound,
  GameState,
  GameStatus,
  WinRateResult,
  AnswerResult,
  DIFFICULTY_CONFIG,
  PREFLOP_TIME_LIMIT,
  initialGameState,
} from '@/types';
import {
  createDeck,
  shuffleDeck,
  seededShuffleDeck,
  getDailySeed,
} from '@/lib/poker';
import { isSameStrength } from '@/lib/poker/starting-hands';

interface GameStore extends GameState {
  // 액션
  initGame: (difficulty: Difficulty, isDaily?: boolean) => void;
  startRound: () => void;
  submitAnswer: (answer: string | number, winRateResult: WinRateResult) => void;
  nextRound: () => void;
  nextDifficulty: () => void;
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

  // 유틸
  getTimeLimit: () => number;
  shouldSkipPreflop: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

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

    // 카드 배분
    const playerHand: [Card, Card] = [deck[0], deck[1]];
    const computerHand: [Card, Card] = [deck[2], deck[3]];
    const remainingDeck = deck.slice(4);

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
      const nextDifficulty = difficulties[currentIndex + 1];
      get().initGame(nextDifficulty);
    } else {
      // 모든 난이도 클리어
      get().victory();
    }
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

  // 타이머 감소
  decrementTimer: () => {
    const state = get();
    if (state.timeRemaining > 0) {
      set({ timeRemaining: state.timeRemaining - 1 });
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
}));
