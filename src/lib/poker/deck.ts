import { Card, Suit, Rank } from '@/types';

// 모든 수트
export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

// 모든 랭크
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// 랭크를 숫자로 변환 (2=2, ..., A=14)
export function rankToNumber(rank: Rank): number {
  const rankMap: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return rankMap[rank];
}

// 52장 덱 생성
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Fisher-Yates 셔플
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 시드 기반 셔플 (일일 챌린지용)
export function seededShuffleDeck(deck: Card[], seed: number): Card[] {
  const shuffled = [...deck];
  const random = seededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 시드 기반 난수 생성기
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// 날짜 기반 시드 생성
export function getDailySeed(date?: Date): number {
  const d = date || new Date();
  const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  return hashCode(dateStr);
}

// 문자열 해시
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 카드 비교 (정렬용)
export function compareCards(a: Card, b: Card): number {
  return rankToNumber(b.rank) - rankToNumber(a.rank);
}

// 두 카드가 같은지 확인
function isSameCard(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

// 덱에서 특정 카드들 제외
export function excludeCards(deck: Card[], exclude: Card[]): Card[] {
  return deck.filter(card => !exclude.some(ex => isSameCard(card, ex)));
}
