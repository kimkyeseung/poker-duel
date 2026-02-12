# Game Enhancement v2 - Plan Document

> **Feature**: 칩 시스템, 난이도 재조정, 번카드, Supabase 연동
> **Created**: 2024-02-12
> **Status**: Planning

---

## 1. Overview

### 1.1 Background
현재 리버 단계가 단순 확인으로 끝나며, 난이도 곡선이 가파르고, 게임 진행 상황이 저장되지 않는 문제가 있음.

### 1.2 Goals
- 칩/배팅 시스템으로 리버 단계에 전략적 요소 추가
- 난이도 곡선 완화 및 새 난이도 추가
- 번카드로 정답 예측 난이도 상승
- Supabase 연동으로 클라우드 저장 및 리더보드 구현

### 1.3 Scope

| 포함 | 제외 (보류) |
|------|-------------|
| 칩 시스템 | 홀덤의 신 (무한모드) |
| 난이도 재조정 | 소셜 기능 |
| 번카드 시스템 | |
| 리더보드 | |
| 클라우드 저장 | |

---

## 2. Phases (개발 순서)

### Phase 1: 난이도 재조정
> 기존 코드 수정, 리스크 낮음

### Phase 2: 칩 시스템
> 새 기능, 번카드 없이 먼저

### Phase 3: 번카드 시스템
> 칩 시스템 안정화 후

### Phase 4: Supabase 연동
> 리더보드, 클라우드 저장

---

## 3. Phase 1: 난이도 재조정

### 3.1 현재 vs 변경

| 난이도 | 현재 | 변경 |
|--------|------|------|
| 쉬움 | 2지선다 (나/컴퓨터) | **그대로** |
| 보통 | 5지선다 (20% 단위) | **3지선다** (0~35%, 35~70%, 70~100%) |
| 어려움 | 직접입력 ±5% | **5지선다** (20% 단위, 기존 보통) |
| 전문가 | 직접입력 ±3% | **직접입력 ±5%**, 번카드 발생 |
| 홀덤왕 | ❌ 없음 | **신규**, 직접입력 ±3%, 클리어 시 리더보드 등록 |
| 홀덤의 신 | 기존 최고 난이도 | **보류** (홀덤왕 클리어 후 해금, 무한모드) |

### 3.2 3지선다 옵션 정의

```typescript
// 보통 난이도 - 3지선다
const NORMAL_OPTIONS = [
  { label: '낮음', range: [0, 35], display: '0~35%' },
  { label: '중간', range: [35, 70], display: '35~70%' },
  { label: '높음', range: [70, 100], display: '70~100%' },
];

// 정답 판정: 실제 승률이 해당 범위에 포함되면 정답
```

### 3.3 영향 받는 파일
- `src/types/poker.ts` - Difficulty 타입에 'king' 추가
- `src/lib/poker/constants.ts` - DIFFICULTY_CONFIG 수정
- `src/components/game/AnswerInput/` - ChoiceInput, SliderInput 수정

---

## 4. Phase 2: 칩 시스템

### 4.1 칩 획득 (시간 보너스)

**공식 제안**:
```typescript
// 기본 공식
const BASE_CHIPS = {
  easy: 10,
  normal: 20,
  hard: 30,
  expert: 50,
  king: 100,
};

// 시간 보너스 (남은 시간 비율)
const timeBonus = Math.floor(remainingTime / totalTime * 100);

// 최종 획득 칩
const earnedChips = BASE_CHIPS[difficulty] * (1 + timeBonus / 100);

// 예시 (어려움, 60초 중 30초 남음)
// = 30 * (1 + 50/100) = 30 * 1.5 = 45칩
```

**난이도별 예상 획득 칩 범위**:
| 난이도 | 기본 | 최대 (시간 100%) | 최소 (시간 1%) |
|--------|------|------------------|----------------|
| 쉬움 | 10 | 20 | 10 |
| 보통 | 20 | 40 | 20 |
| 어려움 | 30 | 60 | 30 |
| 전문가 | 50 | 100 | 50 |
| 홀덤왕 | 100 | 200 | 100 |

### 4.2 리버 배팅 시스템

**배당률 공식 제안**:
```typescript
// 승률 기반 배당률 (소수점 2자리)
function calculateOdds(winRate: number): number {
  // winRate: 0-100
  if (winRate >= 95) return 1.05;  // 최소 배당
  if (winRate <= 5) return 10.0;   // 최대 배당

  // 기본 공식: (100 - winRate) / winRate + 1
  // 단, 1.05 ~ 10.0 범위로 클램핑
  const rawOdds = (100 - winRate) / winRate + 1;
  return Math.min(10.0, Math.max(1.05, rawOdds));
}

// 예시
// 승률 80% → (100-80)/80 + 1 = 1.25배
// 승률 50% → (100-50)/50 + 1 = 2.0배
// 승률 20% → (100-20)/20 + 1 = 5.0배
// 승률 10% → (100-10)/10 + 1 = 10.0배
// 승률 5%  → (100-5)/5 + 1 = 20.0 → 클램핑 → 10.0배 (최대)
```

