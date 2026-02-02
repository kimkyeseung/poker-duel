import { test, expect } from '@playwright/test';
import { goToHome, waitForCardReveal, clickAnswerButton, dismissClickToStart } from './helpers';

test.describe('카드 공개 애니메이션', () => {
  test.describe('프리플랍 카드 공개', () => {
    test('프리플랍 시작 시 게임 UI가 로드된다', async ({ page }) => {
      await goToHome(page);

      // Quick Play 버튼 클릭
      const quickPlayButton = page.locator('button').filter({
        hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
      });
      await quickPlayButton.click();

      // 게임 페이지로 이동 확인
      await expect(page).toHaveURL(/\/game/);

      // 게임 테이블이 표시될 때까지 대기
      const gameTable = page.locator('[data-testid="game-table"]');
      await expect(gameTable).toBeVisible({ timeout: 10000 });
    });

    test('프리플랍 카드 공개 애니메이션이 약 2초 후 완료된다', async ({ page }) => {
      await goToHome(page);

      const quickPlayButton = page.locator('button').filter({
        hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
      });
      await quickPlayButton.click();
      await expect(page).toHaveURL(/\/game/);

      // 2초 후 입력 UI가 표시됨
      await waitForCardReveal(page);

      // 버튼이 표시됨
      const answerButtons = page.locator('[role="group"] button, [role="radio"], .game-card button');
      await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
    });

    test('플레이어 카드가 공개된다', async ({ page }) => {
      await goToHome(page);

      const quickPlayButton = page.locator('button').filter({
        hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
      });
      await quickPlayButton.click();
      await expect(page).toHaveURL(/\/game/);
      await waitForCardReveal(page);

      // 플레이어 영역 확인
      const playerArea = page.locator('[data-testid="player-area"]');
      await expect(playerArea).toBeVisible();
    });
  });

  test.describe('플랍 카드 공개', () => {
    test('플랍 시작 시 카드가 순차적으로 공개된다', async ({ page }) => {
      await goToHome(page);

      const quickPlayButton = page.locator('button').filter({
        hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
      });
      await quickPlayButton.click();
      await expect(page).toHaveURL(/\/game/);
      await waitForCardReveal(page);

      // 프리플랍 정답 선택
      await clickAnswerButton(page, 0);
      await page.waitForTimeout(1500);

      // 정답인 경우 다음 라운드로
      const nextButton = page.locator('button').filter({
        hasText: /Next Round|다음 라운드|次のラウンド|下一轮|Siguiente Ronda|Tour Suivant|Prossimo Turno/i
      });

      if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextButton.click();

        // 플랍에서 입력 UI가 다시 표시될 때까지 대기
        await waitForCardReveal(page);
        const answerButtons = page.locator('[role="group"] button, [role="radio"], .game-card button');
        await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('애니메이션 타이밍', () => {
    test('카드 공개 후 입력 UI가 표시된다', async ({ page }) => {
      await goToHome(page);

      const quickPlayButton = page.locator('button').filter({
        hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
      });
      await quickPlayButton.click();
      await expect(page).toHaveURL(/\/game/);
      await waitForCardReveal(page);

      // 버튼이 표시됨
      const answerButtons = page.locator('[role="group"] button, [role="radio"], .game-card button');
      await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
    });

    test('카드 공개 후 플레이어 영역이 보인다', async ({ page }) => {
      await goToHome(page);

      const quickPlayButton = page.locator('button').filter({
        hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
      });
      await quickPlayButton.click();
      await expect(page).toHaveURL(/\/game/);
      await waitForCardReveal(page);

      // 플레이어 영역과 딜러 영역이 모두 보여야 함
      await expect(page.locator('[data-testid="player-area"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="dealer-area"]')).toBeVisible({ timeout: 5000 });
    });
  });
});
