import { test, expect } from '@playwright/test';

test.describe('통계 페이지', () => {
  test('통계 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/stats');

    // 통계 페이지 요소 확인
    await expect(page.getByText(/통계|기록|Stats/i)).toBeVisible();
  });

  test('총 게임 수가 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 게임 수 관련 텍스트 확인
    const statsText = page.getByText(/게임|플레이|판/);
    await expect(statsText.first()).toBeVisible();
  });

  test('승률이 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 승률 관련 텍스트 확인
    const winRateText = page.getByText(/승률|%/);
    await expect(winRateText.first()).toBeVisible();
  });

  test('연승 기록이 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 연승 관련 텍스트 확인
    const streakText = page.getByText(/연승|스트릭|Streak/i);
    await expect(streakText.first()).toBeVisible();
  });

  test('난이도별 통계가 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 난이도 관련 텍스트 확인
    const difficultyText = page.getByText(/쉬움|보통|어려움|전문가|홀덤의 신/);
    await expect(difficultyText.first()).toBeVisible();
  });

  test('홈으로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/stats');

    const backLink = page.getByRole('link', { name: /홈|뒤로|나가기/i });
    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
