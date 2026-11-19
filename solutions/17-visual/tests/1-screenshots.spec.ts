import { test, expect } from '@playwright/test';

// Visual comparison: the test takes a screenshot and compares it with a baseline image, pixel by pixel.
//   npx playwright test 1-screenshots --update-snapshots     writes the baselines into tests/__screenshots__/
//   npx playwright test 1-screenshots                        compares with them
// https://playwright.dev/docs/test-snapshots

test('the job page looks like its baseline', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer');

    // The line "Apply by …" shows another date tomorrow. A mask paints a box over the element in both images.
    await expect(page).toHaveScreenshot('job-page.png', { mask: [page.getByText(/^Apply by/)] });
});
