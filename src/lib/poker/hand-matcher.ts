/**
 * 핸드 매칭 로직
 *
 * 상대별 핸드 생성 및 "눈에 띄는 차이" 필터링
 */

import { Card, Rank, Suit, HandMatchingRule, OPPONENT_CONFIGS, OpponentType } from '@/types';
import { evaluateStartingHand } from './starting-hands';

// 169개 핸드 랭킹 리스트 (1위 AA ~ 169위 72o)
export const HAND_RANKING_LIST: string[] = [
  // 1-10위
  'AA', 'KK', 'QQ', 'AKs', 'JJ',
  'AQs', 'KQs', 'AJs', 'KJs', 'TT',
  // 11-20위
  'AKo', 'ATs', 'QJs', 'KTs', 'QTs',
  'JTs', '99', 'AQo', 'A9s', 'KQo',
  // 21-30위
  '88', 'K9s', 'T9s', 'A8s', 'Q9s',
  'J9s', 'AJo', 'A5s', '77', 'A7s',
  // 31-40위
  'KJo', 'A4s', 'A3s', 'A6s', 'QJo',
  '66', 'K8s', 'T8s', 'A2s', '98s',
  // 41-50위
  'J8s', 'ATo', 'Q8s', 'K7s', 'KTo',
  '55', 'JTo', '87s', 'QTo', '44',
  // 51-60위
  '33', '22', 'K6s', '97s', 'K5s',
  '76s', 'T7s', 'K4s', 'K3s', 'K2s',
  // 61-70위
  'Q7s', '86s', '65s', 'J7s', '54s',
  'Q6s', '75s', '96s', 'Q5s', '64s',
  // 71-80위
  'Q4s', 'Q3s', 'T9o', 'T6s', 'Q2s',
  'A9o', '53s', '85s', 'J6s', 'J9o',
  // 81-90위
  'K9o', 'J5s', 'Q9o', '43s', '74s',
  'J4s', 'J3s', '95s', 'J2s', '63s',
  // 91-100위
  'A8o', '52s', 'T5s', '84s', 'T4s',
  'T3s', '42s', 'T2s', '98o', 'T8o',
  // 101-110위
  'A5o', 'A7o', '73s', 'A4o', '32s',
  '94s', '93s', 'J8o', 'A3o', '62s',
  // 111-120위
  '92s', 'K8o', 'A6o', '87o', 'Q8o',
  '83s', 'A2o', '82s', '97o', '72s',
  // 121-130위
  '76o', 'K7o', '65o', 'T7o', 'K6o',
  '86o', '54o', 'K5o', 'J7o', '75o',
  // 131-140위
  'Q7o', 'K4o', 'K3o', '96o', 'K2o',
  '64o', 'Q6o', '53o', '85o', 'T6o',
  // 141-150위
  'Q5o', '43o', 'Q4o', 'Q3o', '74o',
  'Q2o', 'J6o', '63o', 'J5o', '95o',
  // 151-160위
  '52o', 'J4o', 'J3o', '42o', 'J2o',
  '84o', 'T5o', 'T4o', '32o', 'T3o',
  // 161-169위
  '73o', 'T2o', '62o', '94o', '93o',
  '92o', '83o', '82o', '72o',
];

/**
 * 랭킹으로 핸드 이름 조회
 * @param rank 1~169 순위
 * @returns 핸드 이름 또는 null
 */
export function getHandNameByRank(rank: number): string | null {
  if (rank < 1 || rank > 169) {
    return null;
  }
  return HAND_RANKING_LIST[rank - 1];
}

/**
 * 핸드 이름으로 랭킹 조회
 * @param handName 핸드 이름 (예: 'AA', 'AKs')
 * @returns 1~169 순위 또는 -1
 */
export function getRankByHandName(handName: string): number {
  const index = HAND_RANKING_LIST.indexOf(handName);
  return index === -1 ? -1 : index + 1;
}

/**
 * 완전 랜덤 핸드 이름 반환
 */
export function getRandomHandName(): string {
  const randomIndex = Math.floor(Math.random() * HAND_RANKING_LIST.length);
  return HAND_RANKING_LIST[randomIndex];
}

/**
 * 플레이어 랭킹에서 ±range 범위 내의 랜덤 핸드 반환
 * @param playerRank 플레이어 핸드 랭킹 (1~169)
 * @param range 범위 (예: 30, 15, 5)
 */
export function getMatchedHandName(playerRank: number, range: number): string {
  const minRank = Math.max(1, playerRank - range);
  const maxRank = Math.min(169, playerRank + range);
  const randomRank = minRank + Math.floor(Math.random() * (maxRank - minRank + 1));
  return HAND_RANKING_LIST[randomRank - 1];
}

