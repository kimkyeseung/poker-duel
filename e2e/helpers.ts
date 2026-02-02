import { expect, Page } from '@playwright/test';

/**
 * Click to Start 오버레이를 처리합니다.
 * 오버레이가 표시되면 클릭하여 닫습니다.
 */
export async function dismissClickToStart(page: Page) {
  try {
    // 오버레이 컨테이너를 찾아서 클릭
    const overlay = page.locator('[data-testid="click-to-start"]');
    if (await overlay.isVisible({ timeout: 2000 })) {
      await overlay.click({ force: true });
      // 오버레이가 사라질 때까지 대기
      await expect(overlay).not.toBeVisible({ timeout: 2000 });
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
  // 페이지 로드 완료 대기
  await page.waitForLoadState('domcontentloaded');
  await dismissClickToStart(page);
}

/**
 * 게임 페이지로 이동합니다.
 * 다양한 언어의 Quick Play 버튼을 처리합니다.
 */
export async function goToGame(page: Page) {
  await goToHome(page);
  // 다양한 언어의 Quick Play 버튼 텍스트
  const quickPlayButton = page.locator('button').filter({
    hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
  });
  await quickPlayButton.click();
  await expect(page).toHaveURL(/\/game/);
}

/**
 * 연습 모드 페이지로 이동합니다.
 */
export async function goToPractice(page: Page) {
  await goToHome(page);
  // main 영역 내의 버튼에서 찾기
  const practiceButton = page.locator('main button').filter({
    hasText: /PRACTICE|연습|練習|练习|PRÁCTICA|ENTRAÎNEMENT|PRATICA/i
  });
  await practiceButton.click();
  await expect(page).toHaveURL('/practice');
}

/**
 * 일일 챌린지 페이지로 이동합니다.
 */
export async function goToDaily(page: Page) {
  await goToHome(page);
  // main 영역 내의 버튼에서 찾기
  const dailyButton = page.locator('main button').filter({
    hasText: /DAILY|일일|デイリー|每日|DIARIO|QUOTIDIEN|GIORNALIER/i
  });
  await dailyButton.click();
  await expect(page).toHaveURL('/daily');
}

/**
 * 게임에서 카드 공개 애니메이션이 완료될 때까지 대기합니다.
 */
export async function waitForCardReveal(page: Page) {
  await page.waitForTimeout(2500);
}

/**
 * 정답 선택 버튼 중 하나를 클릭합니다.
 */
export async function clickAnswerButton(page: Page, buttonIndex: number = 0) {
  const buttons = page.locator('main button, [role="group"] button, [role="radio"]');
  const button = buttons.nth(buttonIndex);
  if (await button.isVisible({ timeout: 5000 })) {
    await button.click();
  }
}
