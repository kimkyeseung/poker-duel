# Hol'Damn It! - Implementation Workflow

## 프로젝트 개요
- **프로젝트명**: holdamnit (Hol'Damn It!)
- **기술스택**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **플랫폼**: 모바일/PC 반응형 웹앱
- **컨셉**: Texas Hold'em 승률 예측 퀴즈 게임 - The Ultimate Equity Challenge

---

## Phase 1: 프로젝트 초기 설정 및 핵심 엔진 (Foundation)

### 1.1 프로젝트 설정
- [ ] Next.js 14 프로젝트 생성 (App Router)
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] ESLint/Prettier 설정
- [ ] 폴더 구조 설계

```
holdamnit/
├── src/
│   ├── app/                    # App Router 페이지
│   │   ├── page.tsx           # 메인 페이지
│   │   ├── game/[uuid]/       # 게임 페이지
│   │   ├── practice/          # 연습 모드
│   │   ├── daily/             # 일일 챌린지
│   │   └── comments/          # 엔딩 코멘트
│   ├── components/            # UI 컴포넌트
│   │   ├── ui/               # 기본 UI (버튼, 다이얼로그 등)
│   │   ├── game/             # 게임 관련 컴포넌트
│   │   └── layout/           # 레이아웃 컴포넌트
│   ├── lib/                   # 유틸리티/로직
│   │   ├── poker/            # 포커 엔진
│   │   ├── game/             # 게임 로직
│   │   └── storage/          # 로컬스토리지
│   ├── hooks/                 # 커스텀 훅
│   ├── stores/                # 상태 관리
│   └── types/                 # TypeScript 타입
├── public/
│   ├── cards/                # 카드 이미지
│   └── sounds/               # 사운드 파일
└── ...
```

### 1.2 포커 엔진 (핵심)
- [ ] 카드/덱 타입 정의
- [ ] 덱 생성 및 셔플 로직
- [ ] 핸드 랭킹 시스템 (프리플랍용)
- [ ] 7장 → 5장 최적 조합 평가
- [ ] 완전탐색 승률 계산 (플랍/턴/리버)
- [ ] Web Worker 통합 (UI 블로킹 방지)

### 1.3 커밋 포인트
```bash
git commit -m "Phase 1: Project setup and poker engine core"
```

---

## Phase 2: 게임 UI/UX 및 메인 게임플레이 (Core Game)

### 2.1 UI 컴포넌트
- [ ] 카드 컴포넌트 (앞면/뒷면, 애니메이션)
- [ ] 테이블 컴포넌트 (5개 슬롯)
- [ ] 플레이어 영역 (유저/컴퓨터)
- [ ] 타이머 컴포넌트 (5초/10초)
- [ ] 난이도 선택 UI
- [ ] 정답 입력 UI (선택형/입력형)

### 2.2 게임 상태 관리
- [ ] 게임 상태 타입 정의
- [ ] Zustand 스토어 설정
- [ ] 라운드 진행 로직
- [ ] 타이머 로직

### 2.3 게임 페이지
- [ ] 메인 페이지 (`/`)
- [ ] 게임 페이지 (`/game/[uuid]`)
- [ ] 게임 시작 → 진행 → 결과 플로우
- [ ] 게임오버 다이얼로그 (재도전/메인)

### 2.4 난이도 시스템
| 난이도 | 입력 방식 | 오차범위 | 제한시간 |
|--------|----------|---------|---------|
| 쉬움 | 유리한 쪽 선택 | - | 10초 |
| 보통 | 5지선다 (20% 단위) | - | 10초 |
| 어려움 | 직접 입력 | ±5% | 10초 |
| 전문가 | 직접 입력 | ±3% | 10초 |
| 홀덤의 신 | 직접 입력 | ±1% | 10초 |

### 2.5 라운드 시스템
| 라운드 | 커뮤니티 카드 | 계산 방식 | 제한시간 |
|--------|--------------|----------|---------|
| 프리플랍 | 0장 | 핸드랭킹 | 5초 |
| 플랍 | 3장 | 완전탐색 | 10초 |
| 턴 | 4장 | 완전탐색 | 10초 |
| 리버 | 5장 | 확인만 | - |

### 2.6 커밋 포인트
```bash
git commit -m "Phase 2: Game UI components and main gameplay"
```

---

## Phase 3: 부가 기능 (Additional Features)

### 3.1 튜토리얼
- [ ] 튜토리얼 다이얼로그 컴포넌트
- [ ] 4-5장 슬라이드 콘텐츠
- [ ] 이전/다음/완료 버튼
- [ ] 첫 방문시 자동 표시 (선택)

### 3.2 연습 모드
- [ ] 연습 모드 페이지 (`/practice`)
- [ ] 난이도 선택 (쉬움~어려움만)
- [ ] 시간제한 없음
- [ ] 정답 즉시 확인
- [ ] 오답 시 해설 표시

