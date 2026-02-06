import { describe, it, expect } from 'vitest';
import { HandRank, OutcomeCard, MatchupBreakdown } from '@/types';

// 매치업 필터링 로직 테스트를 위한 헬퍼 함수
function filterMatchedOutcomes(
  outcomes: OutcomeCard[],
  matchup: MatchupBreakdown
): OutcomeCard[] {
  return outcomes.filter(
    (o) =>
      o.playerHandRank === matchup.playerRank &&
      o.computerHandRank === matchup.computerRank
  );
}

// 결과 그룹화 로직
function groupOutcomesByResult(outcomes: OutcomeCard[]) {
  return {
    wins: outcomes.filter((o) => o.outcome === 'win'),
    ties: outcomes.filter((o) => o.outcome === 'tie'),
    losses: outcomes.filter((o) => o.outcome === 'loss'),
  };
}

// 샘플 카드 제한 로직
function getSamplesWithRemaining(items: OutcomeCard[], maxSamples: number) {
  const samples = items.slice(0, maxSamples);
  const remaining = items.length - maxSamples;
  return { samples, remaining: Math.max(0, remaining) };
}

describe('OutcomeDetailsDialog', () => {
  describe('매치업 필터링 로직', () => {
    const mockOutcomes: OutcomeCard[] = [
      {
        cards: [{ suit: 'hearts', rank: 'A' }],
        outcome: 'win',
        playerHandRank: HandRank.ONE_PAIR,
        computerHandRank: HandRank.HIGH_CARD,
      },
      {
        cards: [{ suit: 'hearts', rank: 'K' }],
        outcome: 'loss',
        playerHandRank: HandRank.HIGH_CARD,
        computerHandRank: HandRank.ONE_PAIR,
      },
      {
        cards: [{ suit: 'hearts', rank: 'Q' }],
        outcome: 'win',
        playerHandRank: HandRank.ONE_PAIR,
        computerHandRank: HandRank.HIGH_CARD,
      },
      {
        cards: [{ suit: 'hearts', rank: 'J' }],
        outcome: 'tie',
        playerHandRank: HandRank.ONE_PAIR,
        computerHandRank: HandRank.ONE_PAIR,
      },
    ];

    it('특정 매치업에 해당하는 결과만 필터링한다', () => {
      const matchup: MatchupBreakdown = {
        playerRank: HandRank.ONE_PAIR,
        computerRank: HandRank.HIGH_CARD,
        wins: 2,
        ties: 0,
        losses: 0,
        total: 2,
      };

      const filtered = filterMatchedOutcomes(mockOutcomes, matchup);
      expect(filtered.length).toBe(2);
      expect(filtered.every((o) => o.playerHandRank === HandRank.ONE_PAIR)).toBe(true);
      expect(filtered.every((o) => o.computerHandRank === HandRank.HIGH_CARD)).toBe(true);
    });

    it('매치업에 해당하는 결과가 없으면 빈 배열을 반환한다', () => {
      const matchup: MatchupBreakdown = {
        playerRank: HandRank.FLUSH,
        computerRank: HandRank.STRAIGHT,
        wins: 0,
        ties: 0,
        losses: 0,
        total: 0,
      };

      const filtered = filterMatchedOutcomes(mockOutcomes, matchup);
      expect(filtered.length).toBe(0);
    });
  });

  describe('결과 그룹화 로직', () => {
    const mockOutcomes: OutcomeCard[] = [
      { cards: [], outcome: 'win', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
      { cards: [], outcome: 'win', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
      { cards: [], outcome: 'loss', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
      { cards: [], outcome: 'tie', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
      { cards: [], outcome: 'tie', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
      { cards: [], outcome: 'tie', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
    ];

    it('결과를 승/무/패로 올바르게 그룹화한다', () => {
      const grouped = groupOutcomesByResult(mockOutcomes);

      expect(grouped.wins.length).toBe(2);
      expect(grouped.ties.length).toBe(3);
      expect(grouped.losses.length).toBe(1);
    });

    it('모든 결과가 승리인 경우를 처리한다', () => {
      const allWins: OutcomeCard[] = [
        { cards: [], outcome: 'win', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
        { cards: [], outcome: 'win', playerHandRank: HandRank.ONE_PAIR, computerHandRank: HandRank.HIGH_CARD },
      ];

      const grouped = groupOutcomesByResult(allWins);

      expect(grouped.wins.length).toBe(2);
      expect(grouped.ties.length).toBe(0);
      expect(grouped.losses.length).toBe(0);
    });

    it('빈 배열을 처리한다', () => {
      const grouped = groupOutcomesByResult([]);

      expect(grouped.wins.length).toBe(0);
      expect(grouped.ties.length).toBe(0);
      expect(grouped.losses.length).toBe(0);
    });
  });

  describe('카드 샘플 제한 로직', () => {
    const createMockOutcomes = (count: number): OutcomeCard[] => {
      return Array.from({ length: count }, (_, i) => ({
        cards: [{ suit: 'hearts' as const, rank: 'A' as const }],
        outcome: 'win' as const,
        playerHandRank: HandRank.ONE_PAIR,
        computerHandRank: HandRank.HIGH_CARD,
      }));
    };

    it('maxSamples보다 적은 항목이 있으면 모두 반환하고 remaining은 0이다', () => {
      const outcomes = createMockOutcomes(3);
      const { samples, remaining } = getSamplesWithRemaining(outcomes, 6);

      expect(samples.length).toBe(3);
      expect(remaining).toBe(0);
    });

    it('maxSamples보다 많은 항목이 있으면 샘플만 반환하고 remaining을 계산한다', () => {
      const outcomes = createMockOutcomes(10);
      const { samples, remaining } = getSamplesWithRemaining(outcomes, 6);

      expect(samples.length).toBe(6);
      expect(remaining).toBe(4);
    });

    it('정확히 maxSamples와 같은 항목이 있으면 remaining은 0이다', () => {
      const outcomes = createMockOutcomes(6);
      const { samples, remaining } = getSamplesWithRemaining(outcomes, 6);

      expect(samples.length).toBe(6);
      expect(remaining).toBe(0);
    });

    it('빈 배열을 처리한다', () => {
      const { samples, remaining } = getSamplesWithRemaining([], 6);

      expect(samples.length).toBe(0);
      expect(remaining).toBe(0);
    });
  });

  describe('유의미한 매치업 필터링', () => {
    const filterSignificantMatchups = (
      matchups: MatchupBreakdown[],
      total: number,
      threshold: number = 0.5
    ) => {
      return matchups.filter((m) => (m.total / total) * 100 >= threshold);
    };

    it('0.5% 미만의 매치업은 제외한다', () => {
      const matchups: MatchupBreakdown[] = [
        { playerRank: HandRank.ONE_PAIR, computerRank: HandRank.HIGH_CARD, wins: 100, ties: 0, losses: 0, total: 100 },
        { playerRank: HandRank.TWO_PAIR, computerRank: HandRank.ONE_PAIR, wins: 50, ties: 0, losses: 0, total: 50 },
        { playerRank: HandRank.FLUSH, computerRank: HandRank.STRAIGHT, wins: 2, ties: 0, losses: 0, total: 2 }, // 0.2% - 제외됨
      ];
      const total = 1000;

      const significant = filterSignificantMatchups(matchups, total);

      expect(significant.length).toBe(2);
      expect(significant.some((m) => m.total === 2)).toBe(false);
    });

    it('정확히 0.5%인 매치업은 포함한다', () => {
      const matchups: MatchupBreakdown[] = [
        { playerRank: HandRank.ONE_PAIR, computerRank: HandRank.HIGH_CARD, wins: 5, ties: 0, losses: 0, total: 5 }, // 0.5%
      ];
      const total = 1000;

      const significant = filterSignificantMatchups(matchups, total);

      expect(significant.length).toBe(1);
    });
  });

  describe('탭 기본값 로직', () => {
    const getDefaultTab = (
      winCount: number,
      tieCount: number,
      lossCount: number
    ): 'win' | 'tie' | 'loss' => {
      if (winCount > 0) return 'win';
      if (lossCount > 0) return 'loss';
      return 'tie';
    };

    it('승리 결과가 있으면 win 탭이 기본값이다', () => {
      expect(getDefaultTab(10, 5, 3)).toBe('win');
    });

    it('승리 결과가 없고 패배 결과가 있으면 loss 탭이 기본값이다', () => {
      expect(getDefaultTab(0, 5, 3)).toBe('loss');
    });

    it('승리와 패배 결과가 없으면 tie 탭이 기본값이다', () => {
      expect(getDefaultTab(0, 5, 0)).toBe('tie');
    });

    it('모든 결과가 없어도 tie를 반환한다', () => {
      expect(getDefaultTab(0, 0, 0)).toBe('tie');
    });
  });

  describe('HandRank 값', () => {
    it('HandRank 값이 올바르게 정의되어 있다', () => {
      expect(HandRank.HIGH_CARD).toBe(1);
      expect(HandRank.ONE_PAIR).toBe(2);
      expect(HandRank.TWO_PAIR).toBe(3);
      expect(HandRank.THREE_OF_A_KIND).toBe(4);
      expect(HandRank.STRAIGHT).toBe(5);
      expect(HandRank.FLUSH).toBe(6);
      expect(HandRank.FULL_HOUSE).toBe(7);
      expect(HandRank.FOUR_OF_A_KIND).toBe(8);
      expect(HandRank.STRAIGHT_FLUSH).toBe(9);
      expect(HandRank.ROYAL_FLUSH).toBe(10);
    });

    it('핸드 랭크가 높을수록 강하다', () => {
      expect(HandRank.ONE_PAIR).toBeGreaterThan(HandRank.HIGH_CARD);
      expect(HandRank.TWO_PAIR).toBeGreaterThan(HandRank.ONE_PAIR);
      expect(HandRank.ROYAL_FLUSH).toBeGreaterThan(HandRank.STRAIGHT_FLUSH);
    });
  });
});
