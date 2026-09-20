import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { Difficulty } from '@/types';

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
