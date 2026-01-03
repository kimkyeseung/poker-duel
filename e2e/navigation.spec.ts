import { test, expect } from '@playwright/test';

test.describe('네비게이션', () => {
  test('홈 → 게임 → 홈 이동이 가능하다', async ({ page }) => {
    // 홈 페이지
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // 게임 시작
    await page.getByRole('button', { name: /게임 시작/i }).click();
    await expect(page).toHaveURL(/\/game\//);

    // 홈으로 돌아가기
    await page.getByText(/나가기/).click();
    await expect(page).toHaveURL('/');
  });

  test('홈 → 연습 → 홈 이동이 가능하다', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /연습 모드/i }).click();
    await expect(page).toHaveURL('/practice');
  });

  test('홈 → 일일 챌린지 → 홈 이동이 가능하다', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /일일 챌린지/i }).click();
    await expect(page).toHaveURL('/daily');
  });

  test('홈 → 통계 → 홈 이동이 가능하다', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /통계/i }).click();
    await expect(page).toHaveURL('/stats');
  });

  test('홈 → 설정 → 홈 이동이 가능하다', async ({ page }) => {
    await page.goto('/');

    await page.locator('footer button').click();
    await expect(page).toHaveURL('/settings');
  });
});
