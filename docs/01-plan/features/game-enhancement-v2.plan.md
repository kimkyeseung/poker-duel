# Game Enhancement v2 - Plan Document

> **Feature**: 칩 시스템, 난이도 재조정, 번카드, Supabase 연동
> **Created**: 2024-02-12
> **Updated**: 2026-02-12
> **Status**: Implemented

---

## 1. Overview

### 1.1 Background
현재 리버 단계가 단순 확인으로 끝나며, 난이도 곡선이 가파르고, 게임 진행 상황이 저장되지 않는 문제가 있음.

### 1.2 Goals
- 칩/배팅 시스템으로 리버 단계에 전략적 요소 추가
- 난이도 곡선 완화 및 새 난이도 추가
- 번카드 시각화로 텍사스 홀덤 규칙 반영
- Supabase 연동으로 리더보드 구현

### 1.3 Scope

| 포함 | 제외 (향후 개발) |
|------|-----------------|
| 칩 시스템 | 클라우드 저장 |
| 난이도 재조정 (6단계) | 소셜 기능 |
| 번카드 시각화 (표준 홀덤 규칙) | 업적/해금 시스템 |
| 리더보드 | 전략적 번카드 선택 |

---

## 2. Phases (개발 순서)

### Phase 1: 난이도 재조정 ✅
> 기존 코드 수정, 리스크 낮음

### Phase 2: 칩 시스템 ✅
> 새 기능, 번카드 없이 먼저

### Phase 3: 번카드 시스템 ✅
> 표준 텍사스 홀덤 규칙 (순차 번)

### Phase 4: Supabase 연동 ✅
> 리더보드 API

---

## 3. Phase 1: 난이도 재조정

### 3.1 현재 vs 변경

| 난이도 | 현재 | 변경 |
|--------|------|------|
| 쉬움 | 2지선다 (나/컴퓨터) | **그대로** |
| 보통 | 5지선다 (20% 단위) | **3지선다** (나/비김/컴퓨터) |
| 어려움 | 직접입력 ±5% | **슬라이더** (5% 단위) |
| 전문가 | 직접입력 ±3% | **직접입력 ±5%** |
| 홀덤왕 | ❌ 없음 | **신규**, 직접입력 ±3% |
| 홀덤의 신 | ❌ 없음 | **신규**, 직접입력 ±1% |

### 3.2 3지선다 옵션 정의

```typescript
// 보통 난이도 - 3지선다
type Choice3Option = 'player' | 'tie' | 'computer';

// 정답 판정: 승률에 따라 결정
// 0~35% → computer, 35~65% → tie, 65~100% → player
```

### 3.3 영향 받는 파일
- `src/types/poker.ts` - Difficulty 타입에 'king', 'god' 추가
- `src/types/poker.ts` - DIFFICULTY_CONFIG 수정
- `src/components/game/AnswerInput.tsx` - Choice3Input 추가

---

## 4. Phase 2: 칩 시스템

### 4.1 칩 획득 (시간 보너스)

**공식**:
```typescript
const BASE_CHIPS = {
  easy: 10,
  normal: 20,
  hard: 30,
  expert: 50,
  king: 100,
  god: 200,
};

// 최종 획득 칩 = 기본칩 × (1 + 남은시간/제한시간)
const earnedChips = BASE_CHIPS[difficulty] * (1 + remainingTime / totalTime);
```

**난이도별 예상 획득 칩 범위**:
| 난이도 | 기본 | 최대 (시간 100%) | 최소 (시간 0%) |
|--------|------|------------------|----------------|
| 쉬움 | 10 | 20 | 10 |
| 보통 | 20 | 40 | 20 |
| 어려움 | 30 | 60 | 30 |
| 전문가 | 50 | 100 | 50 |
| 홀덤왕 | 100 | 200 | 100 |
| 홀덤의 신 | 200 | 400 | 200 |

### 4.2 리버 배팅 시스템

**배당률 공식**:
```typescript
function calculateOdds(winRate: number): number {
  if (winRate >= 95) return 1.05;  // 최소 배당
  if (winRate <= 5) return 10.0;   // 최대 배당

  const rawOdds = (100 - winRate) / winRate + 1;
  return Math.min(10.0, Math.max(1.05, rawOdds));
}
```

### 4.3 리버 UI 흐름

```
[리버 카드 공개]
     ↓
[배팅 선택 UI]
┌─────────────────────────────────┐
│  현재 칩: 350                    │
│  배당률: 2.5배                   │
│                                 │
│  [25%] [50%] [75%] [ALL IN]     │
│  [스킵]                         │
│                                 │
│  예상 수익: +875칩 (승리 시)      │
└─────────────────────────────────┘
     ↓
[결과 공개] → 승리: 칩 획득 / 패배: 칩 손실
```

### 4.4 영향 받는 파일
- `src/stores/gameStore.ts` - chips 상태 추가
- `src/types/game.ts` - GameState에 chips, lastChipReward 추가
- `src/components/game/RiverBetting.tsx` - 신규 컴포넌트
- `src/components/game/ChipDisplay.tsx` - 신규 컴포넌트
- `src/lib/game/chips.ts` - 칩 계산 유틸리티
- `src/lib/storage/index.ts` - 칩 최고 기록 저장

