import { test, expect } from '@playwright/test';

test.describe('난이도 시스템', () => {
  test.describe('쉬움 난이도', () => {
    test('게임 시작 시 쉬움 난이도로 시작된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      await expect(page.getByText(/쉬움/)).toBeVisible();
    });

    test('쉬움 난이도에서 버튼 UI가 표시된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 애니메이션 대기
      await page.waitForTimeout(2500);

      // 버튼 확인
      const buttons = page.locator('main button');
      await expect(buttons.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('난이도 진행', () => {
    test('난이도 진행 표시기가 존재한다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 난이도 관련 요소 확인
      await expect(page.getByText(/쉬움/)).toBeVisible();
    });
  });

  test.describe('라운드 진행', () => {
    test('라운드 표시기가 존재한다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 라운드 표시 확인
      await page.waitForTimeout(2500);

      const roundIndicator = page.getByText(/프리플랍/);
      await expect(roundIndicator).toBeVisible();
    });
  });
});

test.describe('입력 방식', () => {
  test('프리플랍에서는 버튼 선택 UI가 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 애니메이션 대기
    await page.waitForTimeout(2500);

    // 버튼만 표시됨 (입력 필드 없음)
    const buttons = page.locator('main button');
    await expect(buttons.first()).toBeVisible({ timeout: 5000 });
  });
});
