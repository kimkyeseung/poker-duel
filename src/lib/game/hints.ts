import { Card, WinRateResult } from '@/types';

// 힌트 타입
export type HintType = 'range' | 'direction' | 'outs';

// 힌트 정보
export interface Hint {
  type: HintType;
  message: string;
  icon: string;
}

// 범위 힌트 생성
export function getRangeHint(winRate: number): Hint {
  if (winRate >= 80) {
    return {
      type: 'range',
      message: '당신이 매우 유리합니다! (80% 이상)',
      icon: '🔥',
    };
  } else if (winRate >= 60) {
    return {
      type: 'range',
      message: '당신이 유리한 편입니다. (60% 이상)',
      icon: '👍',
    };
  } else if (winRate >= 40) {
    return {
      type: 'range',
      message: '거의 비슷한 상황입니다. (40~60%)',
      icon: '⚖️',
    };
  } else if (winRate >= 20) {
    return {
      type: 'range',
      message: '상대방이 유리한 편입니다. (40% 미만)',
      icon: '👎',
    };
  } else {
    return {
      type: 'range',
      message: '상대방이 매우 유리합니다! (20% 미만)',
      icon: '❄️',
    };
  }
}

// 방향 힌트 (누가 유리한지만)
export function getDirectionHint(winRateResult: WinRateResult): Hint {
  const { playerWinRate, computerWinRate } = winRateResult;

  if (playerWinRate > computerWinRate) {
    return {
      type: 'direction',
      message: '당신이 더 유리합니다.',
      icon: '↑',
    };
  } else if (computerWinRate > playerWinRate) {
    return {
      type: 'direction',
      message: '상대방이 더 유리합니다.',
      icon: '↓',
    };
  } else {
    return {
      type: 'direction',
      message: '거의 동등한 상황입니다.',
      icon: '↔️',
    };
  }
}

// 아웃츠 계산 (간단한 버전)
export function countOuts(
  playerHand: [Card, Card],
  communityCards: Card[],
  needed: 'pair' | 'straight' | 'flush'
): number {
  // 간단한 아웃츠 계산
  // 실제로는 더 복잡한 로직이 필요하지만, 기본적인 아이디어만 구현

  const allCards = [...playerHand, ...communityCards];
  const ranks = allCards.map(c => c.rank);
  const suits = allCards.map(c => c.suit);

  switch (needed) {
    case 'pair':
      // 각 랭크별로 남은 카드 수
      const uniqueRanks = new Set(ranks);
      return uniqueRanks.size * 3; // 대략적 계산

    case 'flush':
      // 같은 수트 카운트
      const suitCounts: Record<string, number> = {};
      for (const suit of suits) {
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
      }
      const maxSuitCount = Math.max(...Object.values(suitCounts));
      if (maxSuitCount >= 4) return 9; // 플러시 드로우
      if (maxSuitCount >= 3) return 13 - maxSuitCount; // 백도어 플러시
      return 0;

    case 'straight':
      // 스트레이트 가능성 체크 (간략화)
      return 8; // 양방향 스트레이트 드로우 가정

    default:
      return 0;
  }
}

// 아웃츠 힌트 생성
export function getOutsHint(
  playerHand: [Card, Card],
  communityCards: Card[]
): Hint {
  const flushOuts = countOuts(playerHand, communityCards, 'flush');

  if (flushOuts >= 9) {
    return {
      type: 'outs',
      message: `플러시 드로우가 있습니다! (약 ${flushOuts}장의 아웃츠)`,
      icon: '♠️',
    };
  }

  return {
    type: 'outs',
    message: '특별한 드로우가 없습니다.',
    icon: '🃏',
  };
}
