import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { calculateWinRate } from './calculator';
import { evaluateBestHand, compareHands } from './evaluator';
import { createDeck, excludeCards, seededShuffleDeck } from './deck';
import { Card, HandRank, WinRateResult } from '@/types';

// 헬퍼 함수: 'Ah' 형태의 축약 표기를 Card로 변환
function card(notation: string): Card {
  const suitMap: Record<string, Card['suit']> = {
    h: 'hearts',
    d: 'diamonds',
    c: 'clubs',
    s: 'spades',
  };
  return {
    rank: notation.slice(0, -1) as Card['rank'],
    suit: suitMap[notation.slice(-1)],
  };
}

// 헬퍼 함수: 축약 표기 배열을 Card 배열로 변환
function cards(...notations: string[]): Card[] {
  return notations.map(card);
}

// 헬퍼 함수: 축약 표기 2장을 핸드로 변환
function hand(a: string, b: string): [Card, Card] {
  return [card(a), card(b)];
}

/**
 * Web Worker(public/workers/poker-calculator.js)는 calculator.ts와 동일한 로직을
 * 순수 JS로 중복 구현하고 있다. 두 구현이 어긋나면 UI에 표시되는 승률과
 * 실제 판정이 달라지므로, 워커 스크립트를 로드해 직접 비교한다.
 */
function loadWorkerModule(): {
  calculateWinRate: (
    playerHand: [Card, Card],
    computerHand: [Card, Card],
    communityCards: Card[]
  ) => WinRateResult;
} {
  const workerPath = path.resolve(process.cwd(), 'public/workers/poker-calculator.js');
  const source = readFileSync(workerPath, 'utf8');
  // 워커는 self.onmessage에 핸들러를 등록하므로 self를 스텁으로 주입한다
  const factory = new Function(
    'self',
    `${source}\nreturn { calculateWinRate, evaluateBestHand };`
  );
  return factory({ onmessage: null, postMessage: () => {} });
}

