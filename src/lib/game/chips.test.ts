import { describe, it, expect } from 'vitest';
import {
  calculateChipReward,
  calculateOdds,
  calculateBetResult,
  formatOdds,
  formatChips,
  calculateExpectedPayout,
} from './chips';

describe('calculateChipReward', () => {
  it('returns 0 for preflop', () => {
    expect(calculateChipReward('easy', 30, true)).toBe(0);
    expect(calculateChipReward('god', 60, true)).toBe(0);
  });

  it('returns base chips when no time remaining', () => {
    expect(calculateChipReward('easy', 0, false)).toBe(10);
    expect(calculateChipReward('normal', 0, false)).toBe(20);
    expect(calculateChipReward('hard', 0, false)).toBe(30);
    expect(calculateChipReward('expert', 0, false)).toBe(50);
    expect(calculateChipReward('king', 0, false)).toBe(100);
    expect(calculateChipReward('god', 0, false)).toBe(200);
  });

  it('returns double chips when full time remaining', () => {
    expect(calculateChipReward('easy', 60, false)).toBe(20);
    expect(calculateChipReward('normal', 60, false)).toBe(40);
    expect(calculateChipReward('hard', 60, false)).toBe(60);
    expect(calculateChipReward('expert', 60, false)).toBe(100);
    expect(calculateChipReward('king', 60, false)).toBe(200);
    expect(calculateChipReward('god', 60, false)).toBe(400);
  });

  it('returns 1.5x chips when half time remaining', () => {
    expect(calculateChipReward('easy', 30, false)).toBe(15);
    expect(calculateChipReward('hard', 30, false)).toBe(45);
    expect(calculateChipReward('god', 30, false)).toBe(300);
  });

  it('clamps negative time to 0', () => {
    expect(calculateChipReward('easy', -10, false)).toBe(10);
  });

  it('clamps excessive time to max', () => {
    expect(calculateChipReward('easy', 120, false)).toBe(20);
  });
});

describe('calculateOdds', () => {
  it('returns minimum odds (1.05) for high win rates', () => {
    expect(calculateOdds(95)).toBe(1.05);
    expect(calculateOdds(99)).toBe(1.05);
    expect(calculateOdds(100)).toBe(1.05);
  });

  it('returns maximum odds (10.0) for low win rates', () => {
    expect(calculateOdds(5)).toBe(10.0);
    expect(calculateOdds(1)).toBe(10.0);
    expect(calculateOdds(0)).toBe(10.0);
  });

  it('calculates correct odds for 50% win rate', () => {
    // (100 - 50) / 50 + 1 = 2.0
    expect(calculateOdds(50)).toBe(2);
  });

  it('calculates correct odds for 25% win rate', () => {
    // (100 - 25) / 25 + 1 = 4.0
    expect(calculateOdds(25)).toBe(4);
  });

  it('calculates correct odds for 75% win rate', () => {
    // (100 - 75) / 75 + 1 = 1.33
    expect(calculateOdds(75)).toBe(1.33);
  });

  it('calculates correct odds for 10% win rate', () => {
    // (100 - 10) / 10 + 1 = 10.0
    expect(calculateOdds(10)).toBe(10.0);
  });

  it('calculates correct odds for 80% win rate', () => {
    // (100 - 80) / 80 + 1 = 1.25
    expect(calculateOdds(80)).toBe(1.25);
  });
});

describe('calculateBetResult', () => {
  it('returns profit on win', () => {
    // 100 bet * 2.0 odds - 100 = 100 profit
    expect(calculateBetResult(100, 2.0, true)).toBe(100);
  });

  it('returns negative bet amount on loss', () => {
    expect(calculateBetResult(100, 2.0, false)).toBe(-100);
    expect(calculateBetResult(500, 1.5, false)).toBe(-500);
  });

  it('calculates correct profit with various odds', () => {
    // 100 bet * 1.5 odds - 100 = 50 profit
    expect(calculateBetResult(100, 1.5, true)).toBe(50);
    // 100 bet * 3.0 odds - 100 = 200 profit
    expect(calculateBetResult(100, 3.0, true)).toBe(200);
  });

  it('floors the result', () => {
    // 100 bet * 1.33 odds - 100 = 33 profit (floored)
    expect(calculateBetResult(100, 1.33, true)).toBe(33);
  });
});

describe('formatOdds', () => {
  it('formats odds with 2 decimal places and x suffix', () => {
    expect(formatOdds(1.05)).toBe('1.05x');
    expect(formatOdds(2)).toBe('2.00x');
    expect(formatOdds(10)).toBe('10.00x');
    expect(formatOdds(1.333)).toBe('1.33x');
  });
});

describe('formatChips', () => {
  it('formats chips with locale string', () => {
    expect(formatChips(1000)).toBe('1,000');
    expect(formatChips(1234567)).toBe('1,234,567');
    expect(formatChips(100)).toBe('100');
  });
});

describe('calculateExpectedPayout', () => {
  it('calculates expected payout', () => {
    expect(calculateExpectedPayout(100, 2.0)).toBe(200);
    expect(calculateExpectedPayout(100, 1.5)).toBe(150);
    expect(calculateExpectedPayout(100, 10.0)).toBe(1000);
  });

  it('floors the result', () => {
    expect(calculateExpectedPayout(100, 1.33)).toBe(133);
  });
});
