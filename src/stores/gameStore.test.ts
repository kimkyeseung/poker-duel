import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { Difficulty } from '@/types';
import { evaluateStartingHand } from '@/lib/poker/starting-hands';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'king', 'god'];

describe('gameStore - 칩 누적', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('난이도를 올려도 모아둔 칩이 유지된다', () => {
    const store = useGameStore.getState();
    store.initGame('easy');
    store.addChips(394);

    useGameStore.getState().nextDifficulty();

    const after = useGameStore.getState();
    expect(after.difficulty).toBe('normal');
    expect(after.chips).toBe(394);
  });

  it('여섯 난이도를 연달아 클리어해도 칩이 계속 쌓인다', () => {
    useGameStore.getState().initGame('easy');

    for (const difficulty of DIFFICULTIES) {
      expect(useGameStore.getState().difficulty).toBe(difficulty);
      useGameStore.getState().addChips(100);
      useGameStore.getState().nextDifficulty();
    }

    const after = useGameStore.getState();
    expect(after.chips).toBe(600);
    // god 다음은 없으므로 마지막 nextDifficulty는 승리 처리로 빠진다
    expect(after.status).toBe('victory');
  });

  it('난이도가 바뀌면 "+N" 보상 표시는 초기화된다', () => {
    const store = useGameStore.getState();
    store.initGame('easy');
    store.addChips(50);
    expect(useGameStore.getState().lastChipReward).toBe(50);

    useGameStore.getState().nextDifficulty();

    expect(useGameStore.getState().lastChipReward).toBeNull();
  });

  it('상대가 바뀌는 동안에도 칩이 유지된다', () => {
    const store = useGameStore.getState();
    store.initGame('easy');
    store.addChips(40);

    useGameStore.getState().nextOpponent();

    const after = useGameStore.getState();
    expect(after.currentOpponentIndex).toBe(1);
    expect(after.chips).toBe(40);
  });

  it('새 게임(resetGame + initGame)은 칩을 0부터 시작한다', () => {
    const store = useGameStore.getState();
    store.initGame('easy');
    store.addChips(500);

    useGameStore.getState().resetGame();
    useGameStore.getState().initGame('easy');

    expect(useGameStore.getState().chips).toBe(0);
  });
});

describe('gameStore - 상대 핸드 매칭', () => {
  // 상대별 매칭 허용 범위 (OPPONENT_CONFIGS 순서: 상대1, 상대2, 스몰, 빅, 딜러)
  const MATCH_RANGE: (number | null)[] = [null, null, 30, 15, 5];

  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  /** 한 난이도(상대 5명)를 끝까지 진행하며 상대별 랭킹 편차를 모은다 */
  function playThroughOneLevel(viewRiver: boolean) {
    useGameStore.getState().initGame('easy');
    const playerRank = evaluateStartingHand(
      useGameStore.getState().playerHand!
    ).rank;

    const deviations: number[] = [];

    for (let i = 0; i < 5; i++) {
      const { computerHand, currentOpponentIndex } = useGameStore.getState();
      expect(currentOpponentIndex).toBe(i);
      deviations.push(
        Math.abs(evaluateStartingHand(computerHand!).rank - playerRank)
      );

      // 프리플랍 -> 플랍 -> 턴 (-> 리버) 까지 카드를 실제로 소모시킨다.
      // 턴에서 정답을 맞히면 상대를 잡으므로, 리버는 "리버 보기"를 택한 경우만 깔린다.
      useGameStore.getState().nextRound(); // flop: 번 1 + 3장
      useGameStore.getState().nextRound(); // turn: 번 1 + 1장
      if (viewRiver) useGameStore.getState().nextRound(); // river: 번 1 + 1장

      // 커뮤니티/번 카드가 실제로 깔렸는지 확인 (덱 고갈 시 undefined가 섞인다)
      const { communityCards, burnCards } = useGameStore.getState();
      expect(communityCards.every((c) => c !== undefined)).toBe(true);
      expect(burnCards.every((c) => c !== undefined)).toBe(true);
      expect(communityCards).toHaveLength(viewRiver ? 5 : 4);

      if (i < 4) useGameStore.getState().nextOpponent();
    }

    return deviations;
  }

  for (const viewRiver of [false, true]) {
    it(`상대 5명 내내 매칭 범위를 지킨다 (리버 ${viewRiver ? '봄' : '안 봄'})`, () => {
      const violations = [0, 0, 0, 0, 0];
      const RUNS = 200;

      for (let run = 0; run < RUNS; run++) {
        const deviations = playThroughOneLevel(viewRiver);
        deviations.forEach((dev, i) => {
          const range = MATCH_RANGE[i];
          if (range !== null && dev > range) violations[i]++;
        });
      }

      // 상대1/상대2는 랜덤이라 검사 대상이 아니다
      expect(violations[2], `스몰블라인드 ±30 위반 ${violations[2]}/${RUNS}`).toBe(0);
      expect(violations[3], `빅블라인드 ±15 위반 ${violations[3]}/${RUNS}`).toBe(0);
      expect(violations[4], `딜러 ±5 위반 ${violations[4]}/${RUNS}`).toBe(0);
    });
  }

  it('상대가 바뀌면 덱이 다시 채워진다', () => {
    useGameStore.getState().initGame('easy');
    useGameStore.getState().nextRound(); // flop
    useGameStore.getState().nextRound(); // turn

    const beforeSwitch = useGameStore.getState().deck.length;
    useGameStore.getState().nextOpponent();
    const afterSwitch = useGameStore.getState().deck;

    expect(beforeSwitch).toBeLessThan(48);
    // 52장 - 플레이어 2장 - 상대 2장
    expect(afterSwitch).toHaveLength(48);

    // 플레이어 핸드는 유지되고, 그 카드가 덱에 다시 섞여 들어가지 않는다
    const { playerHand, computerHand } = useGameStore.getState();
    for (const held of [...playerHand!, ...computerHand!]) {
      expect(
        afterSwitch.some((c) => c.suit === held.suit && c.rank === held.rank)
      ).toBe(false);
    }
  });

  it('상대가 바뀌어도 플레이어 핸드는 그대로다', () => {
    useGameStore.getState().initGame('easy');
    const before = useGameStore.getState().playerHand!;

    useGameStore.getState().nextOpponent();

    expect(useGameStore.getState().playerHand).toEqual(before);
  });
});
