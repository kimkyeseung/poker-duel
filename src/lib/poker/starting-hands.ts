import { Card } from '@/types';
import { rankToNumber } from './deck';

// 프리플랍 핸드 랭킹 (169개 핸드 순위표 기반)
// 1위가 가장 강함 (AA), 169위가 가장 약함 (72o)

export interface StartingHandInfo {
  name: string;
  rank: number; // 1~169 순위
  tier: number; // 1~8 (1이 가장 강함)
}

// 169개 핸드 순위표 (이미지 기준)
// 포켓: 빨간색, 수딧: 노란색, 오프수딧: 초록색
const HAND_RANKINGS: Record<string, number> = {
  // 1-10위
  'AA': 1, 'KK': 2, 'QQ': 3, 'AKs': 4, 'JJ': 5,
  'AQs': 6, 'KQs': 7, 'AJs': 8, 'KJs': 9, 'TT': 10,

  // 11-20위
  'AKo': 11, 'ATs': 12, 'QJs': 13, 'KTs': 14, 'QTs': 15,
  'JTs': 16, '99': 17, 'AQo': 18, 'A9s': 19, 'KQo': 20,

  // 21-30위
  '88': 21, 'K9s': 22, 'T9s': 23, 'A8s': 24, 'Q9s': 25,
  'J9s': 26, 'AJo': 27, 'A5s': 28, '77': 29, 'A7s': 30,

  // 31-40위
  'KJo': 31, 'A4s': 32, 'A3s': 33, 'A6s': 34, 'QJo': 35,
  '66': 36, 'K8s': 37, 'T8s': 38, 'A2s': 39, '98s': 40,

  // 41-50위
  'J8s': 41, 'ATo': 42, 'Q8s': 43, 'K7s': 44, 'KTo': 45,
  '55': 46, 'JTo': 47, '87s': 48, 'QTo': 49, '44': 50,

  // 51-60위
  '33': 51, '22': 52, 'K6s': 53, '97s': 54, 'K5s': 55,
  '76s': 56, 'T7s': 57, 'K4s': 58, 'K3s': 59, 'K2s': 60,

  // 61-70위
  'Q7s': 61, '86s': 62, '65s': 63, 'J7s': 64, '54s': 65,
  'Q6s': 66, '75s': 67, '96s': 68, 'Q5s': 69, '64s': 70,

  // 71-80위
  'Q4s': 71, 'Q3s': 72, 'T9o': 73, 'T6s': 74, 'Q2s': 75,
  'A9o': 76, '53s': 77, '85s': 78, 'J6s': 79, 'J9o': 80,

  // 81-90위
  'K9o': 81, 'J5s': 82, 'Q9o': 83, '43s': 84, '74s': 85,
  'J4s': 86, 'J3s': 87, '95s': 88, 'J2s': 89, '63s': 90,

  // 91-100위
  'A8o': 91, '52s': 92, 'T5s': 93, '84s': 94, 'T4s': 95,
  'T3s': 96, '42s': 97, 'T2s': 98, '98o': 99, 'T8o': 100,

  // 101-110위
  'A5o': 101, 'A7o': 102, '73s': 103, 'A4o': 104, '32s': 105,
  '94s': 106, '93s': 107, 'J8o': 108, 'A3o': 109, '62s': 110,

  // 111-120위
  '92s': 111, 'K8o': 112, 'A6o': 113, '87o': 114, 'Q8o': 115,
  '83s': 116, 'A2o': 117, '82s': 118, '97o': 119, '72s': 120,

  // 121-130위
  '76o': 121, 'K7o': 122, '65o': 123, 'T7o': 124, 'K6o': 125,
  '86o': 126, '54o': 127, 'K5o': 128, 'J7o': 129, '75o': 130,

  // 131-140위
  'Q7o': 131, 'K4o': 132, 'K3o': 133, '96o': 134, 'K2o': 135,
  '64o': 136, 'Q6o': 137, '53o': 138, '85o': 139, 'T6o': 140,

  // 141-150위
  'Q5o': 141, '43o': 142, 'Q4o': 143, 'Q3o': 144, '74o': 145,
  'Q2o': 146, 'J6o': 147, '63o': 148, 'J5o': 149, '95o': 150,

  // 151-160위
  '52o': 151, 'J4o': 152, 'J3o': 153, '42o': 154, 'J2o': 155,
  '84o': 156, 'T5o': 157, 'T4o': 158, '32o': 159, 'T3o': 160,

  // 161-169위
  '73o': 161, 'T2o': 162, '62o': 163, '94o': 164, '93o': 165,
  '92o': 166, '83o': 167, '82o': 168, '72o': 169,
};

// rank를 표준 표기로 변환 (10 → T)
function normalizeRank(rank: string): string {
  return rank === '10' ? 'T' : rank;
}

// 핸드 이름 생성 (예: AKs, QJo, 77)
function getHandName(cards: [Card, Card]): string {
  const [card1, card2] = cards;
  const rank1 = normalizeRank(card1.rank);
  const rank2 = normalizeRank(card2.rank);
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

// 순위에서 티어 계산
function calculateTier(rank: number): number {
  if (rank <= 10) return 1;  // 프리미엄
  if (rank <= 25) return 2;  // 매우 강함
  if (rank <= 45) return 3;  // 강함
  if (rank <= 70) return 4;  // 좋음
  if (rank <= 100) return 5; // 중간
  if (rank <= 130) return 6; // 약함
  if (rank <= 155) return 7; // 매우 약함
  return 8;                   // 최하위
}

// 스타팅 핸드 평가
export function evaluateStartingHand(cards: [Card, Card]): StartingHandInfo {
  const name = getHandName(cards);
  const rank = HAND_RANKINGS[name] || 169; // 찾지 못하면 최하위
  const tier = calculateTier(rank);

  return { name, rank, tier };
}

// 두 스타팅 핸드 비교 (프리플랍용)
// 반환: -1 (hand1 승), 0 (동등), 1 (hand2 승)
export function compareStartingHands(
  hand1: [Card, Card],
  hand2: [Card, Card]
): number {
  const info1 = evaluateStartingHand(hand1);
  const info2 = evaluateStartingHand(hand2);

  // 순위가 낮을수록(숫자가 작을수록) 강함
  if (info1.rank < info2.rank) return -1;
  if (info1.rank > info2.rank) return 1;

  // 순위가 같으면 동등
  return 0;
}

// 두 핸드가 동일한 강도인지 확인
export function isSameStrength(hand1: [Card, Card], hand2: [Card, Card]): boolean {
  const info1 = evaluateStartingHand(hand1);
  const info2 = evaluateStartingHand(hand2);

  // 이름이 같으면 동일 (예: AKs vs AKs)
  return info1.name === info2.name;
}

// 핸드 순위 직접 조회
export function getHandRank(handName: string): number {
  return HAND_RANKINGS[handName] || 169;
}