---

## 5. Phase 3: 번카드 시스템

### 5.1 표준 텍사스 홀덤 규칙

텍사스 홀덤에서 딜러는 각 거리(street) 전에 1장의 카드를 버립니다 (burn):
- 플랍 전: 1장 번
- 턴 전: 1장 번
- 리버 전: 1장 번

> **참고**: 전략적 번카드 선택 기능은 향후 개발 범위로 이관

### 5.2 번카드 추적

```typescript
interface GameState {
  // ...
  burnCards: Card[];  // 플랍 전 1장, 턴 전 1장, 리버 전 1장
}

// nextRound()에서 처리
if (nextRound === 'flop') {
  burnCards = [deck[0]];           // 1장 번
  communityCards = deck.slice(1, 4); // 3장 공개
  deck = deck.slice(4);
}
```

### 5.3 번카드 UI

**위치**: 테이블 왼쪽에 뒤집힌 카드 스택으로 표시

```
┌─────────────────────────────────────────┐
│  [BURN]     [커뮤니티 카드 5장]          │
│  [🂠🂠]      [🂡 🂢 🂣 🂤 🂥]              │
│                                        │
└─────────────────────────────────────────┘
```

### 5.4 영향 받는 파일
- `src/types/game.ts` - GameState에 burnCards 추가
- `src/stores/gameStore.ts` - nextRound()에서 번카드 처리
- `src/components/game/Table.tsx` - 번카드 시각화

---

## 6. Phase 4: Supabase 연동

### 6.1 테이블 스키마

```sql
-- 리더보드
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  chips INTEGER NOT NULL,
  difficulty_reached TEXT NOT NULL,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일일 리더보드
CREATE TABLE daily_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  chips INTEGER NOT NULL,
  date DATE NOT NULL,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 API 함수

```typescript
// src/lib/supabase/leaderboard.ts
getLeaderboard(limit: number): Promise<LeaderboardEntry[]>
submitScore(playerName, chips, difficultyReached, countryCode?): Promise<Result>
getDailyLeaderboard(date?, limit): Promise<DailyLeaderboardEntry[]>
submitDailyScore(playerName, chips, countryCode?): Promise<Result>
getPlayerRank(chips: number): Promise<number | null>
```

### 6.3 영향 받는 파일
- `src/lib/supabase/client.ts` - Supabase 클라이언트
- `src/lib/supabase/leaderboard.ts` - 리더보드 API
- `src/lib/supabase/types.ts` - 타입 정의
- `src/components/ui/Leaderboard.tsx` - 리더보드 UI
- `src/components/ui/ScoreSubmitDialog.tsx` - 점수 제출 다이얼로그

### 6.4 향후 개발 (제외)
- 클라우드 저장 (game_saves 테이블)
- 기기 식별자 (device_id)
- 업적/해금 시스템 (unlocks 테이블)
- 이어하기 UI

---

## 7. 작업 체크리스트

### Phase 1: 난이도 재조정 ✅
- [x] Difficulty 타입에 'king', 'god' 추가
- [x] DIFFICULTY_CONFIG 수정
- [x] 3지선다 Choice3Input 구현
- [x] 슬라이더 RangeInput 어려움에 적용
- [x] 전문가 허용 오차 ±5%로 변경
- [x] 홀덤왕 난이도 추가 (±3%)
- [x] 홀덤의 신 난이도 추가 (±1%)
- [x] i18n 번역 추가 (7개 언어)

### Phase 2: 칩 시스템 ✅
- [x] GameState에 chips, lastChipReward 추가
- [x] 시간 보너스 칩 계산 로직 (chips.ts)
- [x] 라운드 정답 시 칩 획득 UI (ChipDisplay)
- [x] 리버 배팅 UI 컴포넌트 (RiverBetting)
- [x] 배당률 계산 로직 (calculateOdds)
- [x] 배팅 결과 처리 로직 (calculateBetResult)
- [x] 최고 점수 localStorage 저장

### Phase 3: 번카드 시스템 ✅
- [x] burnCards 상태 추가
- [x] 플랍/턴/리버 전 번카드 처리
- [x] Table 컴포넌트에 번카드 시각화

### Phase 4: Supabase 연동 ✅
- [x] Supabase 프로젝트 설정
- [x] leaderboard, daily_leaderboard 테이블 생성
- [x] 리더보드 API (5개 함수)
- [x] Leaderboard UI 컴포넌트
- [x] ScoreSubmitDialog 컴포넌트

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Supabase 무료 티어 한도 | 낮 | 리더보드만 사용 |
| 배당률 밸런스 | 중 | 1.05~10.0 클램핑 |
| 칩 인플레이션 | 낮 | 난이도별 기본칩 조정 |

---

## 9. 향후 개발 사항

### v2.1 예정
- 클라우드 저장 (이어하기 기능)
- 전략적 번카드 선택 (승률 기반)
- 업적/해금 시스템

### 장기 계획
- 소셜 기능 (친구 초대, 공유)
- 시즌제 리더보드
- 무한 모드

---

**Status**: ✅ Completed (2026-02-12)
