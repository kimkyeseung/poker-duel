import { test, expect } from '@playwright/test';
import { dismissClickToStart } from './helpers';

test.describe('코멘트 페이지', () => {
  test('코멘트 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/comments');
    await dismissClickToStart(page);

    // 코멘트 페이지 제목 확인 - header의 HALL OF FAME
    await expect(page.locator('header, h1, main').getByText(/HALL OF FAME|GOD MODE|명예의 전당|승리자/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('코멘트 목록이 표시된다', async ({ page }) => {
    await page.goto('/comments');
    await dismissClickToStart(page);

    // h2에서 Victory Messages 확인
    await expect(page.locator('h2, main').getByText(/Victory Messages|메시지|Messages/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('홈으로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/comments');
    await dismissClickToStart(page);

    // Back 버튼 찾기
    const backButton = page.locator('button, a').filter({
      hasText: /Back|뒤로|돌아가기|戻る|返回|Volver|Retour|Indietro/i
    });
    await expect(backButton).toBeVisible({ timeout: 5000 });
    await backButton.click();
    await expect(page).toHaveURL('/');
  });
});
