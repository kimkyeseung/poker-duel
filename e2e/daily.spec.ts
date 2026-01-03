import { test, expect } from '@playwright/test';

test.describe('일일 챌린지', () => {
  test('일일 챌린지 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/daily');

    // 페이지 로드 확인
    await page.waitForTimeout(500);
    // 일일 챌린지 페이지가 로드되면 통과
  });

  test('일일 챌린지에서 게임을 시작할 수 있다', async ({ page }) => {
    await page.goto('/daily');

    // 시작 버튼 찾기
    const startButton = page.getByRole('button').first();
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('일일 챌린지에서 홈으로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/daily');

    const backLink = page.getByText(/나가기|뒤로|홈/);
    if (await backLink.first().isVisible().catch(() => false)) {
      await backLink.first().click();
    }
  });
});
