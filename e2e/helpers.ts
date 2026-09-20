import { expect, Page } from '@playwright/test';

/**
 * Click to Start 오버레이를 처리합니다.
 * 오버레이가 표시되면 클릭하여 닫습니다.
 */
export async function dismissClickToStart(page: Page) {
  const overlay = page.locator('[data-testid="click-to-start"]');

  // isVisible()은 대기하지 않고 즉시 판정한다. 오버레이는 하이드레이션 이후
  // useEffect에서 나타나므로, 즉시 확인하면 아직 DOM에 없어 "없음"으로 판정되고
  // 해제를 건너뛴다. 그 직후 나타난 오버레이(z-[9999] fixed inset-0)가 이후의
  // 모든 클릭을 가로채 테스트가 30초 타임아웃으로 줄줄이 실패한다.
  // 따라서 나타날 때까지 명시적으로 기다린다.
  try {
    await overlay.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // 같은 세션에서 이미 시작했다면 오버레이가 아예 나타나지 않는다
    return;
  }

  await overlay.click();
  // 오버레이가 실제로 사라질 때까지 기다린다. 여기서 실패하면 삼켜서는 안 된다.
  await expect(overlay).toBeHidden({ timeout: 10000 });
}

/**
 * 홈 페이지로 이동하고 Click to Start 오버레이를 처리합니다.
 */
export async function goToHome(page: Page) {
  await page.goto('/');
  // 페이지 로드 완료 대기
  await page.waitForLoadState('domcontentloaded');
  await dismissClickToStart(page);
}

/**
 * 게임 페이지로 이동합니다.
 * 다양한 언어의 Quick Play 버튼을 처리합니다.
 */
export async function goToGame(page: Page) {
  await goToHome(page);
  // 다양한 언어의 Quick Play 버튼 텍스트
  const quickPlayButton = page.locator('button').filter({
    hasText: /QUICK PLAY|빠른 시작|クイックプレイ|快速开始|JUEGO RÁPIDO|JEU RAPIDE|GIOCO RAPIDO/i
  });
  await quickPlayButton.click();
  await expect(page).toHaveURL(/\/game/);
}

/**
 * 연습 모드 페이지로 이동합니다.
 */
export async function goToPractice(page: Page) {
  await goToHome(page);
  // main 영역 내의 버튼에서 찾기
  const practiceButton = page.locator('main button').filter({
    hasText: /PRACTICE|연습|練習|练习|PRÁCTICA|ENTRAÎNEMENT|PRATICA/i
  });
  await practiceButton.click();
  await expect(page).toHaveURL('/practice');
}

/**
 * 일일 챌린지 페이지로 이동합니다.
 */
export async function goToDaily(page: Page) {
  await goToHome(page);
  // main 영역 내의 버튼에서 찾기
  const dailyButton = page.locator('main button').filter({
    hasText: /DAILY|일일|デイリー|每日|DIARIO|QUOTIDIEN|GIORNALIER/i
  });
  await dailyButton.click();
  await expect(page).toHaveURL('/daily');
}

/**
 * 현재 뷰포트에서 보이는 정답 선택 버튼들.
 *
 * game/page.tsx는 AnswerInput을 반응형으로 3벌 렌더링한다
 * (모바일 / `hidden sm:block lg:hidden` 태블릿 / 데스크톱). 따라서 이 셀렉터는
 * 여러 사본에 매칭되고 그중 실제로 보이는 것은 한 벌뿐이다. .first()는 DOM
 * 순서상 첫 번째를 잡으므로 데스크톱 뷰포트에서는 숨겨진 태블릿용 사본을
 * 집어와 toBeVisible()이 "hidden"으로 실패한다.
 * 그래서 보이는 것만 남긴다.
 */
export function answerChoiceButtons(page: Page) {
  return page
    .locator('[role="group"] button, [role="radio"], .game-card button')
    .filter({ visible: true });
}

/**
 * 게임에서 카드 공개 애니메이션이 완료될 때까지 대기합니다.
 */
export async function waitForCardReveal(page: Page) {
  await page.waitForTimeout(2500);
}

/**
 * 정답 선택 버튼 중 하나를 클릭합니다.
 */
export async function clickAnswerButton(page: Page, buttonIndex: number = 0) {
  // 이전 구현은 'main button'까지 포함해 헤더·나가기 버튼 등 정답과 무관한
  // 버튼이 DOM 순서상 앞에 오면 nth(0)이 그것을 집었다. 게다가 isVisible()은
  // 대기하지 않고 즉시 판정하므로, 아직 보이지 않으면 클릭을 조용히 건너뛰고
  // 테스트는 정답이 제출된 줄 알고 진행하다 엉뚱한 곳에서 실패했다.
  const button = answerChoiceButtons(page).nth(buttonIndex);
  await button.click({ timeout: 10000 });
}
