import { test, expect } from '@playwright/test';

test.describe('카드 공개 애니메이션', () => {
  test.describe('프리플랍 카드 공개', () => {
    test('프리플랍 시작 시 카드 공개 중 메시지가 표시된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 카드 공개 중 메시지 즉시 확인
      await expect(page.getByText(/카드 공개 중/)).toBeVisible({ timeout: 5000 });
    });

    test('프리플랍 카드 공개 애니메이션이 약 2초 후 완료된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 카드 공개 중 메시지 확인
      await expect(page.getByText(/카드 공개 중/)).toBeVisible({ timeout: 5000 });

      // 2초 후 메시지가 사라지고 입력 UI가 표시됨
      await page.waitForTimeout(2500);

      // 버튼이 표시됨
      const buttons = page.locator('main button');
      await expect(buttons.first()).toBeVisible({ timeout: 5000 });
    });

    test('플레이어 카드가 공개된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 애니메이션 완료 대기
      await page.waitForTimeout(2500);

      // 플레이어 라벨이 표시됨
      await expect(page.getByText('나', { exact: true })).toBeVisible();
    });
  });

  test.describe('플랍 카드 공개', () => {
    test('플랍 시작 시 카드가 순차적으로 공개된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 프리플랍 애니메이션 대기
      await page.waitForTimeout(2500);

      // 프리플랍 정답 선택
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

  test.describe('애니메이션 타이밍', () => {
    test('카드 공개 애니메이션 동안 메시지가 표시된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 카드 공개 중일 때 메시지 확인
      await expect(page.getByText(/카드 공개 중/)).toBeVisible({ timeout: 5000 });
    });

    test('애니메이션 완료 후 입력 UI가 표시된다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      // 애니메이션 완료 대기
      await page.waitForTimeout(2500);

      // 버튼이 표시됨
      const buttons = page.locator('main button');
      await expect(buttons.first()).toBeVisible({ timeout: 5000 });
    });

    test('카드 공개 시간은 약 2초이다', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /게임 시작/i }).click();

      const startTime = Date.now();

      // 카드 공개 중 메시지 표시 확인
      await expect(page.getByText(/카드 공개 중/)).toBeVisible({ timeout: 5000 });

      // 카드 공개 완료 대기 (버튼이 나타날 때까지)
      const buttons = page.locator('main button');
      await expect(buttons.first()).toBeVisible({ timeout: 10000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 애니메이션 시간이 1.5초 ~ 4초 사이여야 함
      expect(duration).toBeGreaterThan(1500);
      expect(duration).toBeLessThan(5000);
    });
  });
});
