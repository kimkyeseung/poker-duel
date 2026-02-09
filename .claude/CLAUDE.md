# Hol'Damn It! - 프로젝트 가이드

## 프로젝트 개요

Texas Hold'em 승률 예측 게임. 각 라운드에서 승률을 맞추고, **한 번 틀리면 게임오버**.

### 핵심 규칙
- **5단계 난이도**: 쉬움 → 보통 → 어려움 → 전문가 → 홀덤의 신
- **5명의 상대**: 상대1 → 상대2 → 스몰블라인드 → 빅블라인드 → 딜러
- **4라운드**: 프리플랍(5초) → 플랍(60초) → 턴(60초) → 리버(확인)
- 딜러 격파 시 다음 난이도, 모든 난이도 클리어 시 승리

### 난이도별 입력
| 난이도 | 입력 방식 | 허용 오차 |
|--------|----------|----------|
| 쉬움 | 2지선다 (나/컴퓨터) | - |
| 보통 | 5지선다 (20% 단위) | - |
| 어려움 | 직접 입력 | ±5% |
| 전문가 | 직접 입력 | ±3% |
| 홀덤의 신 | 직접 입력 | ±1% |

### 상대별 핸드 매칭
| 상대 | 핸드 매칭 | 시각적 필터링 |
|------|----------|--------------|
| 상대1, 상대2 | 완전 랜덤 | ❌ |
| 스몰 블라인드 | ±30 범위 | ❌ |
| 빅 블라인드 | ±15 범위 | ✅ |
| 딜러 | ±5 범위 | ✅ |

## 기술 스택

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Zustand

## 핵심 로직

### 프리플랍 (중요)
- **승률 계산 안 함** - 169개 핸드랭킹으로만 승패 결정
- 모든 난이도에서 2지선다, 제한 시간 5초
- `lib/poker/starting-hands.ts` 참조

### 승률 계산 (플랍/턴)
- 플랍: 990개 조합 완전탐색
- 턴: 44개 조합 완전탐색
- Web Worker 비동기 계산 (`public/workers/poker-calculator.js`)

### 핸드 매칭
```tsx
import { generateOpponentHand } from '@/lib/poker/hand-matcher';
const opponentHand = generateOpponentHand(opponentType, playerHand, availableCards);
```

## 주요 디렉토리

```
src/
├── app/          # 페이지 (game, practice, daily, stats, settings)
├── components/   # game/ (게임 UI), ui/ (공통 UI)
├── lib/          # poker/ (엔진), audio/ (사운드), i18n/ (번역), game/ (시스템)
├── stores/       # gameStore, localeStore
└── types/        # poker.ts, game.ts
```

## 코딩 컨벤션

### 컴포넌트
```tsx
'use client';
import { useTranslation } from '@/lib/i18n';

export function Component() {
  const { t } = useTranslation();
  // ...
}
```

### 스타일링
- Tailwind CSS + `cn()` 유틸리티
- 색상: slate(배경), amber(액센트), emerald(성공), red(실패)

### 상태 관리
- 전역: Zustand (`gameStore`, `localeStore`)
- 영구 저장: localStorage (`lib/storage`)

## 주의사항

### 프리플랍
- `currentRound === 'preflop'`일 때 항상 ChoiceInput 표시
- 승률 계산 절대 하지 않음

### 타입
- `AnswerResult.correctAnswer`: `string | number` (프리플랍: 'player'/'computer')
- `WinRateResult`: 모든 필드 필수

### useEffect
- store 함수(`initGame` 등)는 의존성 배열에서 제외

### i18n
- 7개 언어 지원 (en, es, fr, it, ja, zh, ko)
- 새 문자열 추가 시 모든 언어에 번역 필요

## 스토리지 키

| 키 | 용도 |
|----|------|
| `holdamnit-stats` | 게임 통계 |
| `holdamnit-settings` | 설정 |
| `holdamnit-locale` | 언어 설정 |
| `holdamnit-tutorial-seen` | 튜토리얼 완료 |

## 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run test:run     # 유닛 테스트
npm run tauri:dev    # 데스크톱 앱
```
