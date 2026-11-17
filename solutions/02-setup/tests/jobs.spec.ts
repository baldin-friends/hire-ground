import { expect, test } from '@playwright/test';

test('career page lists all open positions', async ({ page }) => {
    // arrange: open the page a candidate opens
    await page.goto('/jobs');

    // assert: what the candidate sees, not how it is built
    await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('12 jobs');
});
