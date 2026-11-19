import { test, expect } from '@playwright/test';

// JobSearchTest.java, the way Playwright prefers it: by role, by label, by text.
// No id and no class name: the markup may change, the test stays.
// Line by line, with the Selenide lines as comments: labs/13-migration/tests/job-search.spec.ts
// https://playwright.dev/docs/locators#quick-guide

test('the search opens the job and the form', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByLabel('Search jobs').fill('Reliability');
    await page.getByRole('button', { name: 'Search' }).click();

    const card = page.getByRole('article', { name: 'Site Reliability Engineer' });
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(card).toContainText('München');
    await expect(card).toContainText('Remote possible');

    await card.getByRole('link', { name: 'Site Reliability Engineer' }).click();
    await expect(page).toHaveURL(/\/jobs\/site-reliability-engineer/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Site Reliability Engineer');
    await expect(page.getByText('68.000–86.000 € per year')).toBeVisible();

    await page.getByRole('link', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Submit application' }).click();

    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Please upload your CV.')).toBeVisible();
});
