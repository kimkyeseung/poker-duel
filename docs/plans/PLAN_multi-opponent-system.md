# Implementation Plan: 다중 상대 순차 대결 시스템

**Status**: ⏳ Pending Approval
**Started**: 2026-02-07
**Last Updated**: 2026-02-07
**Estimated Completion**: 2026-02-14

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality gates or proceed with failing checks**

---

## 📋 Overview

### Feature Description
각 난이도에서 1명의 딜러와만 대결하던 기존 시스템을 **5명의 상대와 순차적으로 대결**하는 시스템으로 변경합니다.

**상대 순서**:
1. **상대1 (Opponent1)**: 완전 랜덤 핸드
2. **상대2 (Opponent2)**: 완전 랜덤 핸드
3. **스몰 블라인드 (SB)**: 플레이어 핸드 랭킹 ±30 범위
4. **빅 블라인드 (BB)**: 플레이어 핸드 랭킹 ±15 범위 (눈에 띄는 차이 제외)
5. **딜러 (Dealer)**: 플레이어 핸드 랭킹 ±5 범위 (눈에 띄는 차이 제외)

각 상대와 프리플랍 → 플랍 → 턴 → (리버) 전체 라운드를 진행하고, 딜러까지 이겨야 다음 난이도로 진행됩니다.

### Success Criteria
- [ ] 각 난이도에서 5명의 상대와 순차 대결 가능
- [ ] 상대별 핸드 매칭 난이도 적용 (랜덤, ±30, ±15, ±5)
- [ ] "눈에 띄는 차이" 필터링 적용 (BB, Dealer)
- [ ] 동그란 프로필 UI 추가 (플레이어: 불독, 상대: 각각 다른 이미지)
- [ ] 현재 대결 중인 상대 표시 (진행 상황 UI)
- [ ] 패배 시 쉬움 난이도, 상대1부터 재시작

### User Impact
- **플레이타임 5배 증가**: 각 난이도당 5명의 상대와 대결
- **점진적 난이도 상승**: 쉬운 상대부터 어려운 상대로 자연스럽게 진행
- **긴장감 유지**: 마지막 딜러까지 긴장감 있는 게임 플레이

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| `OpponentType` enum 사용 | 5명의 상대를 명확하게 구분 | 추후 상대 수 변경 시 수정 필요 |
| 핸드 매칭 로직을 `starting-hands.ts`에 추가 | 기존 169개 핸드 랭킹 활용 | 파일 크기 증가 |
| "눈에 띄는 차이" 규칙 기반 필터링 | 169개 핸드별 후보군 하드코딩 불필요 | 런타임 필터링 로직 추가 |
| `currentOpponentIndex` 상태 추가 | 현재 상대 추적 간단 | gameStore 상태 복잡도 증가 |
| 프로필 이미지 컴포넌트 분리 | 재사용성, 확장성 | 컴포넌트 수 증가 |

---

## 📦 Dependencies

### Required Before Starting
- [x] 기존 169개 핸드 랭킹 시스템 (`starting-hands.ts`)
- [x] 기존 gameStore 상태 관리
- [ ] 상대별 프로필 이미지 (사용자 제공 예정)

### External Dependencies
- 없음 (기존 의존성만 사용)

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | 핸드 매칭 로직, 필터링 규칙 |
| **Integration Tests** | Critical paths | gameStore 상태 변화, 상대 전환 |
| **E2E Tests** | Key user flows | 5명 상대 순차 대결 완료 |

### Test File Organization
```
src/lib/poker/
├── hand-matcher.ts          # 새로운 핸드 매칭 로직
├── hand-matcher.test.ts     # 핸드 매칭 테스트

tests/e2e/
└── multi-opponent.spec.ts   # E2E 테스트
```

---

## 🚀 Implementation Phases

