import { expect, test } from '@playwright/test';

test('career page lists all open positions', async ({ page }) => {
    await page.goto('/jobs');

    await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('12 jobs');
});

// Find the QA job in Dresden.
test('candidate finds the senior QA job in Dresden', async ({ page }) => {
    await page.goto('/jobs');

    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('QA');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('combobox', { name: 'Location' }).selectOption('Dresden');
    await page.getByRole('checkbox', { name: 'Remote only' }).check();
    await expect(page.getByRole('status')).toHaveText('1 job');

    await page.getByRole('link', { name: 'Senior QA Engineer' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Senior QA Engineer');
    await expect(page.getByText('62.000–78.000 € per year')).toBeVisible();
});
