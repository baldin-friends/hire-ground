import { test, expect } from '@playwright/test';

// Warm-up for the tour through UI mode:  npx playwright test --ui
// Three tests on the career page. In labs/05-tools the third one fails on purpose; here it is repaired.

test.use({ storageState: { cookies: [], origins: [] } }); // a visitor: nobody is signed in

test('the search finds the job for a researcher', async ({ page }) => {
    await page.goto('/jobs');
    await page.getByLabel('Search jobs').fill('researcher');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('status')).toHaveText('1 job');
    await expect(page.getByRole('article')).toContainText('UX Researcher');
});

test('a job page shows the salary and an Apply link', async ({ page }) => {
    await page.goto('/jobs');
    await page.getByRole('link', { name: 'Frontend Developer (React)' }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Frontend Developer (React)');
    await expect(page.getByText('60.000–76.000 € per year')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Apply' })).toBeVisible();
});

test('the job page has the job title as its heading', async ({ page }) => {
    await page.goto('/jobs/test-automation-engineer');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test Automation Engineer');
});
