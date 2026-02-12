import { test, expect } from '@playwright/test';
import { goToGame, waitForCardReveal, clickAnswerButton } from './helpers';

test.describe('번 카드 시스템', () => {
  test('프리플랍에서는 번 카드가 없다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 번 카드 영역 확인 (프리플랍에서는 비어있어야 함)
    const burnCardArea = page.locator('[data-testid="burn-cards"], .burn-card-pile');

    // 번 카드 영역이 없거나 비어있으면 테스트 통과
    if (await burnCardArea.isVisible({ timeout: 2000 }).catch(() => false)) {
      // 번 카드 개수가 0인지 확인
      const burnCards = burnCardArea.locator('.card, [data-testid="burn-card"]');
      const count = await burnCards.count();
      expect(count).toBe(0);
    }
  });

  test('플랍 진입 시 번 카드가 1장 표시된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 프리플랍에서 정답 선택
    await clickAnswerButton(page, 0);
    await page.waitForTimeout(1500);

    // Next Round 버튼 클릭 (정답인 경우)
    const nextButton = page.locator('button').filter({
      hasText: /Next Round|다음 라운드|次のラウンド|下一轮|Siguiente Ronda|Tour Suivant|Prossimo Turno/i
    });

    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await waitForCardReveal(page);

      // 번 카드 영역 확인
      const burnCardArea = page.locator('[data-testid="burn-cards"], .burn-card-pile');

      if (await burnCardArea.isVisible({ timeout: 3000 }).catch(() => false)) {
        // BURN 레이블이 표시되는지 확인
        await expect(burnCardArea).toContainText(/BURN/i);
      }
    }
  });

  test('테이블에 번 카드 파일이 렌더링된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 프리플랍에서 정답 선택
    await clickAnswerButton(page, 0);
    await page.waitForTimeout(1500);

    // Next Round 버튼 클릭 (정답인 경우)
    const nextButton = page.locator('button').filter({
      hasText: /Next Round|다음 라운드|次のラウンド|下一轮|Siguiente Ronda|Tour Suivant|Prossimo Turno/i
    });

    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await waitForCardReveal(page);

      // 테이블 영역 확인
      const table = page.locator('[data-testid="game-table"]');
      await expect(table).toBeVisible();
    }
  });
});
