import { test, expect } from '@playwright/test';

test.describe('홈 페이지', () => {
  test('홈 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/');

    // 타이틀 확인
    await expect(page.getByRole('heading', { name: 'Poker Duel' })).toBeVisible();
    await expect(page.getByText('홀덤 승률을 맞춰라!')).toBeVisible();
  });

  test('게임 시작 버튼이 존재하고 클릭 가능하다', async ({ page }) => {
    await page.goto('/');

    // 게임 시작 버튼 찾기
    const startButton = page.getByRole('button', { name: /게임 시작/i });
    await expect(startButton).toBeVisible();

    // 클릭 시 게임 페이지로 이동
    await startButton.click();
    await expect(page).toHaveURL(/\/game\//);
  });

  test('연습 모드 버튼이 존재한다', async ({ page }) => {
    await page.goto('/');

    const practiceButton = page.getByRole('button', { name: /연습 모드/i });
    await expect(practiceButton).toBeVisible();

    await practiceButton.click();
    await expect(page).toHaveURL('/practice');
  });

  test('일일 챌린지 버튼이 존재한다', async ({ page }) => {
    await page.goto('/');

    const dailyButton = page.getByRole('button', { name: /일일 챌린지/i });
    await expect(dailyButton).toBeVisible();

    await dailyButton.click();
    await expect(page).toHaveURL('/daily');
  });

  test('통계 버튼이 존재한다', async ({ page }) => {
    await page.goto('/');

    const statsButton = page.getByRole('button', { name: /통계/i });
    await expect(statsButton).toBeVisible();

    await statsButton.click();
    await expect(page).toHaveURL('/stats');
  });

  test('설정 버튼이 존재한다', async ({ page }) => {
    await page.goto('/');

    // 설정 버튼 (⚙️ 아이콘)
    const settingsButton = page.locator('footer button');
    await expect(settingsButton).toBeVisible();

    await settingsButton.click();
    await expect(page).toHaveURL('/settings');
  });

  test('게임 방법 버튼이 존재한다', async ({ page }) => {
    await page.goto('/');

    const tutorialButton = page.getByRole('button', { name: /게임 방법/i });
    await expect(tutorialButton).toBeVisible();
  });
});
