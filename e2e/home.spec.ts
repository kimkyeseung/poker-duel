import { test, expect } from '@playwright/test';
import { goToHome, goToGame, goToPractice, goToDaily } from './helpers';

test.describe('홈 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await goToHome(page);
  });

  test('홈 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 타이틀 확인 - main 영역의 HOL'DAMN IT!
    await expect(page.getByRole('main').getByRole('heading', { name: /HOL.*DAMN.*IT/i })).toBeVisible();
  });

  test('게임 시작 버튼이 존재하고 클릭 가능하다', async ({ page }) => {
    // 게임 시작 버튼 (다양한 언어)
    const startButton = page.getByRole('main').locator('button').filter({
      hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
    });
    await expect(startButton).toBeVisible();

    // 클릭 시 게임 페이지로 이동
    await startButton.click();
    await expect(page).toHaveURL(/\/game/);
  });

  test('연습 모드 버튼이 존재한다', async ({ page }) => {
    // 연습 모드 버튼 (다양한 언어)
    const practiceButton = page.getByRole('main').locator('button').filter({
      hasText: /PRACTICE|연습|練習|练习|PRÁCTICA|ENTRAÎNEMENT|PRATICA/i
    });
    await expect(practiceButton).toBeVisible();

    await practiceButton.click();
    await expect(page).toHaveURL('/practice');
  });

  test('일일 챌린지 버튼이 존재한다', async ({ page }) => {
    // 일일 챌린지 버튼 (다양한 언어)
    const dailyButton = page.getByRole('main').locator('button').filter({
      hasText: /DAILY|일일|デイリー|每日|DIARIO|QUOTIDIEN|GIORNALIER/i
    });
    await expect(dailyButton).toBeVisible();

    await dailyButton.click();
    await expect(page).toHaveURL('/daily');
  });

  test('설정 버튼이 존재한다', async ({ page }) => {
    // 설정 버튼 - header에 있는 톱니바퀴 버튼
    const settingsButton = page.locator('header button').last();
    await expect(settingsButton).toBeVisible();

    await settingsButton.click();
    await expect(page).toHaveURL('/settings');
  });

  test('통계 페이지로 이동할 수 있다', async ({ page }) => {
    // HI SCORE/최고 점수 등 (다양한 언어)
    const statsLink = page.getByRole('contentinfo').locator('a, button').filter({
      hasText: /HI SCORE|최고 점수|SCORE|ハイスコア|最高分|RÉCORD|MEILLEUR|RECORD/i
    });
    await expect(statsLink).toBeVisible();

    await statsLink.click();
    await expect(page).toHaveURL('/stats');
  });

  test('크레딧 페이지로 이동할 수 있다', async ({ page }) => {
    // CREDITS/크레딧 등 (다양한 언어)
    const creditsLink = page.getByRole('contentinfo').locator('a, button').filter({
      hasText: /CREDITS|크레딧|クレジット|制作人员|CRÉDITOS|CRÉDITS|CREDITI/i
    });
    await expect(creditsLink).toBeVisible();

    await creditsLink.click();
    await expect(page).toHaveURL('/comments');
  });
});
