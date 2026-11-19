import { test, expect } from '@playwright/test';

// What a regression looks like. This test is red on purpose.
// Hire Ground has switches for the training: ?bugs=dup-apply adds a bar with a second Apply link at the bottom
// of the job page. The test compares that page with the baseline of 1-screenshots.spec.ts.
//   npx playwright test 2-regression      red
//   npx playwright show-report            open the test: Diff, Actual, Expected, Side by side, Slider

test('the job page with a new bar at the bottom', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer?bugs=dup-apply');

    await expect(page).toHaveScreenshot('job-page.png', { mask: [page.getByText(/^Apply by/)] });
});
