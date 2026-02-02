import { test, expect } from '@playwright/test';
import { goToHome, goToGame, goToPractice, goToDaily, dismissClickToStart } from './helpers';

test.describe('네비게이션', () => {
  test('홈 → 게임 → 홈 이동이 가능하다', async ({ page }) => {
    // 게임으로 이동
    await goToGame(page);
    await expect(page).toHaveURL(/\/game/);

    // 홈으로 돌아가기 (Exit/나가기 버튼)
    const exitButton = page.locator('button, a').filter({
      hasText: /Exit|나가기|終了|退出|Salir|Quitter|Esci/i
    });
    await exitButton.click();
    await expect(page).toHaveURL('/');
  });

  test('홈 → 연습 → 홈 이동이 가능하다', async ({ page }) => {
    await goToPractice(page);
    await expect(page).toHaveURL('/practice');
  });

  test('홈 → 일일 챌린지 → 홈 이동이 가능하다', async ({ page }) => {
    await goToDaily(page);
    await expect(page).toHaveURL('/daily');
  });

  test('홈 → 통계 → 홈 이동이 가능하다', async ({ page }) => {
    await goToHome(page);

    // HI SCORE 버튼 찾기 (footer 오른쪽)
    const statsButton = page.locator('footer button, footer a').filter({
      hasText: /HI SCORE|최고 점수|SCORE|ハイスコア|最高分|RÉCORD|MEILLEUR|RECORD/i
    });
    await statsButton.click();
    await expect(page).toHaveURL('/stats');
  });

  test('홈 → 설정 → 홈 이동이 가능하다', async ({ page }) => {
    await goToHome(page);

    // 설정 버튼 (header에 있는 마지막 버튼 - 톱니바퀴)
    const settingsButton = page.locator('header button').last();
    await settingsButton.click();
    await expect(page).toHaveURL('/settings');
  });
});
