import { expect, test } from '@playwright/test';

// Step 9 · the flaky test, fixed:
// user-facing locators, an assertion that waits, no sleep.
test('search for QA jobs', async ({ page }) => {
    await page.goto('/jobs?bugs=slow-search');
    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('QA');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('article')).toHaveCount(3);
});