### Phase 1: 핸드 매칭 로직 및 타입 정의
**Goal**: 상대별 핸드 생성 로직과 필터링 규칙 구현
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: 핸드 매칭 로직 테스트 작성
  - File: `src/lib/poker/hand-matcher.test.ts`
  - Expected: Tests FAIL
  - Test cases:
    - `getRandomHand()` - 랜덤 핸드 생성
    - `getMatchedHand(playerRank, range)` - ±30, ±15, ±5 범위 내 핸드
    - `isVisuallyObvious(hand1, hand2)` - 눈에 띄는 차이 감지
    - `getFilteredMatchedHand(playerRank, range)` - 필터링된 핸드

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.2**: 타입 정의 추가
  - File: `src/types/game.ts`
  - 추가할 타입:
    ```typescript
    type OpponentType = 'opponent1' | 'opponent2' | 'smallBlind' | 'bigBlind' | 'dealer';

    interface OpponentConfig {
      type: OpponentType;
      label: string;
      labelKey: string;  // i18n key
      profileImage: string;
      handMatchingRule: 'random' | 'range30' | 'range15' | 'range5';
      filterVisuallyObvious: boolean;
    }
    ```

- [ ] **Task 1.3**: 핸드 매칭 로직 구현
  - File: `src/lib/poker/hand-matcher.ts`
  - 구현 내용:
    - `OPPONENT_CONFIG`: 5명 상대 설정 배열
    - `getRandomHand()`: 완전 랜덤 핸드
    - `getMatchedHand(playerRank, range)`: 범위 내 랜덤 핸드
    - `isVisuallyObvious(hand1, hand2)`: 눈에 띄는 차이 감지
      - 같은 킥커 + 높은 카드 차이 (K9s vs T9s)
      - 페어 vs 논페어 (AA vs AKs)
      - 같은 숫자 포함 시 차이가 눈에 띄는 경우 (A5s vs A3s)
    - `getFilteredMatchedHand()`: 필터링 적용된 핸드

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.4**: 리팩토링
  - 중복 코드 제거
  - 명확한 함수명
  - 인라인 문서화

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 2 until ALL checks pass**

**Validation Commands**:
```bash
npm run test -- --run src/lib/poker/hand-matcher.test.ts
npm run lint
npm run build
```

**Manual Test Checklist**:
- [ ] `getMatchedHand(50, 30)` 호출 시 랭킹 20~80 내 핸드 반환
- [ ] `isVisuallyObvious('K9s', 'T9s')` → true
- [ ] `isVisuallyObvious('33', '87s')` → false

---

### Phase 2: GameStore 상태 관리 확장
**Goal**: 5명 상대 순차 대결을 위한 상태 관리 구현
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 2.1**: gameStore 상태 변화 테스트
  - 테스트 시나리오:
    - `initGame` 호출 시 `currentOpponentIndex = 0`
    - `nextOpponent` 호출 시 인덱스 증가
    - 딜러(index 4) 승리 시 `nextDifficulty` 호출
    - 패배 시 `gameOver` + 재시작 시 index 0으로

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 2.2**: GameState 타입 확장
  - File: `src/types/game.ts`
  - 추가할 상태:
    ```typescript
    interface GameState {
      // 기존 상태...
      currentOpponentIndex: number;  // 0~4
      currentOpponentHand: [Card, Card] | null;
      opponentsDefeated: boolean[];  // [false, false, false, false, false]
    }
    ```

- [ ] **Task 2.3**: gameStore 액션 확장
  - File: `src/stores/gameStore.ts`
  - 수정/추가할 함수:
    - `initGame`: 상대 인덱스 초기화, 첫 상대 핸드 생성
    - `nextOpponent`: 다음 상대로 전환, 새 핸드 생성
    - `defeatCurrentOpponent`: 현재 상대 패배 처리
    - `submitAnswer`: 승리 시 `defeatCurrentOpponent` 호출

