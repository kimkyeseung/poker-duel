// 힌트 타입
export type HintType = 'range';

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
