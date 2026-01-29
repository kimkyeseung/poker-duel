import { test, expect } from '@playwright/test';
import { dismissClickToStart } from './helpers';

test.describe('Click to Start 오버레이', () => {
  test('첫 방문 시 Click to Start 오버레이가 표시된다', async ({ page }) => {
    // 세션 스토리지 초기화
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // 오버레이 확인 (fixed position z-9999)
    const overlay = page.locator('.fixed.z-\\[9999\\]');
    await expect(overlay).toBeVisible();

    // Click anywhere to start 텍스트 확인
    await expect(page.getByText('Click anywhere to start')).toBeVisible();

    // Sound will be enabled 텍스트 확인
    await expect(page.getByText('Sound will be enabled')).toBeVisible();
  });

  test('오버레이 클릭 시 사라진다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // 오버레이가 보이는지 확인
    const overlay = page.locator('.fixed.z-\\[9999\\]');
    await expect(overlay).toBeVisible();

    // 오버레이 클릭
    await overlay.click();

    // 오버레이가 사라졌는지 확인
    await expect(overlay).not.toBeVisible();
  });

  test('클릭 후 세션 스토리지에 started 키가 저장된다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // 오버레이 클릭
    const overlay = page.locator('.fixed.z-\\[9999\\]');
    await overlay.click();

    // 세션 스토리지 확인
    const started = await page.evaluate(() => {
      return sessionStorage.getItem('holdamnit-started');
    });
    expect(started).toBe('true');
  });

  test('세션 내 재방문 시 오버레이가 표시되지 않는다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // 첫 방문 - 오버레이 클릭
    const overlay = page.locator('.fixed.z-\\[9999\\]');
    await overlay.click();

    // 다른 페이지로 이동
    await page.goto('/settings');
    await expect(page).toHaveURL('/settings');

    // 홈으로 돌아오기
    await page.goto('/');

    // 오버레이가 표시되지 않아야 함
    await expect(overlay).not.toBeVisible({ timeout: 2000 });
  });

  test('새 세션에서는 오버레이가 다시 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // 첫 방문 - 오버레이 클릭
    const overlay = page.locator('.fixed.z-\\[9999\\]');
    await overlay.click();

    // 세션 스토리지 초기화 (새 세션 시뮬레이션)
    await page.evaluate(() => sessionStorage.clear());

    // 페이지 새로고침
    await page.reload();

    // 오버레이가 다시 표시되어야 함
    await expect(overlay).toBeVisible();
  });
});

test.describe('오디오 토글', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissClickToStart(page);
  });

  test('오디오 토글 버튼이 헤더에 존재한다', async ({ page }) => {
    // AudioToggle 버튼 찾기 (스피커 아이콘)
    const audioToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await expect(audioToggle).toBeVisible();
  });

  test('오디오 토글 클릭 시 음소거 상태가 변경된다', async ({ page }) => {
    // 음소거 버튼 클릭
    const audioToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await audioToggle.click();

    // 로컬 스토리지에서 설정 확인
    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('holdamnit-settings');
      return stored ? JSON.parse(stored) : null;
    });

    // soundEnabled가 false인지 확인
    expect(settings?.soundEnabled).toBe(false);
  });

  test('음소거 토글 후 다시 클릭하면 사운드가 활성화된다', async ({ page }) => {
    const audioToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();

    // 음소거
    await audioToggle.click();

    // 다시 클릭하여 활성화
    await audioToggle.click();

    // 로컬 스토리지에서 설정 확인
    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('holdamnit-settings');
      return stored ? JSON.parse(stored) : null;
    });

    // soundEnabled가 true인지 확인
    expect(settings?.soundEnabled).toBe(true);
  });
});

test.describe('오디오 시스템 통합', () => {
  test('Click to Start 후 홈 페이지가 정상 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // 오버레이 클릭
    const overlay = page.locator('.fixed.z-\\[9999\\]');
    await overlay.click();

    // 홈 페이지 요소 확인 - main 내부의 QUICK PLAY 버튼
    await expect(page.getByRole('main').getByText('QUICK PLAY')).toBeVisible();
  });

  test('Click to Start 후 게임 페이지로 이동 가능하다', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();

    // 오버레이 클릭
    const overlay = page.locator('.fixed.z-\\[9999\\]');
    await overlay.click();

    // 게임 시작
    await page.getByRole('main').getByText('QUICK PLAY').click();

    // 게임 페이지 확인
    await expect(page).toHaveURL(/\/game/);
  });

  test('설정에서 사운드 비활성화 후 새로고침해도 유지된다', async ({ page }) => {
    await page.goto('/');
    await dismissClickToStart(page);

    // 음소거 버튼 클릭
    const audioToggle = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await audioToggle.click();

    // 페이지 새로고침
    await page.reload();

    // 설정 확인
    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('holdamnit-settings');
      return stored ? JSON.parse(stored) : null;
    });

    // 음소거 상태 유지 확인
    expect(settings?.soundEnabled).toBe(false);
  });
});