/**
 * 핸드 이름에서 카드 정보 파싱
 * @returns { highCard, lowCard, isPair, isSuited }
 */
function parseHandName(handName: string): {
  highCard: string;
  lowCard: string;
  isPair: boolean;
  isSuited: boolean;
} {
  const highCard = handName[0];
  const lowCard = handName[1];
  const isPair = highCard === lowCard;
  const isSuited = handName.endsWith('s');

  return { highCard, lowCard, isPair, isSuited };
}

/**
 * 카드 랭크를 숫자로 변환 (A=14, K=13, Q=12, J=11, T=10, 2-9=2-9)
 */
function cardRankToNumber(rank: string): number {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  if (rank === 'T') return 10;
  return parseInt(rank, 10);
}

/**
 * 두 핸드가 "눈에 띄게 다른지" 확인
 *
 * 눈에 띄는 차이 기준:
 * 1. 같은 킥커 + 높은 카드 차이 (K9s vs T9s)
 * 2. 높은 페어 vs 논페어 (AA vs AKs) - 단, 작은 페어(33)와 비슷한 랭킹 논페어(87s)는 헷갈림
 * 3. 같은 숫자 포함 시 차이가 눈에 띄는 경우 (A5s vs A3s)
 *
 * @returns true면 눈에 띄게 다름 (필터링 대상)
 */
export function isVisuallyObvious(hand1: string, hand2: string): boolean {
  // 같은 핸드면 눈에 띄지 않음
  if (hand1 === hand2) {
    return false;
  }

  const parsed1 = parseHandName(hand1);
  const parsed2 = parseHandName(hand2);

  // 페어 vs 페어 - 눈에 띄지 않음 (예: 77 vs 66)
  if (parsed1.isPair && parsed2.isPair) {
    return false;
  }

  // 페어 vs 논페어 판단
  if (parsed1.isPair !== parsed2.isPair) {
    const pairHand = parsed1.isPair ? parsed1 : parsed2;
    const nonPairHand = parsed1.isPair ? parsed2 : parsed1;

    const pairRank = cardRankToNumber(pairHand.highCard);
    const nonPairHighRank = cardRankToNumber(nonPairHand.highCard);

    // 논페어에 페어의 카드가 포함되어 있으면 눈에 띔 (예: 22 vs A2s, 77 vs A7s)
    if (nonPairHand.highCard === pairHand.highCard ||
        nonPairHand.lowCard === pairHand.highCard) {
      return true;
    }

    // 높은 페어 (TT=10 이상)는 항상 눈에 띔
    if (pairRank >= 10) {
      return true;
    }

    // 논페어에 페어보다 높은 카드가 있으면 헷갈림 (예: 33 vs 87s)
    if (nonPairHighRank > pairRank) {
      return false; // 헷갈림
    }

    // 그 외에는 헷갈림
    return false;
  }

  // 여기서부터는 둘 다 논페어

  // 2. 같은 높은 카드 + 다른 킥커 (예: A5s vs A3s, K9s vs K7s)
  if (parsed1.highCard === parsed2.highCard && parsed1.lowCard !== parsed2.lowCard) {
    return true;
  }

  // 3. 같은 킥커 + 다른 높은 카드 (예: K9s vs T9s)
  if (parsed1.lowCard === parsed2.lowCard && parsed1.highCard !== parsed2.highCard) {
    return true;
  }

  // 완전히 다른 카드들은 눈에 띄지 않음 (예: AKs vs 87s)
  // 비슷한 커넥터/갭퍼들도 눈에 띄지 않음 (예: 98s vs 87s)
  return false;
}

/**
 * 필터링 적용된 매칭 핸드 반환
 * 눈에 띄게 다른 핸드를 제외하고 범위 내 핸드 반환
 *
 * @param playerHand 플레이어 핸드 이름
 * @param playerRank 플레이어 핸드 랭킹
 * @param range 범위
 * @param maxAttempts 최대 시도 횟수 (기본 100)
 */
export function getFilteredMatchedHandName(
  playerHand: string,
  playerRank: number,
  range: number,
  maxAttempts: number = 100
): string {
  for (let i = 0; i < maxAttempts; i++) {
    const matchedHand = getMatchedHandName(playerRank, range);

    // 플레이어와 같은 핸드가 아니고, 눈에 띄지 않으면 반환
    if (matchedHand !== playerHand && !isVisuallyObvious(playerHand, matchedHand)) {
      return matchedHand;
    }
  }

  // 최대 시도 후에도 못 찾으면 범위 내 랜덤 반환 (폴백)
  return getMatchedHandName(playerRank, range);
}