**배당률 테이블 (참고용)**:
| 승률 | 공식 결과 | 클램핑 | 100칩 배팅 시 |
|------|----------|--------|--------------|
| 95%+ | 1.05↓ | **1.05** | 105칩 |
| 90% | 1.11 | 1.11 | 111칩 |
| 80% | 1.25 | 1.25 | 125칩 |
| 70% | 1.43 | 1.43 | 143칩 |
| 60% | 1.67 | 1.67 | 167칩 |
| 50% | 2.00 | 2.00 | 200칩 |
| 40% | 2.50 | 2.50 | 250칩 |
| 30% | 3.33 | 3.33 | 333칩 |
| 20% | 5.00 | 5.00 | 500칩 |
| 10% | 10.00 | 10.00 | 1000칩 |
| 5%↓ | 20.00↑ | **10.00** | 1000칩 |

### 4.3 리버 UI 흐름

```
[리버 카드 공개]
     ↓
[배팅 선택 UI]
┌─────────────────────────────────┐
│  현재 칩: 350                    │
│  예상 승률: ???                  │
│  배당률: 2.5배                   │
│                                 │
│  [배팅 금액 입력: _____ ]        │
│  [올인] [스킵]                   │
│                                 │
│  예상 수익: +875칩 (승리 시)      │
└─────────────────────────────────┘
     ↓
[결과 공개] → 승리: 칩 획득 / 패배: 칩 손실
```

### 4.4 영향 받는 파일
- `src/stores/gameStore.ts` - chips 상태 추가
- `src/types/game.ts` - GameState에 chips 추가
- `src/components/game/RiverBetting.tsx` - 신규 컴포넌트
- `src/lib/game/chips.ts` - 칩 계산 유틸리티

---

## 5. Phase 3: 번카드 시스템

### 5.1 발생 조건
- **난이도**: 전문가 이상
- **라운드**: 플랍, 턴, 리버 시작 전
- **확률 조건**:
  - 정답(실제 승률) < 15% → 상대에게 유리한 카드 번
  - 정답(실제 승률) > 85% → 나에게 유리한 카드 번
- **최대 개수**: 3장

### 5.2 번카드 선택 로직

```typescript
// 상대에게 유리한 카드 = 상대의 아웃(outs) 중 하나
// 나에게 유리한 카드 = 나의 아웃 중 하나

function selectBurnCard(
  playerHand: Card[],
  computerHand: Card[],
  communityCards: Card[],
  currentWinRate: number,
  existingBurnCards: Card[]
): Card | null {
  if (currentWinRate >= 15 && currentWinRate <= 85) return null;
  if (existingBurnCards.length >= 3) return null;

  const deck = getRemainingDeck([...playerHand, ...computerHand, ...communityCards, ...existingBurnCards]);

  if (currentWinRate < 15) {
    // 상대 아웃 제거 → 내 승률 상승
    return findOpponentOut(deck, computerHand, communityCards);
  } else {
    // 내 아웃 제거 → 내 승률 하락
    return findPlayerOut(deck, playerHand, communityCards);
  }
}
```

### 5.3 번카드 UI

**위치**: 화면 왼쪽 aside 영역

```
┌──────────────────────────────────────────────────┐
│ [번카드 영역]        [게임 영역]                    │
│ ┌────────────┐                                   │
│ │ 번 카드 🔥  │      ┌─────────────────────┐      │
│ │ ──────────  │      │   커뮤니티 카드      │      │
│ │ [🃏 K♠]    │      │   🂡 🂢 🂣 🂤 🂥       │      │
│ │ [🃏 Q♥]    │      └─────────────────────┘      │
│ │            │                                   │
│ │ ℹ️ 호버 시   │      ┌─────────────────────┐      │
│ │   툴팁 표시  │      │      배팅 영역       │      │
│ └────────────┘      └─────────────────────┘      │
└──────────────────────────────────────────────────┘
```

**툴팁 내용**:
> 번 카드란?
> 딜러가 실수로 노출한 카드로, 게임에서 제외됩니다.
> 전문가 난이도부터 발생하며, 승률 계산에 영향을 줍니다.

### 5.4 번카드 알림

```typescript
// 커뮤니티 카드 공개 후 번카드 발생 시
<Toast
  icon="🔥"
  title="번 카드 발생!"
  description="K♠가 노출되어 게임에서 제외됩니다."
  duration={3000}
/>
```

