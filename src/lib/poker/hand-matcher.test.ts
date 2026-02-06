import { describe, it, expect } from 'vitest';
import {
  getRandomHandName,
  getMatchedHandName,
  isVisuallyObvious,
  getFilteredMatchedHandName,
  getHandNameByRank,
  HAND_RANKING_LIST,
} from './hand-matcher';

describe('hand-matcher', () => {
  describe('HAND_RANKING_LIST', () => {
    it('should have 169 hands', () => {
      expect(HAND_RANKING_LIST).toHaveLength(169);
    });

    it('should have AA at rank 1', () => {
      expect(HAND_RANKING_LIST[0]).toBe('AA');
    });

    it('should have 72o at rank 169', () => {
      expect(HAND_RANKING_LIST[168]).toBe('72o');
    });
  });

  describe('getHandNameByRank', () => {
    it('should return AA for rank 1', () => {
      expect(getHandNameByRank(1)).toBe('AA');
    });

    it('should return 72o for rank 169', () => {
      expect(getHandNameByRank(169)).toBe('72o');
    });

    it('should return null for invalid rank', () => {
      expect(getHandNameByRank(0)).toBeNull();
      expect(getHandNameByRank(170)).toBeNull();
    });
  });

  describe('getRandomHandName', () => {
    it('should return a valid hand name', () => {
      const handName = getRandomHandName();
      expect(HAND_RANKING_LIST).toContain(handName);
    });

    it('should return different hands on multiple calls (probabilistic)', () => {
      const hands = new Set<string>();
      for (let i = 0; i < 50; i++) {
        hands.add(getRandomHandName());
      }
      // 50번 호출 시 최소 5개 이상의 다른 핸드가 나와야 함
      expect(hands.size).toBeGreaterThan(5);
    });
  });

  describe('getMatchedHandName', () => {
    it('should return a hand within ±30 range for range30', () => {
      const playerRank = 50;
      for (let i = 0; i < 20; i++) {
        const matchedHand = getMatchedHandName(playerRank, 30);
        const matchedRank = HAND_RANKING_LIST.indexOf(matchedHand) + 1;
        expect(matchedRank).toBeGreaterThanOrEqual(Math.max(1, playerRank - 30));
        expect(matchedRank).toBeLessThanOrEqual(Math.min(169, playerRank + 30));
      }
    });

    it('should return a hand within ±15 range for range15', () => {
      const playerRank = 100;
      for (let i = 0; i < 20; i++) {
        const matchedHand = getMatchedHandName(playerRank, 15);
        const matchedRank = HAND_RANKING_LIST.indexOf(matchedHand) + 1;
        expect(matchedRank).toBeGreaterThanOrEqual(Math.max(1, playerRank - 15));
        expect(matchedRank).toBeLessThanOrEqual(Math.min(169, playerRank + 15));
      }
    });

    it('should return a hand within ±5 range for range5', () => {
      const playerRank = 80;
      for (let i = 0; i < 20; i++) {
        const matchedHand = getMatchedHandName(playerRank, 5);
        const matchedRank = HAND_RANKING_LIST.indexOf(matchedHand) + 1;
        expect(matchedRank).toBeGreaterThanOrEqual(Math.max(1, playerRank - 5));
        expect(matchedRank).toBeLessThanOrEqual(Math.min(169, playerRank + 5));
      }
    });

    it('should handle edge case at rank 1 (AA)', () => {
      const matchedHand = getMatchedHandName(1, 5);
      const matchedRank = HAND_RANKING_LIST.indexOf(matchedHand) + 1;
      expect(matchedRank).toBeGreaterThanOrEqual(1);
      expect(matchedRank).toBeLessThanOrEqual(6);
    });

    it('should handle edge case at rank 169 (72o)', () => {
      const matchedHand = getMatchedHandName(169, 5);
      const matchedRank = HAND_RANKING_LIST.indexOf(matchedHand) + 1;
      expect(matchedRank).toBeGreaterThanOrEqual(164);
      expect(matchedRank).toBeLessThanOrEqual(169);
    });
  });

  describe('isVisuallyObvious', () => {
    // 같은 킥커 + 높은 카드 차이 (K9s vs T9s)
    it('should detect same kicker with high card difference', () => {
      expect(isVisuallyObvious('K9s', 'T9s')).toBe(true);
      expect(isVisuallyObvious('A5s', 'K5s')).toBe(true);
      expect(isVisuallyObvious('Q8o', 'J8o')).toBe(true);
    });

    // 페어 vs 논페어 (AA vs AKs)
    it('should detect pair vs non-pair', () => {
      expect(isVisuallyObvious('AA', 'AKs')).toBe(true);
      expect(isVisuallyObvious('KK', 'AQs')).toBe(true);
      expect(isVisuallyObvious('JJ', 'QTs')).toBe(true);
      expect(isVisuallyObvious('22', 'A2s')).toBe(true);
    });

    // 같은 숫자 포함 시 차이가 눈에 띄는 경우 (A5s vs A3s)
    it('should detect same high card with different kicker', () => {
      expect(isVisuallyObvious('A5s', 'A3s')).toBe(true);
      expect(isVisuallyObvious('K9s', 'K7s')).toBe(true);
      expect(isVisuallyObvious('QTo', 'Q8o')).toBe(true);
    });

    // 헷갈리는 핸드 조합 (false 반환)
    it('should return false for confusing hands', () => {
      // 33 vs 87s - 둘 다 애매해 보임
      expect(isVisuallyObvious('33', '87s')).toBe(false);
      // 페어 vs 페어 (비슷한 랭킹)
      expect(isVisuallyObvious('77', '66')).toBe(false);
      // 수딧 커넥터들
      expect(isVisuallyObvious('98s', '87s')).toBe(false);
      expect(isVisuallyObvious('76s', '65s')).toBe(false);
      // 완전히 다른 카드들
      expect(isVisuallyObvious('AKs', '87s')).toBe(false);
      expect(isVisuallyObvious('QJs', '65s')).toBe(false);
    });

    // 같은 핸드
    it('should return false for same hands', () => {
      expect(isVisuallyObvious('AA', 'AA')).toBe(false);
      expect(isVisuallyObvious('AKs', 'AKs')).toBe(false);
    });
  });

  describe('getFilteredMatchedHandName', () => {
    it('should return a non-visually-obvious hand', () => {
      // 플레이어가 중간 랭킹 핸드를 가진 경우 (예: 55 - rank 46)
      const playerHand = '55';
      const playerRank = 46;

      for (let i = 0; i < 20; i++) {
        const matchedHand = getFilteredMatchedHandName(playerHand, playerRank, 15);
        // 눈에 띄게 다른 핸드가 아니어야 함
        expect(isVisuallyObvious(playerHand, matchedHand)).toBe(false);
        // 범위 내에 있어야 함
        const matchedRank = HAND_RANKING_LIST.indexOf(matchedHand) + 1;
        expect(matchedRank).toBeGreaterThanOrEqual(Math.max(1, playerRank - 15));
        expect(matchedRank).toBeLessThanOrEqual(Math.min(169, playerRank + 15));
      }
    });

    it('should fallback to random if no suitable hand found after max attempts', () => {
      // AA (rank 1)는 모든 근처 핸드가 눈에 띄게 다를 수 있음
      // 이 경우에도 유효한 핸드를 반환해야 함
      const matchedHand = getFilteredMatchedHandName('AA', 1, 5);
      expect(HAND_RANKING_LIST).toContain(matchedHand);
    });
  });
});