- [ ] **Task 2.4**: 덱 관리 로직 수정
  - 상대 핸드는 매칭 로직으로 생성 (덱에서 뽑지 않음)
  - 또는 매칭된 핸드의 카드를 덱에서 제거

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 2.5**: 리팩토링
  - 기존 `computerHand` → `currentOpponentHand`로 점진적 마이그레이션
  - 후방 호환성 유지

#### Quality Gate ✋

**Validation Commands**:
```bash
npm run test:run
npm run lint
npm run build
```

**Manual Test Checklist**:
- [ ] 게임 시작 시 `currentOpponentIndex = 0`
- [ ] 상대1 승리 후 `currentOpponentIndex = 1`
- [ ] 딜러 승리 후 다음 난이도로 전환
- [ ] 패배 후 재시작 시 `currentOpponentIndex = 0`

---

### Phase 3: 프로필 UI 컴포넌트
**Goal**: 동그란 프로필 이미지 및 상대 진행 상황 UI
**Status**: ⏳ Pending

#### Tasks

**🟢 GREEN: Implement Components**
- [ ] **Task 3.1**: ProfileAvatar 컴포넌트
  - File: `src/components/ui/ProfileAvatar.tsx`
  - Props:
    ```typescript
    interface ProfileAvatarProps {
      src: string;  // 이미지 경로
      alt: string;
      size?: 'sm' | 'md' | 'lg';
      isActive?: boolean;
      isDefeated?: boolean;
    }
    ```
  - 스타일:
    - 동그란 테두리 (rounded-full)
    - 활성 상태: 글로우 효과
    - 패배 상태: 흑백 + 체크 마크

- [ ] **Task 3.2**: OpponentProgress 컴포넌트
  - File: `src/components/game/OpponentProgress.tsx`
  - 5명의 상대 프로필을 가로로 표시
  - 현재 대결 중인 상대 강조
  - 패배한 상대 흐리게 표시

- [ ] **Task 3.3**: PlayerArea 수정
  - File: `src/components/game/PlayerArea.tsx`
  - 기존 아바타를 ProfileAvatar로 교체
  - 상대 타입에 따른 이미지/라벨 표시

- [ ] **Task 3.4**: 플레이스홀더 이미지 추가
  - 폴더: `public/profiles/`
  - 파일:
    - `player.png` (불독 심볼)
    - `opponent1.png`
    - `opponent2.png`
    - `small-blind.png`
    - `big-blind.png`
    - `dealer.png`
  - 우선 기본 아이콘으로 대체, 사용자 이미지 나중에 교체

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 3.5**: 리팩토링
  - 공통 스타일 추출
  - 반응형 대응

#### Quality Gate ✋

**Validation Commands**:
```bash
npm run lint
npm run build
npm run dev  # 수동 확인
```

**Manual Test Checklist**:
- [ ] 프로필 아바타 동그랗게 표시
- [ ] 활성 상대 글로우 효과
- [ ] 패배한 상대 흑백 처리
- [ ] 모바일/데스크톱 반응형

---

### Phase 4: 게임 페이지 통합
**Goal**: 전체 시스템 통합 및 게임 흐름 완성
**Status**: ⏳ Pending

#### Tasks

**🟢 GREEN: Integration**
- [ ] **Task 4.1**: game/page.tsx 수정
  - `computerHand` → `currentOpponentHand` 사용
  - `OpponentProgress` 컴포넌트 헤더에 추가
  - 상대 전환 시 카드 딜 애니메이션

- [ ] **Task 4.2**: 상대 전환 로직
  - 현재 상대 승리 시:
    - 딜러가 아니면 → `nextOpponent()` + 새 핸드 딜
    - 딜러면 → `nextDifficulty()` + 레벨 오버레이
  - 패배 시:
    - `gameOver()` → 재시작 시 쉬움/상대1

- [ ] **Task 4.3**: 결과 다이얼로그 수정
  - "다음 상대" 버튼 추가 (마지막 상대가 아닌 경우)
  - "다음 난이도" 버튼 (딜러 승리 시)
  - 현재 상대 정보 표시

