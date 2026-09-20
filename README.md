# Hol'Damn It!

> THE ULTIMATE EQUITY CHALLENGE

텍사스 홀덤 승률 예측 게임. 매 라운드 승률을 맞혀야 하고, **한 번이라도 틀리면 게임 오버**입니다.

## 게임 규칙

6단계 난이도를 차례로 오르며, 각 난이도마다 5명의 상대를 순서대로 상대합니다. 딜러를 이기면 다음 난이도로, 마지막 난이도의 딜러까지 이기면 승리입니다.

```
상대1 → 상대2 → 스몰블라인드 → 빅블라인드 → 딜러   (난이도 1단계)
                                              ↓
                                        다음 난이도로
```

각 대결은 4라운드로 진행됩니다.

| 라운드 | 제한 시간 | 내용 |
|--------|-----------|------|
| 프리플랍 | 30초 | 169개 스타팅 핸드 랭킹으로 승패만 판단 (승률 계산 없음) |
| 플랍 | 60초 | 남은 990개 조합 완전탐색으로 승률 산출 |
| 턴 | 60초 | 남은 44개 조합 완전탐색 |
| 리버 | — | 승률에 따른 배당률로 칩 배팅 |

### 난이도별 입력 방식

| 난이도 | 입력 | 허용 오차 |
|--------|------|-----------|
| 쉬움 | 2지선다 (나 / 컴퓨터) | — |
| 보통 | 3지선다 (나 / 비김 / 컴퓨터) | — |
| 어려움 | 슬라이더 (5% 단위) | — |
| 전문가 | 직접 입력 | ±5% |
| 홀덤왕 | 직접 입력 | ±3% |
| 홀덤의 신 | 직접 입력 | ±1% |

프리플랍은 난이도와 무관하게 항상 2지선다입니다.

### 상대별 핸드 매칭

뒤로 갈수록 상대의 핸드가 플레이어와 비슷해져 판단이 어려워집니다.

| 상대 | 핸드 매칭 | 시각적으로 명백한 차이 제외 |
|------|-----------|------------------------------|
| 상대1, 상대2 | 완전 랜덤 | — |
| 스몰블라인드 | 플레이어 핸드 랭킹 ±30 | — |
| 빅블라인드 | ±15 | ✓ |
| 딜러 | ±5 | ✓ |

### 칩

정답을 맞히면 남은 시간에 비례해 칩을 얻습니다.

```
획득 칩 = 기본칩 × (1 + 남은시간 / 제한시간)
기본칩: 쉬움 10 · 보통 20 · 어려움 30 · 전문가 50 · 홀덤왕 100 · 홀덤의 신 200
```

리버에서는 모은 칩을 배팅합니다. 배당률은 승률이 낮을수록 높아집니다.

```
배당률 = (100 - 승률) / 승률 + 1     (1.05 ~ 10.0)
```

## 모드

- **게임** (`/game`) — 6단계 난이도를 모두 클리어하는 메인 모드
- **연습** (`/practice`) — 쉬움 ~ 어려움 난이도를 게임 오버 없이 연습
- **일일 챌린지** (`/daily`) — 날짜를 시드로 덱을 섞어, 모든 플레이어가 같은 카드로 겨룸
- **통계** (`/stats`) · **설정** (`/settings`) · **크레딧** (`/comments`)

## 기술 스택

| | |
|---|---|
| 프레임워크 | Next.js 16 (App Router, 정적 export) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS 4 |
| 상태 관리 | Zustand |
| 백엔드 | Supabase (리더보드) |
| 오디오 | Howler.js (BGM) + Web Audio API (효과음 실시간 합성) |
| 데스크톱 | Tauri 2 |
| 테스트 | Vitest (유닛) + Playwright (E2E) |

승률 계산은 완전탐색이라 비용이 크므로 **Web Worker**(`public/workers/poker-calculator.js`)에서 비동기로 수행해 UI를 막지 않습니다.

## 시작하기

### 요구 사항

Node.js 20.9 이상

### 설치 및 실행

```bash
npm ci
npm run dev
```

http://localhost:3000 에서 확인합니다.

### 환경 변수

리더보드를 쓰려면 `.env.local`에 Supabase 정보를 넣습니다. (`.env.example` 참고)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**설정하지 않아도 게임은 정상 동작합니다.** 리더보드 기능만 비활성화됩니다.

리더보드를 쓴다면 Supabase SQL Editor에서 `supabase/schema.sql`을 실행해야 합니다. 신규 설치와 기존 배포 업그레이드를 모두 처리하는 멱등 스크립트입니다. 점수 쓰기는 테이블 직접 INSERT가 아니라 검증과 레이트리밋을 거치는 RPC로만 가능하도록 되어 있으므로, 이 스크립트를 실행하지 않으면 점수 제출이 실패합니다.

## 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드 (out/ 에 정적 파일 생성)
npm run lint         # ESLint
npm run test         # 유닛 테스트 (watch)
npm run test:run     # 유닛 테스트 (1회 실행)
npm run test:e2e     # E2E 테스트
npm run tauri:dev    # 데스크톱 앱 개발 모드
npm run tauri:build  # 데스크톱 앱 빌드
```

> `npm run start`는 동작하지 않습니다. `next.config.ts`가 `output: 'export'`로 정적 사이트를 만들기 때문입니다. 빌드 결과를 확인하려면 `out/` 디렉토리를 정적 서버로 서빙하세요.

## 테스트

```bash
npm run test:run   # 유닛 118개
npm run test:e2e   # E2E 75개
```

E2E는 개발 서버를 자동으로 띄웁니다. 처음 실행한다면 브라우저를 먼저 설치하세요.

```bash
npx playwright install chromium
```

두 스위트 모두 CI에서 차단 조건으로 실행되며, 통과해야 머지할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/          # 페이지 (game, practice, daily, stats, settings, comments)
├── components/   # game/ (게임 UI), ui/ (공통 UI)
├── hooks/        # usePokerCalculator (Web Worker 래퍼)
├── lib/          # poker/ (엔진), audio/, i18n/, game/ (칩), storage/, supabase/
├── stores/       # gameStore, localeStore
└── types/        # poker.ts, game.ts
```

`.claude/CLAUDE.md`와 각 디렉토리의 `CLAUDE.md`에 더 자세한 구현 가이드가 있습니다.

## 다국어

한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 이탈리아어 7개 언어를 지원합니다. 새 문자열을 추가할 때는 `src/lib/i18n/translations/`의 모든 언어 파일에 번역을 넣어야 합니다.
