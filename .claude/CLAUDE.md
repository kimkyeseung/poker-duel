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
- **Styling**: Tailwind CSS 4 (`@tailwindcss/postcss`)
- **State Management**: Zustand
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Package Manager**: npm

## 프로젝트 구조

```
holdamnit/
├── src/
│   ├── app/                           # Next.js App Router 페이지
│   │   ├── layout.tsx                 # 루트 레이아웃 (providers 포함)
│   │   ├── page.tsx                   # 메인 페이지 (게임 시작)
│   │   ├── globals.css                # 전역 스타일 + Tailwind + 커스텀 CSS
│   │   ├── game/
│   │   │   └── page.tsx               # 메인 게임 페이지
│   │   ├── practice/
│   │   │   └── page.tsx               # 연습 모드
│   │   ├── daily/
│   │   │   └── page.tsx               # 일일 챌린지
│   │   ├── stats/
│   │   │   └── page.tsx               # 통계 페이지
│   │   ├── settings/
│   │   │   └── page.tsx               # 설정 페이지
│   │   └── comments/
│   │       └── page.tsx               # 엔딩 코멘트 페이지
│   │
│   ├── components/
│   │   ├── game/                      # 게임 관련 컴포넌트
│   │   │   ├── Card.tsx               # 카드 컴포넌트
│   │   │   ├── Table.tsx              # 테이블 (커뮤니티 카드)
│   │   │   ├── PlayerArea.tsx         # 플레이어 영역
│   │   │   ├── AnswerInput.tsx        # 답변 입력 (난이도별 UI)
│   │   │   ├── ResultDisplay.tsx      # 결과 표시
│   │   │   ├── ResultDialog.tsx       # 결과 다이얼로그 (통계 바 포함)
│   │   │   ├── DifficultyBadge.tsx    # 난이도 뱃지
│   │   │   ├── GameOverDialog.tsx     # 게임오버 다이얼로그
│   │   │   ├── VictoryDialog.tsx      # 승리 다이얼로그
│   │   │   ├── GameProgress.tsx       # 게임 진행 상태 표시
│   │   │   ├── HintButton.tsx         # 힌트 버튼
│   │   │   ├── LevelStartOverlay.tsx  # 레벨 시작 오버레이 (전환 화면)
│   │   │   ├── DevAnswerOverlay.tsx   # 개발용 정답 오버레이
│   │   │   └── index.ts               # 컴포넌트 exports
│   │   │
│   │   ├── ui/                        # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx             # 버튼
│   │   │   ├── Dialog.tsx             # 다이얼로그
│   │   │   ├── Timer.tsx              # 타이머
│   │   │   ├── Typography.tsx         # 텍스트 스타일
│   │   │   ├── AudioToggle.tsx        # 음소거 토글 버튼
│   │   │   ├── ClickToStart.tsx       # 시작 오버레이 (오디오 활성화)
│   │   │   ├── LanguageSelector.tsx   # 언어 선택기
│   │   │   └── index.ts               # UI exports
│   │   │
│   │   └── TutorialDialog.tsx         # 튜토리얼 다이얼로그
│   │
│   ├── lib/
│   │   ├── poker/                     # 포커 엔진
│   │   │   ├── deck.ts                # 덱 관리, 셔플
│   │   │   ├── evaluator.ts           # 핸드 평가 (7장→5장)
│   │   │   ├── calculator.ts          # 승률 계산 (완전탐색)
│   │   │   ├── starting-hands.ts      # 169개 프리플랍 핸드랭킹
│   │   │   ├── starting-hands.test.ts # 핸드랭킹 테스트
│   │   │   └── index.ts               # 포커 exports
│   │   │
│   │   ├── audio/                     # 오디오 시스템
│   │   │   ├── AudioManager.ts        # BGM 관리 (Howler.js)
│   │   │   ├── SynthSound.ts          # SFX 생성 (Web Audio API)
│   │   │   ├── config.ts              # 오디오 설정 및 타입
│   │   │   ├── useAudio.ts            # React 훅 (useAudio, useSFX, useBGM)
│   │   │   └── index.ts               # 오디오 exports
│   │   │
│   │   ├── game/                      # 게임 시스템
│   │   │   ├── titles.ts              # 14개 칭호
│   │   │   ├── achievements.ts        # 18개 도전과제
│   │   │   ├── hints.ts               # 힌트 시스템
│   │   │   ├── themes.ts              # 테마 시스템
│   │   │   ├── sounds.ts              # SoundManager, VibrationManager
│   │   │   └── index.ts               # 게임 exports
│   │   │
│   │   ├── i18n/                      # 다국어 지원 시스템
│   │   │   ├── config.ts              # 로케일 설정 및 유틸리티
│   │   │   ├── useTranslation.ts      # 번역 훅
│   │   │   ├── index.ts               # i18n exports
│   │   │   └── translations/          # 번역 파일
│   │   │       ├── index.ts           # 번역 exports
│   │   │       ├── en.ts              # English
│   │   │       ├── es.ts              # Español
│   │   │       ├── fr.ts              # Français
│   │   │       ├── it.ts              # Italiano
│   │   │       ├── ja.ts              # 日本語
│   │   │       ├── ko.ts              # 한국어
│   │   │       └── zh.ts              # 中文
│   │   │
│   │   ├── storage/                   # 로컬스토리지 관리
│   │   │   └── index.ts               # 스토리지 유틸리티
│   │   │
│   │   ├── animations.ts              # 애니메이션 프리셋 및 유틸리티
│   │   ├── design-tokens.ts           # 디자인 토큰 (색상, 간격, 타이포그래피)
│   │   └── utils.ts                   # 유틸리티 (cn 함수)
│   │
│   ├── stores/
│   │   ├── gameStore.ts               # Zustand 게임 상태 관리
│   │   └── localeStore.ts             # Zustand 언어 상태 관리
│   │
│   ├── hooks/
│   │   └── usePokerCalculator.ts      # Web Worker 승률 계산 훅
│   │
│   └── types/
│       ├── index.ts                   # 타입 exports
│       ├── poker.ts                   # 포커 관련 타입
│       └── game.ts                    # 게임 상태 타입
│
├── public/
│   ├── audio/
│   │   ├── README.md                  # 오디오 문서
│   │   └── bgm/                       # BGM 파일 (MP3)
│   │       ├── home.mp3               # 홈 화면 BGM
│   │       ├── game.mp3               # 게임 플레이 BGM
│   │       ├── result-win.mp3         # 승리 BGM
│   │       └── result-lose.mp3        # 패배 BGM
│   │
│   └── workers/
│       └── poker-calculator.js        # 승률 계산 Web Worker
│
├── tests/                             # E2E 테스트
│   └── e2e/
│       └── *.spec.ts                  # Playwright 테스트 파일
│
└── 설정 파일
    ├── package.json                   # 의존성 및 스크립트
    ├── tsconfig.json                  # TypeScript 설정
    ├── next.config.ts                 # Next.js 설정
    ├── postcss.config.mjs             # PostCSS (Tailwind) 설정
    ├── playwright.config.ts           # E2E 테스트 설정
    ├── vitest.config.ts               # 유닛 테스트 설정
    └── eslint.config.mjs              # 린트 설정
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
- 언어 선택 (7개 언어 지원)

## 다국어 지원 (i18n)

### 지원 언어
| 코드 | 언어 | 아이콘 |
|------|------|--------|
| `en` | English | 🇺🇸 |
| `es` | Español | 🇪🇸 |
| `fr` | Français | 🇫🇷 |
| `it` | Italiano | 🇮🇹 |
| `ja` | 日本語 | 🇯🇵 |
| `zh` | 中文 | 🇨🇳 |
| `ko` | 한국어 | 🇰🇷 |

### 사용법
```tsx
// useTranslation 훅 사용
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('game.title')}</h1>
      <p>{t('game.round.preflop')}</p>
    </div>
  );
}

