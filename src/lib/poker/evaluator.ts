import { Card, HandRank, HandEvaluation } from '@/types';
import { rankToNumber, SUITS } from './deck';

// 핸드 랭크 이름
const HAND_RANK_NAMES: Record<HandRank, string> = {
  [HandRank.HIGH_CARD]: '하이 카드',
  [HandRank.ONE_PAIR]: '원 페어',
  [HandRank.TWO_PAIR]: '투 페어',
  [HandRank.THREE_OF_A_KIND]: '트리플',
  [HandRank.STRAIGHT]: '스트레이트',
  [HandRank.FLUSH]: '플러시',
  [HandRank.FULL_HOUSE]: '풀 하우스',
  [HandRank.FOUR_OF_A_KIND]: '포카드',
  [HandRank.STRAIGHT_FLUSH]: '스트레이트 플러시',
  [HandRank.ROYAL_FLUSH]: '로얄 플러시',
};

// 7장에서 최고의 5장 조합 찾기
export function evaluateBestHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('최소 5장의 카드가 필요합니다');
  }

  if (cards.length === 5) {
    return evaluateFiveCards(cards);
  }

  // 7장에서 5장 조합 생성 (C(7,5) = 21가지)
  const combinations = getCombinations(cards, 5);
  let bestHand: HandEvaluation | null = null;

  for (const combo of combinations) {
    const evaluation = evaluateFiveCards(combo);
    if (!bestHand || evaluation.score > bestHand.score) {
      bestHand = evaluation;
    }
  }

  return bestHand!;
}

// 5장 핸드 평가
function evaluateFiveCards(cards: Card[]): HandEvaluation {
  const ranks = cards.map(c => rankToNumber(c.rank)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(ranks);
  const isWheelStraight = checkWheelStraight(ranks);

  const rankCounts = getRankCounts(ranks);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  let rank: HandRank;
  let highCards: number[];

  // 로얄 플러시
  if (isFlush && isStraight && ranks[0] === 14) {
    rank = HandRank.ROYAL_FLUSH;
    highCards = ranks;
  }
  // 스트레이트 플러시
  else if (isFlush && (isStraight || isWheelStraight)) {
    rank = HandRank.STRAIGHT_FLUSH;
    highCards = isWheelStraight ? [5, 4, 3, 2, 1] : ranks;
  }
  // 포카드
  else if (counts[0] === 4) {
    rank = HandRank.FOUR_OF_A_KIND;
    highCards = getHighCardsForCounts(rankCounts, [4, 1]);
  }
  // 풀하우스
  else if (counts[0] === 3 && counts[1] === 2) {
    rank = HandRank.FULL_HOUSE;
    highCards = getHighCardsForCounts(rankCounts, [3, 2]);
  }
  // 플러시
  else if (isFlush) {
    rank = HandRank.FLUSH;
    highCards = ranks;
  }
  // 스트레이트
  else if (isStraight || isWheelStraight) {
    rank = HandRank.STRAIGHT;
    highCards = isWheelStraight ? [5, 4, 3, 2, 1] : ranks;
  }
  // 트리플
  else if (counts[0] === 3) {
    rank = HandRank.THREE_OF_A_KIND;
    highCards = getHighCardsForCounts(rankCounts, [3, 1, 1]);
  }
  // 투페어
  else if (counts[0] === 2 && counts[1] === 2) {
    rank = HandRank.TWO_PAIR;
    highCards = getHighCardsForCounts(rankCounts, [2, 2, 1]);
  }
  // 원페어
  else if (counts[0] === 2) {
    rank = HandRank.ONE_PAIR;
    highCards = getHighCardsForCounts(rankCounts, [2, 1, 1, 1]);
  }
  // 하이카드
  else {
    rank = HandRank.HIGH_CARD;
    highCards = ranks;
  }

  return {
    rank,
    rankName: HAND_RANK_NAMES[rank],
    highCards,
    score: calculateScore(rank, highCards),
  };
}

// 스트레이트 체크
function checkStraight(ranks: number[]): boolean {
  const sorted = [...ranks].sort((a, b) => b - a);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] - sorted[i + 1] !== 1) {
      return false;
    }
  }
  return true;
}

// A-2-3-4-5 스트레이트 (휠) 체크
function checkWheelStraight(ranks: number[]): boolean {
  const sorted = [...ranks].sort((a, b) => b - a);
  return (
    sorted[0] === 14 &&
    sorted[1] === 5 &&
    sorted[2] === 4 &&
    sorted[3] === 3 &&
    sorted[4] === 2
  );
}

// 랭크별 카운트
function getRankCounts(ranks: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const rank of ranks) {
    counts[rank] = (counts[rank] || 0) + 1;
  }
  return counts;
}

// 카운트 패턴에 맞는 하이카드 정렬
function getHighCardsForCounts(
  rankCounts: Record<number, number>,
  pattern: number[]
): number[] {
  const entries = Object.entries(rankCounts)
    .map(([rank, count]) => ({ rank: parseInt(rank), count }))
    .sort((a, b) => {
      // 카운트 우선, 같으면 랭크 순
      if (a.count !== b.count) return b.count - a.count;
      return b.rank - a.rank;
    });

  const result: number[] = [];
  let patternIndex = 0;

  for (const entry of entries) {
    if (patternIndex < pattern.length && entry.count === pattern[patternIndex]) {
      result.push(entry.rank);
      patternIndex++;
    } else if (entry.count === 1 && pattern.includes(1)) {
      result.push(entry.rank);
    }
  }

  return result;
}

// 종합 점수 계산 (비교용)
function calculateScore(rank: HandRank, highCards: number[]): number {
  // 랭크 * 15^5 + highCard[0] * 15^4 + highCard[1] * 15^3 + ...
  let score = rank * Math.pow(15, 5);
  for (let i = 0; i < highCards.length && i < 5; i++) {
    score += highCards[i] * Math.pow(15, 4 - i);
  }
  return score;
}

// 조합 생성 (nCr)
function getCombinations<T>(arr: T[], r: number): T[][] {
  const result: T[][] = [];

  function combine(start: number, combo: T[]) {
    if (combo.length === r) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return result;
}

// 두 핸드 비교 (-1: a 승, 0: 무승부, 1: b 승)
export function compareHands(a: HandEvaluation, b: HandEvaluation): number {
  if (a.score > b.score) return -1;
  if (a.score < b.score) return 1;
  return 0;
}
