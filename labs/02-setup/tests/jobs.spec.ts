import { expect, test } from '@playwright/test';

test('career page lists all open positions', async ({ page }) => {
    // TODO 3: once the config has a baseURL, shorten this to '/jobs'
    await page.goto('http://localhost:3000/jobs');

    await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('12 jobs');
});
