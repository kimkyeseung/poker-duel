import { describe, it, expect } from 'vitest';
import { checkAnswer } from './calculator';
import { getOpponentHandName } from './hand-matcher';
import { DIFFICULTY_CONFIG, OPPONENT_CONFIGS, Difficulty, WinRateResult } from '@/types';
import { getRankByHandName } from './hand-matcher';

function wr(playerWinRate: number): WinRateResult {
  return {
    playerWinRate,
    computerWinRate: 100 - playerWinRate,
    tieRate: 0,
    totalCombinations: 1000,
    playerWins: 0,
    computerWins: 0,
    ties: 0,
  };
}

describe('난이도 사다리 - 입력 방식', () => {
  it('쉬움은 2지선다(누가 유리한가)', () => {
    expect(DIFFICULTY_CONFIG.easy.inputType).toBe('choice');
    expect(checkAnswer('easy', 'player', wr(70))).toBe(true);
    expect(checkAnswer('easy', 'computer', wr(70))).toBe(false);
  });

  it('보통은 5지선다', () => {
    expect(DIFFICULTY_CONFIG.normal.inputType).toBe('range');
    // 0-20 / 20-40 / 40-60 / 60-80 / 80-100
    expect(checkAnswer('normal', '60-80', wr(72))).toBe(true);
    expect(checkAnswer('normal', '40-60', wr(72))).toBe(false);
    expect(checkAnswer('normal', '0-20', wr(5))).toBe(true);
    expect(checkAnswer('normal', '80-100', wr(95))).toBe(true);
  });

  it('어려움은 직접 입력 ±10%', () => {
    expect(DIFFICULTY_CONFIG.hard.inputType).toBe('input');
    expect(DIFFICULTY_CONFIG.hard.tolerance).toBe(10);
    expect(checkAnswer('hard', 50, wr(60))).toBe(true);   // 정확히 10
    expect(checkAnswer('hard', 49, wr(60))).toBe(false);  // 11
    expect(checkAnswer('hard', 70, wr(60))).toBe(true);
  });

  it('전문가/홀덤왕/홀덤의 신은 ±5 / ±3 / ±1', () => {
    expect(checkAnswer('expert', 55, wr(60))).toBe(true);
    expect(checkAnswer('expert', 54, wr(60))).toBe(false);
    expect(checkAnswer('king', 57, wr(60))).toBe(true);
    expect(checkAnswer('king', 56, wr(60))).toBe(false);
    expect(checkAnswer('god', 59, wr(60))).toBe(true);
    expect(checkAnswer('god', 58, wr(60))).toBe(false);
  });

  it('허용 오차가 난이도가 오를수록 좁아진다', () => {
    const tolerances = (['hard', 'expert', 'king', 'god'] as Difficulty[]).map(
      (d) => DIFFICULTY_CONFIG[d].tolerance!
    );
    expect(tolerances).toEqual([10, 5, 3, 1]);
    for (let i = 1; i < tolerances.length; i++) {
      expect(tolerances[i]).toBeLessThan(tolerances[i - 1]);
    }
  });

  it('3지선다는 더 이상 쓰이지 않는다', () => {
    const inputTypes = Object.values(DIFFICULTY_CONFIG).map((c) => c.inputType);
    expect(inputTypes).not.toContain('choice3');
  });
});

describe('난이도별 핸드랭킹 상한', () => {
  const DIFFS: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'king', 'god'];

  it('난이도가 오를수록 상한이 좁아진다 (쉬움은 상한 없음)', () => {
    expect(DIFFICULTY_CONFIG.easy.handRankCap).toBeUndefined();
    const caps = DIFFS.slice(1).map((d) => DIFFICULTY_CONFIG[d].handRankCap!);
    expect(caps).toEqual([60, 40, 25, 15, 8]);
    for (let i = 1; i < caps.length; i++) {
      expect(caps[i]).toBeLessThan(caps[i - 1]);
    }
  });

  /** 플레이어 랭킹 대비 상대 핸드의 실제 편차를 표본으로 측정 */
  function maxDeviation(difficulty: Difficulty, opponentIndex: number, runs = 600) {
    const cap = DIFFICULTY_CONFIG[difficulty].handRankCap;
    const type = OPPONENT_CONFIGS[opponentIndex].type;
    let worst = 0;
    for (let i = 0; i < runs; i++) {
      const playerRank = 1 + Math.floor(Math.random() * 169);
      const name = getOpponentHandName(type, 'AA', playerRank, cap);
      worst = Math.max(worst, Math.abs(getRankByHandName(name) - playerRank));
    }
    return worst;
  }

  it('모든 난이도/상대에서 상한과 상대별 규칙 중 좁은 쪽을 지킨다', () => {
    const opponentRanges = [Infinity, Infinity, 30, 15, 5]; // 상대1,2 랜덤 / 스몰 / 빅 / 딜러
    for (const d of DIFFS) {
      const cap = DIFFICULTY_CONFIG[d].handRankCap ?? Infinity;
      for (let i = 0; i < OPPONENT_CONFIGS.length; i++) {
        const limit = Math.min(cap, opponentRanges[i]);
        if (limit === Infinity) continue;
        const dev = maxDeviation(d, i);
        expect(dev, `${d} / ${OPPONENT_CONFIGS[i].type} 최대편차 ${dev} > ${limit}`).toBeLessThanOrEqual(limit);
      }
    }
  });

  it('쉬움의 상대1은 상한이 없어 랭킹 전체에서 나온다', () => {
    expect(maxDeviation('easy', 0, 1500)).toBeGreaterThan(60);
  });

  it('홀덤의 신에서는 완전 랜덤이던 상대1도 좁게 매칭된다', () => {
    expect(maxDeviation('god', 0)).toBeLessThanOrEqual(8);
  });
});
