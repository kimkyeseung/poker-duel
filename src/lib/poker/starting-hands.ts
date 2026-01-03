import { Card } from '@/types';
import { rankToNumber } from './deck';

// 프리플랍 핸드 랭킹 (Chen Formula 기반 + 커스텀 조정)
// 높을수록 강한 핸드

export interface StartingHandInfo {
  name: string;
  score: number;
  tier: number; // 1~8 (1이 가장 강함)
}

// 스타팅 핸드 점수 계산 (Chen Formula 변형)
export function evaluateStartingHand(cards: [Card, Card]): StartingHandInfo {
  const [card1, card2] = cards;
  const rank1 = rankToNumber(card1.rank);
  const rank2 = rankToNumber(card2.rank);
  const suited = card1.suit === card2.suit;
  const isPair = rank1 === rank2;

  // 카드 정렬 (높은 것 먼저)
  const high = Math.max(rank1, rank2);
  const low = Math.min(rank1, rank2);
  const gap = high - low;

  let score = 0;

  // 기본 점수 (높은 카드 기준)
  if (high === 14) score = 10; // A
  else if (high === 13) score = 8; // K
  else if (high === 12) score = 7; // Q
  else if (high === 11) score = 6; // J
  else score = high / 2; // 2~10

  // 페어 보너스
  if (isPair) {
    score *= 2;
    if (score < 5) score = 5; // 최소 5점
  }

  // 수트 보너스
  if (suited && !isPair) {
    score += 2;
  }

  // 갭 페널티
  if (!isPair) {
    if (gap === 1) score -= 1;
    else if (gap === 2) score -= 2;
    else if (gap === 3) score -= 4;
    else if (gap >= 4) score -= 5;
  }

  // 스트레이트 가능성 보너스 (둘 다 5 이상이고 갭이 4 이하)
  if (!isPair && high <= 14 && low >= 2 && gap <= 4) {
    if (high <= 11) score += 1; // 양쪽 스트레이트 가능
  }

  // 최소 점수 보장
  score = Math.max(score, 0);

  // 핸드 이름 생성
  const name = getHandName(cards);

  // 티어 계산
  const tier = calculateTier(score, isPair, high);

  return { name, score, tier };
}

// 핸드 이름 생성 (예: AKs, QJo, 77)
function getHandName(cards: [Card, Card]): string {
  const [card1, card2] = cards;
  const rank1 = card1.rank;
  const rank2 = card2.rank;
  const suited = card1.suit === card2.suit;
  const isPair = rank1 === rank2;

  const r1 = rankToNumber(card1.rank);
  const r2 = rankToNumber(card2.rank);

  const highRank = r1 >= r2 ? rank1 : rank2;
  const lowRank = r1 >= r2 ? rank2 : rank1;

  if (isPair) {
    return `${highRank}${highRank}`;
  }

  return `${highRank}${lowRank}${suited ? 's' : 'o'}`;
}

// 티어 계산
function calculateTier(score: number, isPair: boolean, highCard: number): number {
  // 프리미엄 핸드 (AA, KK, QQ, AKs)
  if (score >= 18) return 1;

  // 강한 핸드 (JJ, TT, AK, AQs)
  if (score >= 14) return 2;

  // 좋은 핸드 (99, 88, AJ, KQs)
  if (score >= 11) return 3;

  // 괜찮은 핸드 (77, 66, AT, KJs)
  if (score >= 8) return 4;

  // 중간 핸드 (55, 44, A9s, KT)
  if (score >= 6) return 5;

  // 약한 핸드 (33, 22, 수티드 커넥터)
  if (score >= 4) return 6;

  // 매우 약한 핸드
  if (score >= 2) return 7;

  // 최하위 핸드
  return 8;
}

// 두 스타팅 핸드 비교 (프리플랍용)
// 반환: -1 (hand1 승), 0 (동등), 1 (hand2 승)
export function compareStartingHands(
  hand1: [Card, Card],
  hand2: [Card, Card]
): number {
  const info1 = evaluateStartingHand(hand1);
  const info2 = evaluateStartingHand(hand2);

  // 점수가 높은 쪽이 유리
  if (info1.score > info2.score) return -1;
  if (info1.score < info2.score) return 1;

  // 점수가 같으면 동등
  return 0;
}

// 두 핸드가 동일한 강도인지 확인
export function isSameStrength(hand1: [Card, Card], hand2: [Card, Card]): boolean {
  const info1 = evaluateStartingHand(hand1);
  const info2 = evaluateStartingHand(hand2);

  // 이름이 같으면 동일 (예: AKs vs AKs)
  return info1.name === info2.name;
}
