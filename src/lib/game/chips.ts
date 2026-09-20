/**
 * 칩 시스템 유틸리티
 * - 시간 보너스 칩 계산
 * - 배당률 계산
 */

import { Difficulty } from '@/types';

// 난이도별 기본 칩
const BASE_CHIPS: Record<Difficulty, number> = {
  easy: 10,
  normal: 20,
  hard: 30,
  expert: 50,
  king: 100,
  god: 200,
};

// 난이도별 제한 시간 (프리플랍 제외)
const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 60,
  normal: 60,
  hard: 60,
  expert: 60,
  king: 60,
  god: 60,
};

/**
 * 시간 보너스 칩 계산
 * 공식: 기본칩 × (1 + 남은시간비율)
 * 예: 어려움(30칩) + 30초 남음(50%) = 30 × 1.5 = 45칩
 */
export function calculateChipReward(
  difficulty: Difficulty,
  remainingTime: number,
  isPreflop: boolean = false
): number {
  // 프리플랍은 보상 없음 (시간이 짧고, 난이도 무관하게 2지선다)
  if (isPreflop) {
    return 0;
  }

  const baseChips = BASE_CHIPS[difficulty];
  const totalTime = TIME_LIMITS[difficulty];

  // 시간 보너스 비율 (0~1)
  const timeBonus = Math.max(0, Math.min(1, remainingTime / totalTime));

  // 최종 획득 칩 (기본칩 × (1 + 시간보너스))
  const reward = Math.floor(baseChips * (1 + timeBonus));

  return reward;
}

/**
 * 배당률 계산
 * 공식: (100 - 승률) / 승률 + 1
 * 범위: 1.05 ~ 10.0
 */
export function calculateOdds(winRate: number): number {
  // 극단값 처리
  if (winRate >= 95) return 1.05;  // 최소 배당
  if (winRate <= 5) return 10.0;   // 최대 배당

  // 기본 공식
  const rawOdds = (100 - winRate) / winRate + 1;

  // 클램핑 (1.05 ~ 10.0)
  return Math.min(10.0, Math.max(1.05, Number(rawOdds.toFixed(2))));
}

/**
 * 배팅 결과 계산
 * @param betAmount 배팅 금액
 * @param odds 배당률
 * @param isWin 승리 여부
 * @returns 순수익 (승리: +금액, 패배: -배팅금액)
 */
export function calculateBetResult(
  betAmount: number,
  odds: number,
  isWin: boolean
): number {
  if (isWin) {
    // 승리: 배팅금액 × 배당률 (원금 포함)
    return Math.floor(betAmount * odds) - betAmount;
  } else {
    // 패배: 배팅금액 손실
    return -betAmount;
  }
}

/**
 * 배당률을 표시 문자열로 변환
 */
export function formatOdds(odds: number): string {
  return `${odds.toFixed(2)}x`;
}

/**
 * 칩을 표시 문자열로 변환 (천 단위 구분)
 */
export function formatChips(chips: number): string {
  return chips.toLocaleString();
}

/**
 * 예상 수익 계산
 */
export function calculateExpectedPayout(betAmount: number, odds: number): number {
  return Math.floor(betAmount * odds);
}

/**
 * 베팅 결과 판정
 *
 * 리버 카드까지 깔린 뒤의 승률로 판정한다. 보드가 완성된 시점이라
 * 승률은 100/0 중 하나이거나, 스플릿 팟이면 양쪽 모두 0이 된다.
 * 스플릿은 판돈을 돌려주는 푸시다 (패배로 처리하면 전액을 잃는다).
 */
export type BetOutcome = 'win' | 'loss' | 'push';

export function getBetOutcome(
  playerWinRate: number,
  computerWinRate: number
): BetOutcome {
  if (playerWinRate === computerWinRate) return 'push';
  return playerWinRate > computerWinRate ? 'win' : 'loss';
}

/**
 * 판정까지 포함한 베팅 정산 (칩 증감분 반환)
 */
export function resolveBet(
  betAmount: number,
  odds: number,
  outcome: BetOutcome
): number {
  if (outcome === 'push') return 0;
  return calculateBetResult(betAmount, odds, outcome === 'win');
}
