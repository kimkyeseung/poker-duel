# 오디오 시스템 가이드

## 아키텍처

- **BGM**: Howler.js (MP3 파일)
- **SFX**: Web Audio API (실시간 합성, 파일 불필요)
- **SSR 대응**: 동적 import 사용

## 사용법

```tsx
// 1. BGM 재생
import { useBGM } from '@/lib/audio';
useBGM('game'); // 자동 재생 (인터랙션 감지 후)

// 2. SFX 재생
import { useSFX } from '@/lib/audio';
const { playSFX } = useSFX();
playSFX('button-click');

// 3. 음소거 토글
import { useAudio } from '@/lib/audio';
const { isMuted, toggleMute } = useAudio();
```

## BGM 타입
`home` | `game` | `result-win` | `result-lose`

## SFX 타입
`button-click` | `card-flip` | `correct` | `wrong` | `timer-warning` | `victory` | `game-over` 등

## 주의사항

- 브라우저 자동재생 정책: `ClickToStart` 오버레이 필수
- `playSFX`는 에러 시에도 게임 로직 차단 안 함 (try-catch 내장)
