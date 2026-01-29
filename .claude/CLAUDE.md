# Hol'Damn It! - 프로젝트 가이드

## 프로젝트 개요

**Hol'Damn It!**은 Texas Hold'em 승률 예측 게임입니다. 사용자는 각 라운드(프리플랍, 플랍, 턴, 리버)에서 자신의 승률을 예측합니다. 이름은 "Hold'em"과 "Damn it!"의 언어유희로, 한 번 틀리면 게임오버되는 긴장감을 표현합니다.

### 핵심 게임 규칙
- **5단계 난이도**: 쉬움 → 보통 → 어려움 → 전문가 → 홀덤의 신
- **4라운드 진행**: 프리플랍(5초) → 플랍(60초) → 턴(60초) → 리버(확인)
- **한 번 틀리면 게임 오버**, 쉬움 난이도부터 재시작
- **모든 난이도 클리어 시 승리** (코멘트 작성 가능)

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Package Manager**: npm

## 프로젝트 구조

```
holdamnit/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx           # 메인 페이지 (게임 시작)
│   │   ├── game/[uuid]/       # 메인 게임 페이지
│   │   ├── practice/          # 연습 모드
│   │   ├── daily/             # 일일 챌린지
│   │   ├── stats/             # 통계 페이지
│   │   ├── comments/          # 엔딩 코멘트
│   │   └── settings/          # 설정 페이지
│   │
│   ├── components/
│   │   ├── game/              # 게임 관련 컴포넌트
│   │   │   ├── Card.tsx       # 카드 컴포넌트
│   │   │   ├── Table.tsx      # 테이블 (커뮤니티 카드)
│   │   │   ├── PlayerArea.tsx # 플레이어 영역
│   │   │   ├── AnswerInput.tsx # 답변 입력 (난이도별 UI)
│   │   │   ├── ResultDisplay.tsx # 결과 표시
│   │   │   ├── DifficultyBadge.tsx # 난이도 뱃지
│   │   │   ├── GameOverDialog.tsx # 게임오버 다이얼로그
│   │   │   ├── VictoryDialog.tsx # 승리 다이얼로그
│   │   │   └── HintButton.tsx # 힌트 버튼
│   │   ├── ui/                # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Timer.tsx
│   │   │   ├── AudioToggle.tsx # 음소거 토글 버튼
│   │   │   └── ClickToStart.tsx # 시작 오버레이 (오디오 활성화)
│   │   └── TutorialDialog.tsx # 튜토리얼
│   │
│   ├── lib/
│   │   ├── poker/             # 포커 엔진
│   │   │   ├── deck.ts        # 덱 관리, 셔플
│   │   │   ├── evaluator.ts   # 핸드 평가 (7장→5장)
│   │   │   ├── calculator.ts  # 승률 계산 (완전탐색)
│   │   │   └── starting-hands.ts # 169개 프리플랍 핸드랭킹
│   │   ├── audio/             # 오디오 시스템
│   │   │   ├── AudioManager.ts # BGM 관리 (Howler.js)
│   │   │   ├── SynthSound.ts  # SFX 생성 (Web Audio API)
│   │   │   ├── useAudio.ts    # React 훅 (useAudio, useSFX, useBGM)
│   │   │   ├── config.ts      # 오디오 설정 및 타입
│   │   │   └── index.ts       # 모듈 exports
│   │   ├── game/              # 게임 시스템
│   │   │   ├── titles.ts      # 14개 칭호
│   │   │   ├── achievements.ts # 18개 도전과제
│   │   │   ├── hints.ts       # 힌트 시스템
│   │   │   └── themes.ts      # 테마 시스템
│   │   ├── storage/           # 로컬스토리지 관리
│   │   └── utils.ts           # 유틸리티 (cn 함수)
│   │
│   ├── stores/
│   │   └── gameStore.ts       # Zustand 게임 상태 관리
│   │
│   ├── hooks/
│   │   └── usePokerCalculator.ts # Web Worker 승률 계산 훅
│   │
│   └── types/
│       ├── poker.ts           # 포커 관련 타입
│       └── game.ts            # 게임 상태 타입
│
└── public/
    ├── workers/
    │   └── poker-calculator.js # 승률 계산 Web Worker
    └── audio/
        └── bgm/               # BGM 파일 (MP3)
            ├── home.mp3       # 홈 화면 BGM
            ├── game.mp3       # 게임 플레이 BGM
            ├── result-win.mp3 # 승리 BGM
            └── result-lose.mp3 # 패배 BGM
```

## 핵심 로직

### 난이도별 입력 방식
| 난이도 | 입력 방식 | 허용 오차 | 제한 시간 |
|--------|----------|----------|----------|
| 쉬움 | 2지선다 (나/컴퓨터) | - | 60초 |
| 보통 | 5지선다 (20% 단위) | - | 60초 |
| 어려움 | 직접 입력 | ±5% | 60초 |
| 전문가 | 직접 입력 | ±3% | 60초 |
| 홀덤의 신 | 직접 입력 | ±1% | 60초 |

### 프리플랍 특수 규칙
- **모든 난이도에서 2지선다** (나 vs 컴퓨터)
- **제한 시간 5초**
- **승률 계산 없음** - 169개 핸드랭킹 표로 승패 결정
- 핸드랭킹: AA(1위) ~ 72o(169위)