// ============================================
// 실제 카드 생성 관련 함수
// ============================================

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * 핸드 이름의 랭크 문자를 실제 Rank 타입으로 변환
 */
function handRankCharToRank(char: string): Rank {
  if (char === 'T') return '10';
  return char as Rank;
}

/**
 * 핸드 이름에 맞는 카드 2장을 덱에서 찾아 반환
 * @param handName 핸드 이름 (예: 'AKs', '77', 'QJo')
 * @param availableCards 사용 가능한 카드들
 * @param excludeCards 제외할 카드들
 * @returns 카드 2장 또는 null (찾지 못한 경우)
 */
export function findCardsForHandName(
  handName: string,
  availableCards: Card[],
  excludeCards: Card[] = []
): [Card, Card] | null {
  const parsed = parseHandName(handName);
  const rank1 = handRankCharToRank(parsed.highCard);
  const rank2 = handRankCharToRank(parsed.lowCard);

  // 제외된 카드를 필터링
  const filteredCards = availableCards.filter(
    (card) => !excludeCards.some((ex) => ex.suit === card.suit && ex.rank === card.rank)
  );

  if (parsed.isPair) {
    // 페어: 같은 랭크의 다른 수트 2장
    const pairCards = filteredCards.filter((card) => card.rank === rank1);
    if (pairCards.length >= 2) {
      // 랜덤하게 2장 선택
      const shuffled = [...pairCards].sort(() => Math.random() - 0.5);
      return [shuffled[0], shuffled[1]];
    }
  } else if (parsed.isSuited) {
    // 수딧: 같은 수트의 두 랭크
    for (const suit of SUITS.sort(() => Math.random() - 0.5)) {
      const card1 = filteredCards.find((card) => card.rank === rank1 && card.suit === suit);
      const card2 = filteredCards.find((card) => card.rank === rank2 && card.suit === suit);
      if (card1 && card2) {
        return [card1, card2];
      }
    }
  } else {
    // 오프수딧: 다른 수트의 두 랭크
    const shuffledSuits = [...SUITS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledSuits.length; i++) {
      for (let j = 0; j < shuffledSuits.length; j++) {
        if (i === j) continue;
        const card1 = filteredCards.find(
          (card) => card.rank === rank1 && card.suit === shuffledSuits[i]
        );
        const card2 = filteredCards.find(
          (card) => card.rank === rank2 && card.suit === shuffledSuits[j]
        );
        if (card1 && card2) {
          return [card1, card2];
        }
      }
    }
  }

  return null;
}

/**
 * 상대 타입에 따른 핸드 이름 결정
 */
export function getOpponentHandName(
  opponentType: OpponentType,
  playerHandName: string,
  playerRank: number
): string {
  const config = OPPONENT_CONFIGS.find((c) => c.type === opponentType);
  if (!config) {
    return getRandomHandName();
  }

  const rule = config.handMatchingRule;
  const filter = config.filterVisuallyObvious;

  if (rule === 'random') {
    return getRandomHandName();
  }

  const range = rule === 'range30' ? 30 : rule === 'range15' ? 15 : 5;

  if (filter) {
    return getFilteredMatchedHandName(playerHandName, playerRank, range);
  } else {
    return getMatchedHandName(playerRank, range);
  }
}

/**
 * 상대 핸드 생성 (실제 카드 반환)
 * @param opponentType 상대 타입
 * @param playerHand 플레이어 핸드 (카드 2장)
 * @param availableCards 사용 가능한 카드들 (덱)
 * @returns 상대 핸드 카드 2장 또는 null
 */
export function generateOpponentHand(
  opponentType: OpponentType,
  playerHand: [Card, Card],
  availableCards: Card[]
): [Card, Card] | null {
  const playerHandInfo = evaluateStartingHand(playerHand);
  const opponentHandName = getOpponentHandName(
    opponentType,
    playerHandInfo.name,
    playerHandInfo.rank
  );

  // 핸드 이름에 맞는 카드 찾기 (플레이어 카드 제외)
  const cards = findCardsForHandName(opponentHandName, availableCards, playerHand);

  if (cards) {
    return cards;
  }

  // 찾지 못하면 랜덤 핸드로 재시도 (최대 10회)
  for (let i = 0; i < 10; i++) {
    const fallbackHandName = getRandomHandName();
    const fallbackCards = findCardsForHandName(fallbackHandName, availableCards, playerHand);
    if (fallbackCards) {
      return fallbackCards;
    }
  }

  // 그래도 못 찾으면 덱에서 아무 카드나 2장
  const filtered = availableCards.filter(
    (card) =>
      !playerHand.some((p) => p.suit === card.suit && p.rank === card.rank)
  );
  if (filtered.length >= 2) {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  return null;
}
