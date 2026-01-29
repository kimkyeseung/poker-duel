import { expect, Page } from '@playwright/test';

/**
 * Click to Start 오버레이를 처리합니다.
 * 오버레이가 표시되면 클릭하여 닫습니다.
 */
export async function dismissClickToStart(page: Page) {
  const overlay = page.locator('text=Click anywhere to start');
  try {
    if (await overlay.isVisible({ timeout: 1000 })) {
      await overlay.click();
      await expect(overlay).not.toBeVisible();
    }
  } catch {
    // 오버레이가 없으면 무시
  }
}

/**
 * 홈 페이지로 이동하고 Click to Start 오버레이를 처리합니다.
 */
export async function goToHome(page: Page) {
  await page.goto('/');
  await dismissClickToStart(page);
}

/**
 * 게임 페이지로 이동합니다.
 */
export async function goToGame(page: Page) {
  await goToHome(page);
  await page.locator('button:has-text("QUICK PLAY")').click();
  await expect(page).toHaveURL(/\/game/);
}

/**
 * 연습 모드 페이지로 이동합니다.
 */
export async function goToPractice(page: Page) {
  await goToHome(page);
  await page.locator('button:has-text("PRACTICE")').click();
  await expect(page).toHaveURL('/practice');
}

/**
 * 일일 챌린지 페이지로 이동합니다.
 */
export async function goToDaily(page: Page) {
  await goToHome(page);
  await page.locator('button:has-text("DAILY RUN")').click();
  await expect(page).toHaveURL('/daily');
}
