# Hol'Damn It! - 프로젝트 가이드

## 프로젝트 개요

Texas Hold'em 승률 예측 게임. 각 라운드에서 승률을 맞추고, **한 번 틀리면 게임오버**.

### 핵심 규칙
- **6단계 난이도**: 쉬움 → 보통 → 어려움 → 전문가 → 홀덤왕 → 홀덤의 신
- **5명의 상대**: 상대1 → 상대2 → 스몰블라인드 → 빅블라인드 → 딜러
- **4라운드**: 프리플랍(30초) → 플랍(60초) → 턴(60초) → 리버(배팅)
- 딜러 격파 시 다음 난이도, 모든 난이도 클리어 시 승리

### 난이도별 입력 (플랍/턴)

프리플랍은 난이도와 무관하게 항상 2지선다다. 아래는 플랍/턴에 적용된다.

| 난이도 | 입력 방식 | 허용 오차 | 프리플랍 핸드랭킹 상한 |
|--------|----------|----------|----------------------|
| 쉬움 | 2지선다 (나/딜러) | - | 없음 |
| 보통 | 5지선다 (0-20 … 80-100) | - | 60 |
| 어려움 | 직접 입력 | ±10% | 40 |
| 전문가 | 직접 입력 | ±5% | 25 |
| 홀덤왕 | 직접 입력 | ±3% | 15 |
| 홀덤의 신 | 직접 입력 | ±1% | 8 |

`DIFFICULTY_CONFIG` (`types/poker.ts`)가 단일 출처다. 난이도가 오를수록
입력 정밀도와 프리플랍 핸드 구분이 함께 어려워진다.

### 상대별 핸드 매칭
| 상대 | 핸드 매칭 | 시각적 필터링 |
|------|----------|--------------|
| 상대1, 상대2 | 완전 랜덤 | ❌ |
| 스몰 블라인드 | ±30 범위 | ❌ |
| 빅 블라인드 | ±15 범위 | ✅ |
| 딜러 | ±5 범위 | ✅ |

실제 적용 범위 = **min(상대별 범위, 난이도 상한)**. 상대1·2는 상한이 있는
난이도에서 "완전 랜덤" 대신 그 폭으로 매칭된다. 예를 들어 홀덤의 신에서는
상대1도 ±8, 스몰 블라인드도 ±8, 딜러는 ±5가 된다.

상대가 바뀔 때마다 덱을 새로 섞는다(`nextOpponent`). 남은 덱을 그대로
쓰면 카드가 고갈돼 매칭 범위 안의 핸드를 못 찾고 조용히 랜덤으로
폴백한다 — 딜러 ±5가 약 47% 확률로 깨지던 원인이었다.

## 기술 스택

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Zustand + Supabase

## 핵심 로직

### 프리플랍 (중요)
- **승률 계산 안 함** - 169개 핸드랭킹으로만 승패 결정
- 모든 난이도에서 2지선다, 제한 시간 30초
- `lib/poker/starting-hands.ts` 참조

### 승률 계산 (플랍/턴)
- 플랍: 990개 조합 완전탐색
- 턴: 44개 조합 완전탐색
- Web Worker 비동기 계산 (`public/workers/poker-calculator.js`)

### 칩 시스템
- **시간 보너스**: 기본칩 × (1 + 남은시간/제한시간)
- **난이도별 기본칩**: easy(10), normal(20), hard(30), expert(50), king(100), god(200)
- **리버 배팅**: 배당률 = (100 - 승률) / 승률 + 1 (범위: 1.05 ~ 10.0)
- `lib/game/chips.ts` 참조

### 번 카드 시스템
- 플랍 전 1장, 턴 전 1장, 리버 전 1장 버림
- `burnCards` 배열로 추적, Table 컴포넌트에서 시각화

### 핸드 매칭
```tsx
import { generateOpponentHand } from '@/lib/poker/hand-matcher';
const opponentHand = generateOpponentHand(opponentType, playerHand, availableCards);
```

## 주요 디렉토리

```
src/
├── app/          # 페이지 (game, practice, daily, stats, settings, comments)
├── components/   # game/ (게임 UI), ui/ (공통 UI)
├── hooks/        # usePokerCalculator (Web Worker 래퍼)
├── lib/          # poker/ (엔진), audio/ (사운드), i18n/ (번역), game/ (칩), supabase/ (DB)
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
- 클라우드: Supabase (`lib/supabase`)

## 주의사항

### 프리플랍
- `currentRound === 'preflop'`일 때 항상 ChoiceInput 표시
- 승률 계산 절대 하지 않음

### 타입
- `AnswerResult.correctAnswer`: `string | number` (프리플랍: 'player'/'computer')
- `WinRateResult`: 모든 필드 필수
- `Difficulty`: 'easy' | 'normal' | 'hard' | 'expert' | 'king' | 'god'

### useEffect
- store 함수(`initGame` 등)는 의존성 배열에서 제외

### i18n
- 7개 언어 지원 (en, es, fr, it, ja, zh, ko)
- 새 문자열 추가 시 모든 언어에 번역 필요

## 스토리지 키

| 키 | 저장소 | 용도 |
|----|--------|------|
| `holdamnit-stats` | localStorage | 게임 통계 |
| `holdamnit-settings` | localStorage | 설정 |
| `holdamnit-locale` | localStorage | 언어 설정 |
| `holdamnit-tutorial-seen` | localStorage | 튜토리얼 완료 |
| `holdamnit-chip-highscore` | localStorage | 칩 최고 기록 |
| `holdamnit-comments` | localStorage | 코멘트 목록 |
| `holdamnit-started` | **sessionStorage** | Click to Start 오버레이 해제 여부 (탭을 닫으면 초기화) |

## Supabase 연동

### 테이블
- `leaderboard`: 전체 리더보드 (id, player_name, chips, difficulty_reached, country_code, created_at)
- `daily_leaderboard`: 일일 리더보드 (id, player_name, chips, date, country_code, created_at)

### 쓰기 경로 (중요)
anon 키가 클라이언트에 노출되므로 **테이블 직접 INSERT는 막혀 있다**.
점수 쓰기는 검증 + 레이트리밋을 거치는 RPC로만 가능하다.
- `submit_leaderboard_score(p_player_name, p_chips, p_difficulty_reached, p_country_code)`
- `submit_daily_score(p_player_name, p_chips, p_country_code)`

`id` / `created_at` / `date`는 인자에 없으며 서버가 정한다. UPDATE/DELETE는 불가.
스키마 변경 시 `supabase/schema.sql`을 수정하고 SQL Editor에서 **파일 전체를**
재실행한다 (신규 설치와 기존 배포 업그레이드 모두 처리하는 멱등 스크립트).
일부만 선택해 실행하면 DROP/CREATE 짝이 깨져 롤백된다.

### 비밀값
IP 해시용 salt는 `private.app_secrets` 테이블에 있으며 **저장소에 두지 않는다**.
`schema.sql`이 없을 때만 DB 안에서 생성하므로 재실행해도 기존 salt는 보존된다.
`private` 스키마는 anon/authenticated 접근이 회수되어 있어
SECURITY DEFINER 함수만 읽을 수 있다.

### API
```tsx
import { getLeaderboard, submitScore } from '@/lib/supabase/leaderboard';

// 리더보드 조회
const entries = await getLeaderboard(100);

// 점수 제출
const result = await submitScore(playerName, chips, difficultyReached, countryCode);
```

## 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run test:run     # 유닛 테스트
npm run test:e2e     # E2E 테스트
npm run tauri:dev    # 데스크톱 앱
```