### 5.5 영향 받는 파일
- `src/lib/poker/burn-card.ts` - 신규, 번카드 로직
- `src/components/game/BurnCardAside.tsx` - 신규, UI 컴포넌트
- `src/stores/gameStore.ts` - burnCards 상태 추가
- `src/lib/poker/calculator.ts` - 번카드 제외한 승률 계산

---

## 6. Phase 4: Supabase 연동

### 6.1 필요 테이블

```sql
-- 유저 (익명/게스트 지원)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE,  -- 기기 식별자
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리더보드
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  score INTEGER NOT NULL,  -- 최종 칩
  difficulty TEXT NOT NULL,  -- 클리어한 최고 난이도
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 게임 저장 (클라우드 세이브)
CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  game_state JSONB NOT NULL,  -- 전체 게임 상태
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)  -- 유저당 1개 저장 슬롯
);

-- 해금 정보
CREATE TABLE unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  unlock_type TEXT NOT NULL,  -- 'god_mode', 'achievement_xxx'
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unlock_type)
);
```

### 6.2 클라우드 저장 흐름

```
[라운드 종료 시]
     ↓
[gameStore 상태 변경]
     ↓
[debounce 1초]
     ↓
[Supabase upsert game_saves]
     ↓
[새로고침/재접속 시]
     ↓
[game_saves 조회]
     ↓
[gameStore 복원]
     ↓
[이어하기 UI 표시]
```

### 6.3 기기 식별

```typescript
// 익명 사용자 지원 (로그인 없이)
function getDeviceId(): string {
  let deviceId = localStorage.getItem('holdamnit-device-id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('holdamnit-device-id', deviceId);
  }
  return deviceId;
}
```

### 6.4 영향 받는 파일
- `src/lib/supabase/client.ts` - 신규, Supabase 클라이언트
- `src/lib/supabase/leaderboard.ts` - 신규, 리더보드 API
- `src/lib/supabase/game-save.ts` - 신규, 클라우드 저장 API
- `src/stores/gameStore.ts` - 클라우드 저장 연동
- `src/app/page.tsx` - 리더보드 UI 추가
- `.env.local` - Supabase 환경변수

---

## 7. 작업 체크리스트

### Phase 1: 난이도 재조정
- [ ] Difficulty 타입에 'king' 추가
- [ ] DIFFICULTY_CONFIG 수정
- [ ] 3지선다 ChoiceInput 구현
- [ ] 5지선다 기존 로직 어려움으로 이동
- [ ] 전문가 허용 오차 ±5%로 변경
- [ ] 홀덤왕 난이도 추가 (±3%)
- [ ] i18n 번역 추가

### Phase 2: 칩 시스템
- [ ] GameState에 chips 추가
- [ ] 시간 보너스 칩 계산 로직
- [ ] 라운드 정답 시 칩 획득 UI
- [ ] 리버 배팅 UI 컴포넌트
- [ ] 배당률 계산 로직
- [ ] 배팅 결과 처리 로직
- [ ] 최고 점수 localStorage 저장

### Phase 3: 번카드 시스템
- [ ] 번카드 발생 조건 로직
- [ ] 번카드 선택 알고리즘
- [ ] BurnCardAside 컴포넌트
- [ ] 번카드 툴팁 UI
- [ ] 번카드 발생 알림 Toast
- [ ] 승률 계산 시 번카드 제외

### Phase 4: Supabase 연동
- [ ] Supabase 프로젝트 설정
- [ ] 테이블 스키마 생성
- [ ] 기기 식별자 로직
- [ ] 클라우드 저장 API
- [ ] 리더보드 API
- [ ] 해금 정보 API
- [ ] 메인 메뉴 리더보드 UI
- [ ] 이어하기 UI

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 번카드 승률 재계산 성능 | 중 | Web Worker에서 처리 |
| Supabase 무료 티어 한도 | 낮 | 저장 빈도 최적화 (debounce) |
| 배당률 밸런스 | 중 | 테스트 후 공식 조정 |
| 클라우드 저장 충돌 | 낮 | 타임스탬프 기반 최신 우선 |

---

## 9. 참고 사항

### 보류된 기능: 홀덤의 신 (무한모드)
- 홀덤왕 클리어 후 해금
- 무한 모드: 칩 0 또는 오답 시 종료
- 상세 기획 필요 (상대 순환 방식 등)

### 향후 고려 사항
- 소셜 기능 (친구 초대, 공유)
- 업적 시스템
- 시즌제 리더보드

---

**다음 단계**: `/pdca design game-enhancement-v2` 로 설계 문서 작성