### 3.3 일일 챌린지
- [ ] 일일 챌린지 페이지 (`/daily`)
- [ ] 날짜 기반 시드 생성
- [ ] 동일 날짜 = 동일 문제
- [ ] 일일 최고 기록 저장

### 3.4 엔딩 (홀덤의 신 클리어)
- [ ] 엔딩 화면
- [ ] 코멘트 작성 페이지 (`/comments`)
- [ ] 코멘트 저장/조회

### 3.5 커밋 포인트
```bash
git commit -m "Phase 3: Tutorial, practice mode, daily challenge"
```

---

## Phase 4: 진행 시스템 (Progression)

### 4.1 통계 저장
- [ ] 로컬스토리지 관리 훅
- [ ] 총 플레이 횟수
- [ ] 각 난이도별 클리어 횟수
- [ ] 최고 연승 기록
- [ ] 정답률 통계

### 4.2 칭호 시스템
- [ ] 칭호 정의 및 조건
- [ ] 칭호 획득 로직
- [ ] 현재 칭호 표시
- [ ] 칭호 목록 화면

```typescript
const TITLES = [
  { id: 'beginner', name: '초보 갬블러', condition: '첫 게임 완료' },
  { id: 'calculator', name: '인간 계산기', condition: '10연승' },
  { id: 'expert', name: '전문가', condition: '전문가 난이도 클리어' },
  { id: 'god', name: '홀덤의 신', condition: '홀덤의 신 클리어' },
  // ...
];
```

### 4.3 도전 과제
- [ ] 도전 과제 정의
- [ ] 달성 추적 로직
- [ ] 도전 과제 화면
- [ ] 알림 표시

### 4.4 핸드 히스토리
- [ ] 플레이 핸드 저장
- [ ] 히스토리 조회 화면
- [ ] "다시 풀기" 기능
- [ ] 핸드 상세 정보

### 4.5 커밋 포인트
```bash
git commit -m "Phase 4: Statistics, titles, achievements, history"
```

---

## Phase 5: 힌트, 테마, 사운드 및 최종 폴리싱 (Polish)

### 5.1 힌트 시스템
- [ ] 아웃츠 하이라이트
- [ ] 범위 힌트 ("50% 이상")
- [ ] 힌트 사용 시 기록 표시
- [ ] 힌트 쿨다운/제한

### 5.2 테마/스킨
- [ ] 테마 시스템 구현
- [ ] 카지노 테마 (기본)
- [ ] 미니멀 테마
- [ ] 다크 모드

### 5.3 사운드/진동
- [ ] 사운드 매니저
- [ ] 카드 효과음
- [ ] 타이머 경고음
- [ ] 정답/오답 효과음
- [ ] 모바일 햅틱 피드백
- [ ] 음소거 설정

### 5.4 반응형 최적화
- [ ] 모바일 레이아웃 최적화
- [ ] 터치 인터랙션
- [ ] 가로/세로 모드 대응

### 5.5 최종 테스트
- [ ] 전체 게임 플로우 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 성능 최적화
- [ ] 버그 수정

### 5.6 커밋 포인트
```bash
git commit -m "Phase 5: Hints, themes, sounds, and final polish"
```

---

## 의존성 다이어그램

```
Phase 1 (Foundation)
    │
    ▼
Phase 2 (Core Game) ──────┐
    │                     │
    ▼                     ▼
Phase 3 (Features)   Phase 4 (Progression)
    │                     │
    └─────────┬───────────┘
              ▼
       Phase 5 (Polish)
```

---

## 기술적 고려사항

### 승률 계산 최적화
```typescript
// Web Worker 사용
const worker = new Worker('/workers/poker-calculator.js');
worker.postMessage({ hand1, hand2, community });
worker.onmessage = (e) => setWinRate(e.data.winRate);
```

### 날짜 기반 시드 (일일 챌린지)
```typescript
function getDailySeed(): number {
  const today = new Date().toISOString().split('T')[0];
  return hashCode(today);
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
```

### 로컬스토리지 스키마
```typescript
interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  maxStreak: number;
  currentStreak: number;
  difficultyStats: Record<Difficulty, { played: number; cleared: number }>;
  achievements: string[];
  currentTitle: string;
  handHistory: HandRecord[];
}
```

---

## 예상 소요 기간

| Phase | 작업량 |
|-------|--------|
| Phase 1 | 프로젝트 설정 + 포커 엔진 |
| Phase 2 | UI 컴포넌트 + 게임 로직 |
| Phase 3 | 튜토리얼 + 연습 + 챌린지 |
| Phase 4 | 통계 + 칭호 + 도전과제 |
| Phase 5 | 힌트 + 테마 + 사운드 |

---

## 다음 단계

Phase 1부터 순차적으로 구현을 시작합니다.
각 Phase 완료 후 커밋하여 진행 상황을 보존합니다.