// 언어 변경 (localeStore 사용)
import { useLocaleStore } from '@/stores/localeStore';

function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <button onClick={() => setLocale('ko')}>
      한국어로 변경
    </button>
  );
}
```

### 번역 키 구조
번역 파일은 중첩 객체 구조로 구성됩니다:
- `common` - 공통 UI 텍스트
- `game` - 게임 관련 텍스트
- `difficulty` - 난이도 이름 및 설명
- `round` - 라운드 이름
- `result` - 결과 메시지
- `settings` - 설정 관련 텍스트
- `achievements` - 도전과제
- `titles` - 칭호
- `quotes` - 포커 명언

## 디자인 시스템

### Design Tokens (`lib/design-tokens.ts`)
중앙 집중식 디자인 토큰 시스템:
- **색상**: primary, success, error, warning, player, computer, gold, surface, text, border
- **간격**: padding, gap, margin
- **타이포그래피**: headings, body, special
- **그림자**: standard, glow effects
- **난이도별 색상**: 각 난이도마다 고유 색상 스킴

### 애니메이션 시스템 (`lib/animations.ts`)
재사용 가능한 애니메이션 프리셋:
- **기본 애니메이션**: fade, slide, zoom, spin, pulse, bounce
- **트랜지션**: fast, default, slow
- **접근성**: motion-safe variants
- **게임 특화**: 카드 뒤집기, 결과 표시, 타이머, 버튼, 진행 바

### 전역 CSS (`app/globals.css`)
- CSS 커스텀 속성 (다크 테마 변수)
- 글래스모피즘 효과
- 네온 보더
- 그라데이션 유틸리티
- 커스텀 애니메이션 (shake, float, pulse-glow, shimmer, bounce-in, slide-up)

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

## 사운드 & 진동 매니저 (`lib/game/sounds.ts`)

### SoundManager
Web Audio API를 사용한 사운드 효과 합성:
```tsx
import { SoundManager } from '@/lib/game/sounds';

