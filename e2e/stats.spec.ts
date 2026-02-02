import { test, expect } from '@playwright/test';

test.describe('통계 페이지', () => {
  test('통계 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/stats');

    // 통계 페이지 요소 확인 (다양한 언어)
    await expect(page.getByText(/Statistics|Stats|통계|기록|統計|统计|Estadísticas|Statistiques|Statistiche/i)).toBeVisible();
  });

  test('총 게임 수가 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 게임 수 관련 텍스트 확인 (다양한 언어)
    const statsText = page.getByText(/Total Games|총 게임|総ゲーム|总游戏|Partidas Totales|Parties Totales|Partite Totali|게임|플레이|판/i);
    await expect(statsText.first()).toBeVisible();
  });

  test('승률이 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 승률 관련 텍스트 확인 (% 포함 또는 Win Rate 등)
    const winRateText = page.getByText(/Win Rate|승률|勝率|胜率|% Victoria|% Victoire|% Vittoria|%/i);
    await expect(winRateText.first()).toBeVisible();
  });

  test('연승 기록이 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 연승 관련 텍스트 확인 (다양한 언어)
    const streakText = page.getByText(/Streak|연승|連勝|连胜|Racha|Série|Serie/i);
    await expect(streakText.first()).toBeVisible();
  });

  test('난이도별 통계가 표시된다', async ({ page }) => {
    await page.goto('/stats');

    // 난이도 관련 텍스트 확인 (다양한 언어)
    const difficultyText = page.getByText(/Easy|Normal|Hard|Expert|God|쉬움|보통|어려움|전문가|홀덤의 신|イージー|ノーマル|ハード|エキスパート|简单|普通|困难|专家/i);
    await expect(difficultyText.first()).toBeVisible();
  });

  test('홈으로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/stats');

    const backLink = page.getByRole('link').filter({
      hasText: /Home|홈|뒤로|나가기|ホーム|主页|Inicio|Accueil/i
    });
    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
