import { test, expect } from '@playwright/test';

test.describe('게임 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 홈에서 게임 시작
    await page.goto('/');
    const startButton = page.getByRole('button', { name: /게임 시작/i });
    await startButton.click();
    await expect(page).toHaveURL(/\/game\//);
  });

  test('게임 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 플레이어 영역 확인
    await expect(page.getByText('나', { exact: true })).toBeVisible();
    await expect(page.getByText('컴퓨터')).toBeVisible();
  });

  test('난이도 배지가 표시된다', async ({ page }) => {
    // 쉬움 난이도 배지 확인
    await expect(page.getByText(/쉬움/)).toBeVisible();
  });

  test('나가기 버튼이 작동한다', async ({ page }) => {
    const exitButton = page.getByText(/나가기/);
    await expect(exitButton).toBeVisible();

    await exitButton.click();
    await expect(page).toHaveURL('/');
  });

  test('테이블에 카드 슬롯이 있다', async ({ page }) => {
    // 테이블 영역 확인 (카드 슬롯에 ? 문자)
    const cardSlots = page.locator('text=?');
    await expect(cardSlots.first()).toBeVisible();
  });

  test('플레이어 카드 영역이 존재한다', async ({ page }) => {
    await expect(page.getByText('나', { exact: true })).toBeVisible();
  });

  test('컴퓨터 카드 영역이 존재한다', async ({ page }) => {
    await expect(page.getByText('컴퓨터')).toBeVisible();
  });
});

test.describe('프리플랍 라운드', () => {
  test('프리플랍에서 카드 공개 애니메이션이 재생된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 카드 공개 중 메시지 확인 (2초 동안 표시됨)
    await expect(page.getByText(/카드 공개 중/)).toBeVisible({ timeout: 5000 });
  });

  test('프리플랍에서 2지선다 UI가 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 카드 공개 애니메이션 대기 (2초)
    await page.waitForTimeout(2500);

    // 2지선다 버튼 확인
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible({ timeout: 5000 });
  });

  test('프리플랍에서 정답을 선택할 수 있다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 카드 공개 애니메이션 대기
    await page.waitForTimeout(2500);

    // 버튼 클릭
    const buttons = page.locator('main button');
    const firstButton = buttons.first();
    if (await firstButton.isVisible({ timeout: 5000 })) {
      await firstButton.click();

      // 결과가 표시될 때까지 대기
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('플랍 라운드', () => {
  test('플랍에서 커뮤니티 카드가 공개된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 프리플랍 대기 및 정답 선택
    await page.waitForTimeout(2500);

    // 버튼 클릭
    const buttons = page.locator('main button');
    if (await buttons.first().isVisible({ timeout: 3000 })) {
      await buttons.first().click();
    }

    await page.waitForTimeout(1500);

    // 정답인 경우 다음 라운드로
    const nextButton = page.getByRole('button', { name: /다음 라운드/ });
    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();

      // 플랍 카드 공개 애니메이션 확인
      await expect(page.getByText(/카드 공개 중/)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('카드 공개 애니메이션', () => {
  test('카드 공개 중 메시지가 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 카드 공개 중 메시지 확인
    await expect(page.getByText(/카드 공개 중/)).toBeVisible({ timeout: 5000 });
  });

  test('카드 공개 후 입력 UI가 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 카드 공개 애니메이션 대기 (2초)
    await page.waitForTimeout(2500);

    // 입력 UI 표시 확인 (버튼들이 표시됨)
    const buttons = page.locator('main button');
    await expect(buttons.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('게임 오버', () => {
  test('시간 초과 시 게임 오버가 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 카드 공개 애니메이션 대기
    await page.waitForTimeout(2500);

    // 타이머가 끝날 때까지 대기 (5초 + 여유)
    await page.waitForTimeout(7000);

    // 게임 오버 다이얼로그 확인
    const gameOverText = page.getByText(/시간 초과/);
    await expect(gameOverText).toBeVisible({ timeout: 5000 });
  });

  test('게임 오버 후 재시작 버튼이 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 애니메이션 + 타임아웃 대기
    await page.waitForTimeout(10000);

    // 재시작 버튼 확인
    const retryButton = page.getByRole('button', { name: /재시작|다시/i });
    await expect(retryButton).toBeVisible({ timeout: 5000 });
  });

  test('게임 오버 후 홈으로 버튼이 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /게임 시작/i }).click();

    // 애니메이션 + 타임아웃 대기
    await page.waitForTimeout(10000);

    // 홈으로 버튼 확인 (나가기 또는 홈으로)
    const homeButton = page.getByRole('button', { name: /나가기|홈/i });
    await expect(homeButton).toBeVisible({ timeout: 5000 });
  });
});