const soundManager = new SoundManager();
soundManager.playCardFlip();
soundManager.playCorrect();
soundManager.playWrong();
soundManager.playTimerWarning();
soundManager.playVictory();
soundManager.playGameOver();
```

### VibrationManager
모바일 햅틱 피드백:
```tsx
import { VibrationManager } from '@/lib/game/sounds';

const vibrationManager = new VibrationManager();
vibrationManager.vibrate('light');   // 가벼운 진동
vibrationManager.vibrate('medium');  // 중간 진동
vibrationManager.vibrate('heavy');   // 강한 진동
vibrationManager.vibrate('success'); // 성공 패턴
vibrationManager.vibrate('error');   // 에러 패턴
```

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

# 유닛 테스트
npm run test

# 유닛 테스트 (단일 실행)
npm run test:run

# E2E 테스트
npm run test:e2e
```

## 코딩 컨벤션

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx`
- 유틸/훅: `camelCase.ts`
- 타입 파일: `camelCase.ts`
- 테스트 파일: `*.test.ts` 또는 `*.spec.ts`

### 컴포넌트 구조
```tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ComponentProps {
  // props 정의
}

export function Component({ ...props }: ComponentProps) {
  const { t } = useTranslation();
  // 구현
}
```

### 스타일링
- Tailwind CSS 클래스 사용
- 조건부 클래스는 `cn()` 유틸리티 사용
- 색상: slate(배경), amber(액센트), emerald(성공), red(실패)
- 디자인 토큰 사용 권장 (`lib/design-tokens.ts`)

### 상태 관리
- 전역 상태: Zustand (`gameStore`, `localeStore`)
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

### i18n 관련
- 모든 사용자 표시 문자열은 번역 키 사용
- 새 문자열 추가 시 7개 언어 모두에 번역 추가 필요
- 번역 키는 점(.) 표기법으로 접근 (예: `t('game.round.preflop')`)

## 스토리지 키

### 로컬스토리지
| 키 | 용도 |
|----|------|
| `holdamnit-stats` | 게임 통계 |
| `holdamnit-settings` | 설정 (사운드, 진동, 테마) |
| `holdamnit-comments` | 엔딩 코멘트 |
| `holdamnit-tutorial-seen` | 튜토리얼 완료 여부 |
| `holdamnit-locale` | 사용자 언어 설정 |

### 세션스토리지
| 키 | 용도 |
|----|------|
| `holdamnit-started` | Click to Start 완료 여부 (세션당 1회) |

## 주요 의존성

```json
{
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "zustand": "^5.0.9",
    "howler": "^2.2.4",
    "uuid": "^13.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "@types/react": "^19",
    "@playwright/test": "^1.57.0",
    "vitest": "^4.0.18"
  }
}
```
