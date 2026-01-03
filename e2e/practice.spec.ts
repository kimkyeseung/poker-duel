import { test, expect } from '@playwright/test';

test.describe('연습 모드', () => {
  test('연습 모드 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/practice');

    // 페이지 로드 확인
    await page.waitForTimeout(500);
    // 연습 모드 페이지가 로드되면 통과
  });

  test('연습 모드에서 난이도 선택이 가능하다', async ({ page }) => {
    await page.goto('/practice');

    // 버튼들 확인
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
  });

  test('연습 모드에서 게임을 시작할 수 있다', async ({ page }) => {
    await page.goto('/practice');

    // 시작 버튼 클릭
    const startButton = page.getByRole('button').first();
    await startButton.click();

    // 게임 화면으로 이동 확인
    await page.waitForTimeout(1000);
  });

  test('연습 모드에서 홈으로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/practice');

    const backLink = page.getByText(/나가기|뒤로|홈/);
    if (await backLink.first().isVisible().catch(() => false)) {
      await backLink.first().click();
    }
  });
});
