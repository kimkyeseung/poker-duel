import { test, expect } from '@playwright/test';
import { goToHome } from './helpers';

test.describe('홈 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await goToHome(page);
  });

  test('홈 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 타이틀 확인 - main 영역의 HOL'DAMN IT!
    await expect(page.getByRole('main').getByRole('heading', { name: /HOL.*DAMN.*IT/i })).toBeVisible();
  });

  test('게임 시작 버튼이 존재하고 클릭 가능하다', async ({ page }) => {
    // 게임 시작 버튼 찾기 (QUICK PLAY) - main 영역에서
    const startButton = page.getByRole('main').getByRole('button', { name: 'QUICK PLAY' });
    await expect(startButton).toBeVisible();

    // 클릭 시 게임 페이지로 이동
    await startButton.click();
    await expect(page).toHaveURL(/\/game/);
  });

  test('연습 모드 버튼이 존재한다', async ({ page }) => {
    // main 영역에서 PRACTICE 버튼 찾기
    const practiceButton = page.getByRole('main').getByRole('button', { name: 'PRACTICE' });
    await expect(practiceButton).toBeVisible();

    await practiceButton.click();
    await expect(page).toHaveURL('/practice');
  });

  test('일일 챌린지 버튼이 존재한다', async ({ page }) => {
    const dailyButton = page.getByRole('main').getByRole('button', { name: 'DAILY RUN' });
    await expect(dailyButton).toBeVisible();

    await dailyButton.click();
    await expect(page).toHaveURL('/daily');
  });

  test('설정 버튼이 존재한다', async ({ page }) => {
    // 설정 버튼 (⚙️ 아이콘) - 헤더에 있음
    const settingsButton = page.locator('header button').last();
    await expect(settingsButton).toBeVisible();

    await settingsButton.click();
    await expect(page).toHaveURL('/settings');
  });

  test('통계 페이지로 이동할 수 있다', async ({ page }) => {
    // HI SCORE 버튼으로 통계 페이지 이동 (footer에 있음)
    const statsButton = page.getByRole('contentinfo').getByText('HI SCORE');
    await expect(statsButton).toBeVisible();

    await statsButton.click();
    await expect(page).toHaveURL('/stats');
  });

  test('크레딧 페이지로 이동할 수 있다', async ({ page }) => {
    const creditsButton = page.getByRole('contentinfo').getByText('CREDITS');
    await expect(creditsButton).toBeVisible();

    await creditsButton.click();
    await expect(page).toHaveURL('/comments');
  });
});