### 승률 계산
- **플랍**: 990개 조합 완전탐색 (턴+리버)
- **턴**: 44개 조합 완전탐색 (리버)
- **리버**: 결과 확인만 (승패 확정)
- Web Worker에서 비동기 계산

## 주요 기능

### 게임 모드
1. **메인 게임**: 5단계 난이도 순차 클리어
2. **연습 모드**: 시간 제한 없음, 어려움까지만 가능
3. **일일 챌린지**: 날짜 기반 시드, 하루 1회 도전

### 진행 시스템
- **통계**: 총 게임 수, 승률, 연승 기록
- **칭호**: 14개 (초보자 ~ 전설)
- **도전과제**: 18개
- **히스토리**: 최근 게임 기록

### 설정
- 사운드 ON/OFF
- 진동 ON/OFF (모바일)
- 테마 선택 (카지노, 미니멀, 다크)

## 오디오 시스템

### 아키텍처
- **BGM**: Howler.js 사용, MP3 파일 재생 (크로스페이드 지원)
- **SFX**: Web Audio API로 실시간 합성 (파일 불필요)
- **Lazy Loading**: 동적 import로 SSR 이슈 방지
- **Web Audio API 모드**: `html5: false`로 설정하여 자동재생 정책 우회
- **Click to Start**: 브라우저 자동재생 정책으로 인해 첫 화면에서 사용자 클릭 필요

### BGM 타입 (`BGMType`)
| 타입 | 파일 | 용도 |
|------|------|------|
| `home` | `/audio/bgm/home.mp3` | 홈 화면 |
| `game` | `/audio/bgm/game.mp3` | 게임 플레이 |
| `result-win` | `/audio/bgm/result-win.mp3` | 승리 |
| `result-lose` | `/audio/bgm/result-lose.mp3` | 패배 |

### SFX 타입 (`SFXType`) - 파일 불필요
- `button-click`, `button-hover` - UI 버튼
- `card-hover`, `card-flip`, `card-deal` - 카드
- `correct`, `wrong` - 정답/오답
- `timer-tick`, `timer-warning` - 타이머
- `level-up`, `victory`, `game-over` - 게임 진행
- `round-start`, `submit` - 라운드

### React 훅 사용법
```tsx
// BGM 재생 (useAudio 훅 사용)
import { useAudio } from '@/lib/audio';
const { playBGM, playSFX, isMuted, toggleMute } = useAudio();
playBGM('game');

// BGM 재생 (useBGM 훅 - 사용자 인터랙션 후 자동 재생)
import { useBGM } from '@/lib/audio';
useBGM('game'); // 사용자 인터랙션 감지 후 자동 재생

// SFX 재생 (컴포넌트 단위)
import { useSFX } from '@/lib/audio';
const { playSFX } = useSFX();
playSFX('button-click');
```

### Click to Start 오버레이
```tsx
// 홈 페이지에서 사용
import { ClickToStart } from '@/components/ui';

const handleStart = () => {
  playBGM('home'); // 오디오 시스템이 활성화된 후 BGM 재생
};

<ClickToStart onStart={handleStart} />
```

### 주의사항
- 브라우저 자동재생 정책으로 인해 **ClickToStart 오버레이 필수**
- 첫 방문 시 "Click anywhere to start" 오버레이 표시
- 클릭 후 `sessionStorage`에 `holdamnit-started` 저장 (세션 동안 다시 표시 안 됨)
- `playSFX` 호출은 에러가 나도 게임 로직을 막지 않음 (try-catch 내장)
- AudioToggle 컴포넌트로 헤더에 음소거 버튼 제공

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 후 실행
npm start

# 린트
npm run lint
```

## 코딩 컨벤션

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx`
- 유틸/훅: `camelCase.ts`
- 타입 파일: `camelCase.ts`

### 컴포넌트 구조
```tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // props 정의
}

export function Component({ ...props }: ComponentProps) {
  // 구현
}
```

### 스타일링
- Tailwind CSS 클래스 사용
- 조건부 클래스는 `cn()` 유틸리티 사용
- 색상: slate(배경), amber(액센트), emerald(성공), red(실패)

### 상태 관리
- 전역 상태: Zustand (`gameStore`)
- 로컬 상태: React useState
- 영구 저장: localStorage (`lib/storage`)

## 주의사항

### 프리플랍 로직
- 승률 계산 절대 하지 않음
- `starting-hands.ts`의 169개 핸드랭킹만 사용
- `AnswerInput`에서 `currentRound === 'preflop'`일 때 항상 ChoiceInput 표시

### 타입 안전성
- `AnswerResult.correctAnswer`는 `string | number` (프리플랍: 'player'/'computer')
- `WinRateResult`의 모든 필드 필수 (totalCombinations, playerWins, computerWins, ties)

### useEffect 의존성
- `initGame` 같은 store 함수는 의존성 배열에서 제외 (무한 루프 방지)
- `eslint-disable-next-line react-hooks/exhaustive-deps` 주석 필요시 사용

## 스토리지 키

### 로컬스토리지
| 키 | 용도 |
|----|------|
| `holdamnit-stats` | 게임 통계 |
| `holdamnit-settings` | 설정 (사운드, 진동, 테마) |
| `holdamnit-comments` | 엔딩 코멘트 |
| `holdamnit-tutorial-seen` | 튜토리얼 완료 여부 |

### 세션스토리지
| 키 | 용도 |
|----|------|
| `holdamnit-started` | Click to Start 완료 여부 (세션당 1회)
