import { describe, it, expect } from 'vitest';
import { evaluateStartingHand, compareStartingHands, getHandRank } from './starting-hands';
import { Card } from '@/types';

// 헬퍼 함수: 카드 생성
function createCard(rank: Card['rank'], suit: Card['suit']): Card {
  return { rank, suit };
}

// 헬퍼 함수: 핸드 생성
function createHand(rank1: Card['rank'], suit1: Card['suit'], rank2: Card['rank'], suit2: Card['suit']): [Card, Card] {
  return [createCard(rank1, suit1), createCard(rank2, suit2)];
}

describe('starting-hands', () => {
  describe('evaluateStartingHand', () => {
    describe('10이 포함된 핸드 (T로 변환)', () => {
      it('TT (포켓 텐)는 10위여야 한다', () => {
        const hand = createHand('10', 'hearts', '10', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('TT');
        expect(result.rank).toBe(10);
      });

      it('ATs (에이스-텐 수딧)는 12위여야 한다', () => {
        const hand = createHand('A', 'hearts', '10', 'hearts');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('ATs');
        expect(result.rank).toBe(12);
      });

      it('ATo (에이스-텐 오프수딧)는 42위여야 한다', () => {
        const hand = createHand('A', 'hearts', '10', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('ATo');
        expect(result.rank).toBe(42);
      });

      it('KTs (킹-텐 수딧)는 14위여야 한다', () => {
        const hand = createHand('K', 'spades', '10', 'spades');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('KTs');
        expect(result.rank).toBe(14);
      });

      it('KTo (킹-텐 오프수딧)는 45위여야 한다', () => {
        const hand = createHand('K', 'hearts', '10', 'clubs');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('KTo');
        expect(result.rank).toBe(45);
      });

      it('QTs (퀸-텐 수딧)는 15위여야 한다', () => {
        const hand = createHand('Q', 'diamonds', '10', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('QTs');
        expect(result.rank).toBe(15);
      });

      it('QTo (퀸-텐 오프수딧)는 49위여야 한다', () => {
        const hand = createHand('Q', 'hearts', '10', 'spades');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('QTo');
        expect(result.rank).toBe(49);
      });

      it('JTs (잭-텐 수딧)는 16위여야 한다', () => {
        const hand = createHand('J', 'clubs', '10', 'clubs');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('JTs');
        expect(result.rank).toBe(16);
      });

      it('JTo (잭-텐 오프수딧)는 47위여야 한다', () => {
        const hand = createHand('J', 'hearts', '10', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('JTo');
        expect(result.rank).toBe(47);
      });

      it('T9s (텐-나인 수딧)는 23위여야 한다', () => {
        const hand = createHand('10', 'hearts', '9', 'hearts');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('T9s');
        expect(result.rank).toBe(23);
      });

      it('T9o (텐-나인 오프수딧)는 73위여야 한다', () => {
        const hand = createHand('10', 'hearts', '9', 'clubs');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('T9o');
        expect(result.rank).toBe(73);
      });

      it('T8s는 38위여야 한다', () => {
        const hand = createHand('10', 'spades', '8', 'spades');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('T8s');
        expect(result.rank).toBe(38);
      });

      it('T2o는 162위여야 한다', () => {
        const hand = createHand('10', 'hearts', '2', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('T2o');
        expect(result.rank).toBe(162);
      });
    });

    describe('포켓 페어', () => {
      it('AA는 1위여야 한다', () => {
        const hand = createHand('A', 'hearts', 'A', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('AA');
        expect(result.rank).toBe(1);
        expect(result.tier).toBe(1);
      });

      it('KK는 2위여야 한다', () => {
        const hand = createHand('K', 'hearts', 'K', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('KK');
        expect(result.rank).toBe(2);
      });

      it('22는 52위여야 한다', () => {
        const hand = createHand('2', 'hearts', '2', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('22');
        expect(result.rank).toBe(52);
      });
    });

    describe('수딧/오프수딧', () => {
      it('AKs는 4위여야 한다', () => {
        const hand = createHand('A', 'hearts', 'K', 'hearts');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('AKs');
        expect(result.rank).toBe(4);
      });

      it('AKo는 11위여야 한다', () => {
        const hand = createHand('A', 'hearts', 'K', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('AKo');
        expect(result.rank).toBe(11);
      });

      it('72o (최하위)는 169위여야 한다', () => {
        const hand = createHand('7', 'hearts', '2', 'diamonds');
        const result = evaluateStartingHand(hand);

        expect(result.name).toBe('72o');
        expect(result.rank).toBe(169);
      });
    });

    describe('카드 순서 무관', () => {
      it('10-A와 A-10은 같은 핸드여야 한다', () => {
        const hand1 = createHand('10', 'hearts', 'A', 'hearts');
        const hand2 = createHand('A', 'hearts', '10', 'hearts');

        const result1 = evaluateStartingHand(hand1);
        const result2 = evaluateStartingHand(hand2);

        expect(result1.name).toBe(result2.name);
        expect(result1.rank).toBe(result2.rank);
      });
    });
  });

  describe('compareStartingHands', () => {
    it('AA가 KK보다 강해야 한다', () => {
      const aa = createHand('A', 'hearts', 'A', 'diamonds');
      const kk = createHand('K', 'hearts', 'K', 'diamonds');

      expect(compareStartingHands(aa, kk)).toBe(-1);
      expect(compareStartingHands(kk, aa)).toBe(1);
    });

    it('ATs가 T9s보다 강해야 한다', () => {
      const ats = createHand('A', 'hearts', '10', 'hearts');
      const t9s = createHand('10', 'spades', '9', 'spades');

      expect(compareStartingHands(ats, t9s)).toBe(-1);
    });

    it('같은 핸드는 동등해야 한다', () => {
      const hand1 = createHand('A', 'hearts', 'K', 'hearts');
      const hand2 = createHand('A', 'spades', 'K', 'spades');

      expect(compareStartingHands(hand1, hand2)).toBe(0);
    });
  });

  describe('getHandRank', () => {
    it('TT는 10위를 반환해야 한다', () => {
      expect(getHandRank('TT')).toBe(10);
    });

    it('ATs는 12위를 반환해야 한다', () => {
      expect(getHandRank('ATs')).toBe(12);
    });

    it('존재하지 않는 핸드는 169를 반환해야 한다', () => {
      expect(getHandRank('XX')).toBe(169);
    });
  });
});
