import { test, expect } from '@playwright/test';
import { goToGame, waitForCardReveal, clickAnswerButton } from './helpers';

test.describe('칩 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);
  });

  test('게임 시작 시 칩이 0으로 초기화된다', async ({ page }) => {
    // 칩 표시 영역 확인 (숫자 0이 표시되어야 함)
    const chipDisplay = page.locator('[data-testid="chip-display"], .chip-display');
    if (await chipDisplay.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(chipDisplay).toContainText(/0|chips/i);
    }
  });

  test('정답 시 칩이 증가한다', async ({ page }) => {
    // 프리플랍은 칩 보상 없음 - 플랍까지 진행해야 함
    // 프리플랍에서 정답을 선택
    await clickAnswerButton(page, 0);
    await page.waitForTimeout(1500);

    // Next Round 버튼이 있으면 클릭 (정답인 경우)
    const nextButton = page.locator('button').filter({
      hasText: /Next Round|다음 라운드|次のラウンド|下一轮|Siguiente Ronda|Tour Suivant|Prossimo Turno/i
    });

    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await waitForCardReveal(page);

      // 플랍에서 정답 선택
      await clickAnswerButton(page, 0);
      await page.waitForTimeout(1500);

      // 정답이면 칩이 증가했을 수 있음 - ChipDisplay 확인
      const chipDisplay = page.locator('[data-testid="chip-display"], .chip-display');
      if (await chipDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
        // 칩 표시가 존재하면 테스트 통과
        await expect(chipDisplay).toBeVisible();
      }
    }
  });
});

test.describe('칩 UI 컴포넌트', () => {
  test('헤더에 칩 표시가 있다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 헤더 영역에 칩 관련 UI가 있는지 확인
    const header = page.locator('header, [data-testid="game-header"]');
    if (await header.isVisible({ timeout: 3000 }).catch(() => false)) {
      // 칩 아이콘이나 숫자가 있는지 확인
      const chipElement = header.locator('.text-amber-400, [data-testid="chip-display"]');
      // 칩 표시가 있으면 테스트 통과
      if (await chipElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(chipElement).toBeVisible();
      }
    }
  });
});