describe('poker engine', () => {
  describe('evaluator 핸드 서열', () => {
    it('로열 플러시가 스트레이트 플러시를 이긴다', () => {
      const royal = evaluateBestHand(cards('Ah', 'Kh', 'Qh', 'Jh', '10h', '2c', '3d'));
      const straightFlush = evaluateBestHand(cards('9h', 'Kh', 'Qh', 'Jh', '10h', '2c', '3d'));

      expect(royal.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(compareHands(royal, straightFlush)).toBeLessThan(0);
    });

    it('휠 스트레이트(A-2-3-4-5)를 스트레이트로 인식한다', () => {
      const wheel = evaluateBestHand(cards('Ah', '2c', '3d', '4s', '5h', 'Kd', '9c'));

      expect(wheel.rank).toBe(HandRank.STRAIGHT);
    });

    it('풀하우스 > 플러시 > 스트레이트 순으로 정렬된다', () => {
      const fullHouse = evaluateBestHand(cards('Ah', 'Ac', 'Ad', 'Ks', 'Kh', '2c', '3d'));
      const flush = evaluateBestHand(cards('Ah', '9h', '7h', '5h', '3h', 'Kc', '2d'));
      const straight = evaluateBestHand(cards('9h', '8c', '7d', '6s', '5h', 'Kc', '2d'));

      expect(fullHouse.rank).toBe(HandRank.FULL_HOUSE);
      expect(flush.rank).toBe(HandRank.FLUSH);
      expect(straight.rank).toBe(HandRank.STRAIGHT);
      expect(compareHands(fullHouse, flush)).toBeLessThan(0);
      expect(compareHands(flush, straight)).toBeLessThan(0);
    });

    it('7장에서 최고의 5장을 선택한다', () => {
      // 커뮤니티에 스트레이트가 깔려 있지만 포켓 페어로 풀하우스가 완성된다
      const evaluation = evaluateBestHand(cards('7h', '7d', '7s', '9c', '9h', '2d', '3c'));

      expect(evaluation.rank).toBe(HandRank.FULL_HOUSE);
    });

    it('무늬만 다른 동일 핸드는 무승부로 판정한다', () => {
      const a = evaluateBestHand(cards('Ah', 'Kc', 'Qd', 'Js', '10h', '3c', '2d'));
      const b = evaluateBestHand(cards('Ac', 'Kh', 'Qs', 'Jd', '10c', '3h', '2s'));

      expect(compareHands(a, b)).toBe(0);
    });
  });

  describe('calculator 불변식', () => {
    it('플랍에서 990개 조합을 완전탐색한다', () => {
      const result = calculateWinRate(
        hand('Ah', 'Kh'),
        hand('Qs', 'Qd'),
        cards('2c', '7d', '9h')
      );

      expect(result.totalCombinations).toBe(990);
      expect(result.playerWins + result.computerWins + result.ties).toBe(990);
    });

    it('턴에서 44개 조합을 완전탐색한다', () => {
      const result = calculateWinRate(
        hand('Ah', 'Kh'),
        hand('Qs', 'Qd'),
        cards('2c', '7d', '9h', '4s')
      );

      expect(result.totalCombinations).toBe(44);
      expect(result.playerWins + result.computerWins + result.ties).toBe(44);
    });

    it('승률 합계가 100%가 된다', () => {
      const result = calculateWinRate(
        hand('Ah', 'Kh'),
        hand('Qs', 'Qd'),
        cards('2c', '7d', '9h')
      );

      expect(result.playerWinRate + result.computerWinRate + result.tieRate).toBeCloseTo(100, 1);
    });

    it('이미 완성된 우위는 높은 승률로 반영된다', () => {
      // 플레이어는 플랍에서 셋, 컴퓨터는 노페어
      const result = calculateWinRate(
        hand('9h', '9d'),
        hand('2c', '3d'),
        cards('9s', 'Kh', '7c')
      );

      expect(result.playerWinRate).toBeGreaterThan(90);
    });
  });

  describe('Web Worker 구현 일치', () => {
    const worker = loadWorkerModule();

    it('무작위 플랍 10케이스에서 라이브러리와 승률이 일치한다', () => {
      const mismatches: string[] = [];

      for (let seed = 1; seed <= 10; seed++) {
        const shuffled = seededShuffleDeck(createDeck(), seed);
        const playerHand: [Card, Card] = [shuffled[0], shuffled[1]];
        const computerHand: [Card, Card] = [shuffled[2], shuffled[3]];
        const community = shuffled.slice(4, 7);

        const lib = calculateWinRate(playerHand, computerHand, community);
        const wrk = worker.calculateWinRate(playerHand, computerHand, community);

        if (
          Math.abs(lib.playerWinRate - wrk.playerWinRate) > 0.01 ||
          Math.abs(lib.computerWinRate - wrk.computerWinRate) > 0.01 ||
          Math.abs(lib.tieRate - wrk.tieRate) > 0.01
        ) {
          mismatches.push(
            `seed ${seed}: lib=${lib.playerWinRate}/${lib.tieRate} worker=${wrk.playerWinRate}/${wrk.tieRate}`
          );
        }
      }

      expect(mismatches).toEqual([]);
    });
  });

  describe('deck 무결성', () => {
    it('덱은 중복 없는 52장이다', () => {
      const deck = createDeck();

      expect(deck).toHaveLength(52);
      expect(new Set(deck.map((c) => `${c.rank}${c.suit}`)).size).toBe(52);
    });

    it('excludeCards가 지정한 카드만 제거한다', () => {
      const remaining = excludeCards(createDeck(), cards('Ah', '2c'));

      expect(remaining).toHaveLength(50);
      expect(remaining.some((c) => c.rank === 'A' && c.suit === 'hearts')).toBe(false);
      expect(remaining.some((c) => c.rank === '2' && c.suit === 'clubs')).toBe(false);
    });

    it('seededShuffleDeck은 같은 시드에서 같은 결과를 낸다', () => {
      const a = seededShuffleDeck(createDeck(), 12345);
      const b = seededShuffleDeck(createDeck(), 12345);

      expect(a.map((c) => `${c.rank}${c.suit}`)).toEqual(b.map((c) => `${c.rank}${c.suit}`));
    });
  });
});
