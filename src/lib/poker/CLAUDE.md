# 포커 엔진 가이드

## 파일 구조

| 파일 | 역할 |
|------|------|
| `deck.ts` | 덱 생성, 셔플 |
| `evaluator.ts` | 7장→5장 핸드 평가 |
| `calculator.ts` | 승률 계산 (완전탐색) |
| `starting-hands.ts` | 169개 프리플랍 핸드랭킹 |
| `hand-matcher.ts` | 상대 핸드 생성 로직 |

## 핸드 매칭 시스템

### 상대별 규칙
```
opponent1, opponent2: 완전 랜덤
smallBlind: 플레이어 핸드 ±30 범위
bigBlind: ±15 범위 + 시각적 필터링
dealer: ±5 범위 + 시각적 필터링
```

### 주요 함수
```tsx
// 메인 함수 - 상대 타입에 맞는 핸드 생성
generateOpponentHand(opponentType, playerHand, availableCards)

// 핸드명 관련
getRandomHandName()                    // 랜덤 핸드명
getMatchedHandName(rank, range)        // 범위 내 핸드명
getFilteredMatchedHandName(...)        // 시각적 필터링 적용

// 유틸리티
isVisuallyObvious(hand1, hand2)        // AA vs AKs 같은 명백한 차이 판단
findCardsForHandName(handName, cards)  // 핸드명에 해당하는 카드 찾기
```

### 시각적 필터링 예시
"눈에 띄는 차이"로 간주되어 제외:
- AA vs AKs (페어 vs 수티드)
- K9s vs T9s (같은 키커, 다른 하이카드)
- QQ vs 72o (극단적 차이)

## 승률 계산

### 조합 수
- **플랍** (5장 공개): 45C2 = 990개 (턴+리버)
- **턴** (6장 공개): 44개 (리버만)
- **리버**: 계산 불필요, 결과 확정

### Web Worker 사용
```tsx
import { usePokerCalculator } from '@/hooks/usePokerCalculator';

const { calculate, result, isCalculating } = usePokerCalculator();
calculate(playerHand, opponentHand, communityCards);
```

## 169개 핸드랭킹

프리플랍 전용. AA(1위) ~ 72o(169위)

```tsx
import { getHandRank, HAND_RANKINGS } from './starting-hands';

const rank = getHandRank(hand); // 1-169
```

## 테스트

- `starting-hands.test.ts`: 26개 (랭킹 정확성)
- `hand-matcher.test.ts`: 20개 (매칭 로직)