- [ ] **Task 4.4**: 레벨 오버레이 수정
  - File: `src/components/game/LevelStartOverlay.tsx`
  - 현재 상대 정보 표시 (상대1~딜러)

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 4.5**: 리팩토링
  - 불필요한 상태 정리
  - 성능 최적화

#### Quality Gate ✋

**Validation Commands**:
```bash
npm run test:run
npm run lint
npm run build
npm run test:e2e  # E2E 테스트
```

**Manual Test Checklist**:
- [ ] 상대1부터 딜러까지 순차 대결
- [ ] 각 상대와 프리플랍→플랍→턴→리버 진행
- [ ] 딜러 승리 시 다음 난이도
- [ ] 패배 시 쉬움/상대1부터 재시작
- [ ] 프로필 UI 정상 표시

---

### Phase 5: 다국어 및 마무리
**Goal**: i18n 지원 및 최종 테스트
**Status**: ⏳ Pending

#### Tasks

**🟢 GREEN: Implementation**
- [ ] **Task 5.1**: 번역 키 추가
  - 7개 언어 파일에 추가:
    ```typescript
    opponents: {
      opponent1: 'Opponent 1',
      opponent2: 'Opponent 2',
      smallBlind: 'Small Blind',
      bigBlind: 'Big Blind',
      dealer: 'Dealer',
      nextOpponent: 'Next Opponent',
      opponentDefeated: 'Opponent Defeated!',
    }
    ```

- [ ] **Task 5.2**: E2E 테스트 작성
  - File: `tests/e2e/multi-opponent.spec.ts`
  - 시나리오:
    - 쉬움 난이도에서 5명 상대 순차 대결
    - 상대 전환 시 UI 업데이트 확인
    - 패배 시 재시작 확인

- [ ] **Task 5.3**: 최종 QA
  - 모든 난이도 테스트
  - 모바일/데스크톱 테스트
  - 다국어 테스트

#### Quality Gate ✋

**Validation Commands**:
```bash
npm run test:run
npm run lint
npm run build
npm run test:e2e
```

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| 핸드 매칭 시 무한 루프 | Low | High | 최대 시도 횟수 제한 (100회) |
| 덱 카드 부족 | Low | High | 커뮤니티 카드와 충돌 검사 |
| 성능 저하 (필터링) | Low | Medium | 캐싱 또는 사전 계산 |
| 프로필 이미지 누락 | Medium | Low | 기본 폴백 이미지 |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
- `hand-matcher.ts` 삭제
- 타입 변경 되돌리기

### If Phase 2 Fails
- gameStore 변경 되돌리기 (git revert)
- `computerHand` 복원

### If Phase 3-5 Fails
- 이전 Phase 완료 상태로 복원
- UI 컴포넌트 삭제

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%
- **Phase 3**: ⏳ 0%
- **Phase 4**: ⏳ 0%
- **Phase 5**: ⏳ 0%

**Overall Progress**: 0% complete

---

## 📝 Notes & Learnings

### Implementation Notes
- (작업 중 추가)

### Blockers Encountered
- (작업 중 추가)

---

## 📚 References

### 기존 코드
- `src/lib/poker/starting-hands.ts` - 169개 핸드 랭킹
- `src/stores/gameStore.ts` - 게임 상태 관리
- `src/app/game/page.tsx` - 게임 페이지

---

## ✅ Final Checklist

**Before marking plan as COMPLETE**:
- [ ] All phases completed with quality gates passed
- [ ] Full integration testing performed
- [ ] Documentation updated
- [ ] All 7 languages translated
- [ ] Mobile/Desktop tested
- [ ] 사용자 프로필 이미지 교체 완료

---

**Plan Status**: ⏳ Pending Approval
**Next Action**: 사용자 승인 후 Phase 1 시작
**Blocked By**: 사용자 프로필 이미지 (Phase 3에서 필요)
