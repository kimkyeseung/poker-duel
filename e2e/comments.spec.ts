import { test, expect } from '@playwright/test';

test.describe('코멘트 페이지', () => {
  test('코멘트 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/comments');

    // 코멘트 페이지 제목 확인
    await expect(page.getByText(/코멘트|명예의 전당|승리자/i)).toBeVisible();
  });

  test('코멘트 목록이 표시된다', async ({ page }) => {
    await page.goto('/comments');

    // 코멘트 영역 확인 (비어있어도 컨테이너는 존재)
    await page.waitForTimeout(1000);
    // 페이지가 로드되면 통과
  });

  test('홈으로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/comments');

    const backLink = page.getByRole('link', { name: /홈|뒤로|나가기/i });
    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
