# 타입 정의 가이드

## 핵심 타입

### 상대 시스템 (`game.ts`)
```tsx
type OpponentType = 'opponent1' | 'opponent2' | 'smallBlind' | 'bigBlind' | 'dealer';
type HandMatchingRule = 'random' | 'range30' | 'range15' | 'range5';

interface OpponentConfig {
  type: OpponentType;
  label: string;
  labelKey: string;           // i18n 키
  profileImage: string;       // '/profiles/opponent1.png'
  handMatchingRule: HandMatchingRule;
  filterVisuallyObvious: boolean;
}
```

### 카드 (`poker.ts`)
```tsx
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = '2' | '3' | ... | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
}
```

### 게임 상태
```tsx
type Round = 'preflop' | 'flop' | 'turn' | 'river';
type Difficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'master';
type GamePhase = 'betting' | 'result' | 'gameover' | 'victory';
```

## 주의

- `AnswerResult.correctAnswer`: `string | number`
  - 프리플랍: `'player'` | `'computer'`
  - 그 외: 숫자 (승률 %)
