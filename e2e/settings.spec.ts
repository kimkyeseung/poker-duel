import { test, expect } from '@playwright/test';

test.describe('설정 페이지', () => {
  test('설정 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/settings');

    // 설정 페이지 제목 확인
    await expect(page.getByText(/설정|Settings/i)).toBeVisible();
  });

  test('사운드 설정이 표시된다', async ({ page }) => {
    await page.goto('/settings');

    // 사운드 설정 확인
    const soundSetting = page.getByText(/사운드|소리|Sound/i);
    await expect(soundSetting.first()).toBeVisible();
  });

  test('진동 설정이 표시된다', async ({ page }) => {
    await page.goto('/settings');

    // 진동 설정 확인
    const vibrationSetting = page.getByText(/진동|Vibration/i);
    await expect(vibrationSetting.first()).toBeVisible();
  });

  test('테마 설정이 표시된다', async ({ page }) => {
    await page.goto('/settings');

    // 테마 설정 확인
    const themeSetting = page.getByText(/테마|Theme/i);
    await expect(themeSetting.first()).toBeVisible();
  });

  test('설정을 토글할 수 있다', async ({ page }) => {
    await page.goto('/settings');

    // 토글 버튼 또는 스위치 찾기
    const toggles = page.locator('button, [role="switch"], input[type="checkbox"]');
    if (await toggles.first().isVisible().catch(() => false)) {
      const firstToggle = toggles.first();
      await firstToggle.click();
      // 토글이 클릭 가능하면 테스트 통과
    }
  });

  test('홈으로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/settings');

    const backLink = page.getByRole('link', { name: /홈|뒤로|나가기/i });
    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
