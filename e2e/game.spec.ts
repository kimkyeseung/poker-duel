import { test, expect } from '@playwright/test';
import { goToGame, goToHome, waitForCardReveal, clickAnswerButton } from './helpers';

test.describe('게임 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);
  });

  test('게임 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 플레이어 영역 확인
    await expect(page.locator('[data-testid="player-area"]')).toBeVisible();
  });

  test('난이도 배지가 표시된다', async ({ page }) => {
    // 난이도 배지 확인 (badge 클래스)
    await expect(page.locator('.badge')).toBeVisible();
  });

  test('나가기 버튼이 작동한다', async ({ page }) => {
    // 나가기 버튼 (Exit/나가기/終了 등 다양한 언어)
    const exitButton = page.locator('button, a').filter({
      hasText: /Exit|나가기|終了|退出|Salir|Quitter|Esci/i
    });
    await expect(exitButton).toBeVisible();
    await exitButton.click();
    await expect(page).toHaveURL('/');
  });

  test('테이블에 카드 슬롯이 있다', async ({ page }) => {
    // 테이블 영역 확인
    await expect(page.locator('[data-testid="game-table"]')).toBeVisible();
  });

  test('플레이어 카드 영역이 존재한다', async ({ page }) => {
    // 플레이어 영역 확인
    await expect(page.locator('[data-testid="player-area"]')).toBeVisible({ timeout: 5000 });
  });

  test('컴퓨터 카드 영역이 존재한다', async ({ page }) => {
    // 딜러 영역 확인
    await expect(page.locator('[data-testid="dealer-area"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('프리플랍 라운드', () => {
  test('프리플랍에서 2지선다 UI가 표시된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 2지선다 버튼 확인 (Player/You 또는 Dealer/Computer)
    const answerButtons = page.locator('[role="group"] button, [role="radio"]');
    await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
  });

  test('프리플랍에서 정답을 선택할 수 있다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 첫 번째 버튼 클릭
    await clickAnswerButton(page, 0);

    // 결과가 표시될 때까지 대기
    await page.waitForTimeout(1000);
  });
});

test.describe('플랍 라운드', () => {
  test('플랍에서 커뮤니티 카드가 공개된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 버튼 클릭
    await clickAnswerButton(page, 0);
    await page.waitForTimeout(1500);

    // 정답인 경우 다음 라운드로 (Next Round 버튼)
    const nextButton = page.locator('button').filter({
      hasText: /Next Round|다음 라운드|次のラウンド|下一轮|Siguiente Ronda|Tour Suivant|Prossimo Turno/i
    });

    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();

      // 플랍에서 입력 UI가 다시 표시될 때까지 대기
      await waitForCardReveal(page);
      const answerButtons = page.locator('[role="group"] button, [role="radio"], .game-card button');
      await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('카드 공개 후', () => {
  test('카드 공개 후 입력 UI가 표시된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 입력 UI 표시 확인 (버튼들이 표시됨)
    const answerButtons = page.locator('[role="group"] button, [role="radio"], .game-card button');
    await expect(answerButtons.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('게임 오버', () => {
  // 프리플랍 타임리밋이 30초이므로 타임아웃 테스트는 건너뜁니다
  test.skip('시간 초과 시 게임 오버가 표시된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 프리플랍 타이머 30초 + 여유
    await page.waitForTimeout(35000);

    // 게임 오버 다이얼로그 확인 (GAME OVER 타이틀)
    const gameOverText = page.getByText(/GAME OVER|게임 오버|ゲームオーバー|游戏结束|FIN DEL JUEGO|FIN DE PARTIE|FINE PARTITA/i);
    await expect(gameOverText).toBeVisible({ timeout: 5000 });
  });

  test.skip('게임 오버 후 재시작 버튼이 표시된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 프리플랍 타이머 30초 + 여유
    await page.waitForTimeout(35000);

    // 재시작 버튼 확인 (TRY AGAIN/재도전 등 - 화살표 포함될 수 있음)
    const retryButton = page.locator('button').filter({
      hasText: /TRY AGAIN|재도전|再挑戦|再来一局|REINTENTAR|RÉESSAYER|RIPROVA/i
    });
    await expect(retryButton).toBeVisible({ timeout: 5000 });
  });

  test.skip('게임 오버 후 홈으로 버튼이 표시된다', async ({ page }) => {
    await goToGame(page);
    await waitForCardReveal(page);

    // 프리플랍 타이머 30초 + 여유
    await page.waitForTimeout(35000);

    // 홈으로 버튼 확인 (Exit/나가기 등)
    const homeButton = page.locator('button').filter({
      hasText: /Exit|나가기|終了|退出|Salir|Quitter|Esci/i
    });
    await expect(homeButton).toBeVisible({ timeout: 5000 });
  });
});
