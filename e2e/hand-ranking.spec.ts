import { test, expect } from '@playwright/test';

test.describe('핸드 랭킹 표시', () => {
  test.beforeEach(async ({ page }) => {
    // Click to Start 처리
    await page.goto('/');

    // Click to Start 오버레이가 있으면 클릭
    const overlay = page.getByText(/Click anywhere to start/i);
    if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.click('body');
      await page.waitForTimeout(500);
    }
  });

  test('프리플랍 결과에서 핸드 이름이 올바르게 표시된다', async ({ page }) => {
    // 게임 시작
    const startButton = page.getByRole('link', { name: /start game/i });
    await startButton.click();
    await expect(page).toHaveURL(/\/game/);

    // 카드 공개 애니메이션 대기
    await page.waitForTimeout(2500);

    // 선택 버튼이 표시될 때까지 대기
    const choiceButtons = page.locator('main button');
    await expect(choiceButtons.first()).toBeVisible({ timeout: 5000 });

    // 아무 버튼이나 클릭 (ME 또는 DEALER)
    await choiceButtons.first().click();

    // 결과 다이얼로그 표시 대기
    await page.waitForTimeout(1000);

    // 결과 화면에서 핸드 이름 확인 (CORRECT! 또는 WRONG!)
    const resultHeader = page.locator('text=/CORRECT!|WRONG!/');
    await expect(resultHeader).toBeVisible({ timeout: 5000 });

    // 핸드 이름이 표시되는지 확인 (YOU, DEALER 레이블)
    await expect(page.getByText('YOU')).toBeVisible();
    await expect(page.getByText('DEALER')).toBeVisible();

    // 핸드 순위가 #1 ~ #169 범위로 표시되는지 확인
    const rankPattern = /#\d{1,3}/;
    const ranks = page.locator(`text=${rankPattern}`);

    // 적어도 2개의 순위(플레이어, 딜러)가 표시되어야 함
    const rankCount = await ranks.count();
    expect(rankCount).toBeGreaterThanOrEqual(2);
  });

  test('핸드 순위가 169로만 표시되지 않는다 (버그 재발 방지)', async ({ page }) => {
    // 여러 번 게임을 시작해서 항상 169위가 나오지 않는지 확인
    for (let i = 0; i < 3; i++) {
      await page.goto('/');

      // Click to Start 처리
      const overlay = page.getByText(/Click anywhere to start/i);
      if (await overlay.isVisible({ timeout: 500 }).catch(() => false)) {
        await page.click('body');
        await page.waitForTimeout(300);
      }

      // 게임 시작
      const startButton = page.getByRole('link', { name: /start game/i });
      if (await startButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await startButton.click();
      }

      // 카드 공개 대기
      await page.waitForTimeout(2500);

      // 선택 버튼 클릭
      const choiceButtons = page.locator('main button');
      if (await choiceButtons.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await choiceButtons.first().click();
        await page.waitForTimeout(1000);

        // 결과 화면에서 순위 확인
        const playerRank = page.locator('[class*="text-[#00d4ff]"]').filter({ hasText: '#' });
        const dealerRank = page.locator('[class*="text-[#ff4d94]"]').filter({ hasText: '#' });

        // 두 순위가 모두 169인 경우는 거의 없어야 함 (72o vs 72o)
        // 적어도 하나는 169가 아니어야 함
        const playerRankText = await playerRank.textContent().catch(() => '');
        const dealerRankText = await dealerRank.textContent().catch(() => '');

        // 둘 다 169가 아니거나, 적어도 하나는 다른 숫자여야 함
        const bothAre169 = playerRankText?.includes('#169') && dealerRankText?.includes('#169');

        // 둘 다 169인 경우는 매우 드물어야 함 (확률적으로 한 번 정도는 허용)
        if (i === 2 && bothAre169) {
          // 마지막 시도에서도 둘 다 169면 실패
          expect(bothAre169).toBe(false);
        }
      }
    }
  });

  test('10이 포함된 핸드가 T로 변환되어 올바른 순위를 가진다', async ({ page }) => {
    // DevAnswerOverlay가 개발 환경에서 표시되는지 확인
    // (개발 환경에서만 동작)
    await page.goto('/');

    const overlay = page.getByText(/Click anywhere to start/i);
    if (await overlay.isVisible({ timeout: 500 }).catch(() => false)) {
      await page.click('body');
      await page.waitForTimeout(300);
    }

    const startButton = page.getByRole('link', { name: /start game/i });
    await startButton.click();

    // 카드 공개 대기
    await page.waitForTimeout(2500);

    // 개발 환경에서 DEV 오버레이 확인
    const devOverlay = page.locator('text=DEV');

    if (await devOverlay.isVisible({ timeout: 1000 }).catch(() => false)) {
      // DEV 오버레이가 있으면 핸드 정보 확인
      const overlayContent = await page.locator('.fixed.bottom-4.right-4').textContent();

      // 10이 포함된 핸드가 있다면 T로 변환되었는지 확인
      // 예: ATs, KTo, TT 등
      if (overlayContent) {
        // "A10s" 같은 잘못된 표기가 없어야 함
        expect(overlayContent).not.toMatch(/A10|K10|Q10|J10|109|108|107|106|105|104|103|102/);

        // T가 포함된 핸드는 올바른 형식이어야 함 (ATs, KTo, TT 등)
        const hasT = overlayContent.match(/[AKQJ]T[so]|T[9876543]|TT/);
        if (hasT) {
          // T가 있으면 올바른 순위가 표시되어야 함
          expect(overlayContent).not.toMatch(/#169/);
        }
      }
    }
  });
});
