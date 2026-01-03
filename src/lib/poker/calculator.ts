import { Card, WinRateResult } from '@/types';
import { createDeck, excludeCards } from './deck';
import { evaluateBestHand, compareHands } from './evaluator';

// 조합 생성 유틸리티
function* combinations<T>(arr: T[], r: number): Generator<T[]> {
  if (r === 0) {
    yield [];
    return;
  }
  if (arr.length < r) return;

  for (let i = 0; i <= arr.length - r; i++) {
    for (const combo of combinations(arr.slice(i + 1), r - 1)) {
      yield [arr[i], ...combo];
    }
  }
}

// 완전 탐색으로 승률 계산
export function calculateWinRate(
  playerHand: [Card, Card],
  computerHand: [Card, Card],
  communityCards: Card[]
): WinRateResult {
  // 이미 사용된 카드 제외
  const usedCards = [...playerHand, ...computerHand, ...communityCards];
  const remainingDeck = excludeCards(createDeck(), usedCards);

  // 필요한 커뮤니티 카드 수
  const neededCards = 5 - communityCards.length;

  let playerWins = 0;
  let computerWins = 0;
  let ties = 0;
  let totalCombinations = 0;

  // 모든 가능한 커뮤니티 카드 조합
  for (const combo of combinations(remainingDeck, neededCards)) {
    const fullCommunity = [...communityCards, ...combo];

    // 각 플레이어의 최고 핸드 평가
    const playerCards = [...playerHand, ...fullCommunity];
    const computerCards = [...computerHand, ...fullCommunity];

    const playerEval = evaluateBestHand(playerCards);
    const computerEval = evaluateBestHand(computerCards);

    // 비교
    const result = compareHands(playerEval, computerEval);

    if (result < 0) {
      playerWins++;
    } else if (result > 0) {
      computerWins++;
    } else {
      ties++;
    }

    totalCombinations++;
  }

  // 승률 계산
  const playerWinRate = (playerWins / totalCombinations) * 100;
  const computerWinRate = (computerWins / totalCombinations) * 100;
  const tieRate = (ties / totalCombinations) * 100;

  return {
    playerWinRate,
    computerWinRate,
    tieRate,
    totalCombinations,
    playerWins,
    computerWins,
    ties,
  };
}

// 플랍 상태에서 승률 계산 (990 조합)
export function calculateWinRateFlop(
  playerHand: [Card, Card],
  computerHand: [Card, Card],
  flop: [Card, Card, Card]
): WinRateResult {
  return calculateWinRate(playerHand, computerHand, flop);
}

// 턴 상태에서 승률 계산 (44 조합)
export function calculateWinRateTurn(
  playerHand: [Card, Card],
  computerHand: [Card, Card],
  community: [Card, Card, Card, Card]
): WinRateResult {
  return calculateWinRate(playerHand, computerHand, community);
}

// 리버 상태에서 승률 계산 (확정)
export function calculateWinRateRiver(
  playerHand: [Card, Card],
  computerHand: [Card, Card],
  community: [Card, Card, Card, Card, Card]
): WinRateResult {
  const playerCards = [...playerHand, ...community];
  const computerCards = [...computerHand, ...community];

  const playerEval = evaluateBestHand(playerCards);
  const computerEval = evaluateBestHand(computerCards);

  const result = compareHands(playerEval, computerEval);

  if (result < 0) {
    return {
      playerWinRate: 100,
      computerWinRate: 0,
      tieRate: 0,
      totalCombinations: 1,
      playerWins: 1,
      computerWins: 0,
      ties: 0,
    };
  } else if (result > 0) {
    return {
      playerWinRate: 0,
      computerWinRate: 100,
      tieRate: 0,
      totalCombinations: 1,
      playerWins: 0,
      computerWins: 1,
      ties: 0,
    };
  } else {
    return {
      playerWinRate: 0,
      computerWinRate: 0,
      tieRate: 100,
      totalCombinations: 1,
      playerWins: 0,
      computerWins: 0,
      ties: 1,
    };
  }
}

// 승률 비교 결과
export interface WinRateComparison {
  playerFavorite: boolean;
  computerFavorite: boolean;
  isTie: boolean;
  difference: number;
}

// 누가 유리한지 비교
export function compareWinRates(result: WinRateResult): WinRateComparison {
  const { playerWinRate, computerWinRate } = result;

  return {
    playerFavorite: playerWinRate > computerWinRate,
    computerFavorite: computerWinRate > playerWinRate,
    isTie: Math.abs(playerWinRate - computerWinRate) < 0.01,
    difference: Math.abs(playerWinRate - computerWinRate),
  };
}

// 정답 검증
export function checkAnswer(
  difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'god',
  playerAnswer: string | number,
  winRateResult: WinRateResult
): boolean {
  const { playerWinRate, computerWinRate } = winRateResult;

  switch (difficulty) {
    case 'easy':
      // 누가 유리한지 맞추기
      if (playerAnswer === 'player') {
        return playerWinRate >= computerWinRate;
      } else if (playerAnswer === 'computer') {
        return computerWinRate > playerWinRate;
      }
      return false;

    case 'normal':
      // 5지선다 (자신의 승률 구간)
      const ranges = ['0-20', '20-40', '40-60', '60-80', '80-100'];
      const correctRange = getRangeForWinRate(playerWinRate);
      return playerAnswer === correctRange;

    case 'hard':
      // 직접 입력, ±5% 오차
      return Math.abs(Number(playerAnswer) - playerWinRate) <= 5;

    case 'expert':
      // 직접 입력, ±3% 오차
      return Math.abs(Number(playerAnswer) - playerWinRate) <= 3;

    case 'god':
      // 직접 입력, ±1% 오차
      return Math.abs(Number(playerAnswer) - playerWinRate) <= 1;

    default:
      return false;
  }
}

// 승률에 해당하는 구간 반환
function getRangeForWinRate(winRate: number): string {
  if (winRate < 20) return '0-20';
  if (winRate < 40) return '20-40';
  if (winRate < 60) return '40-60';
  if (winRate < 80) return '60-80';
  return '80-100';
}
