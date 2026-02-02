import { test, expect } from '@playwright/test';
import { goToGame, waitForCardReveal } from './helpers';

test.describe('난이도 시스템', () => {
  test.describe('쉬움 난이도', () => {
    test('게임 시작 시 쉬움 난이도로 시작된다', async ({ page }) => {
      await goToGame(page);
      await waitForCardReveal(page);

      // 쉬움 난이도 표시 확인 (다양한 언어) - badge 클래스 내에서 찾기
      const easyBadge = page.locator('.badge').filter({
        hasText: /Easy|쉬움|イージー|简单|Fácil|Facile/i
      });
      await expect(easyBadge).toBeVisible();
    });

    test('쉬움 난이도에서 버튼 UI가 표시된다', async ({ page }) => {
      await goToGame(page);
      await waitForCardReveal(page);

      // 버튼 확인
      const answerButtons = page.locator('[role="group"] button, [role="radio"], .game-card button');
      await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('난이도 진행', () => {
    test('난이도 진행 표시기가 존재한다', async ({ page }) => {
      await goToGame(page);
      await waitForCardReveal(page);

      // 난이도 배지 확인
      const difficultyBadge = page.locator('.badge');
      await expect(difficultyBadge).toBeVisible();
    });
  });

  test.describe('라운드 진행', () => {
    test('라운드 표시기가 존재한다', async ({ page }) => {
      await goToGame(page);
      await waitForCardReveal(page);

      // 라운드 표시 확인 (Pre-flop / 프리플랍 등) - h2 또는 heading에서 찾기
      const roundIndicator = page.locator('h2, [role="heading"]').filter({
        hasText: /Pre-?flop|프리플랍|プリフロップ|翻牌前|PRÉ-FLOP|PREFLOP/i
      });
      await expect(roundIndicator).toBeVisible();
    });
  });
});

test.describe('입력 방식', () => {
  test('프리플랍에서는 버튼 선택 UI가 표시된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 버튼만 표시됨 (입력 필드 없음)
    const answerButtons = page.locator('[role="group"] button, [role="radio"], .game-card button');
    await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
  });
});
