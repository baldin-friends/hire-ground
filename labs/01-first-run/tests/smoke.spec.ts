import { expect, test } from '@playwright/test';

// Two finished tests. You run them first (steps 1 and 2) and write your own afterwards (steps 3 and 4).

test('the career page has a title', async ({ page }) => {
    await page.goto('http://localhost:3000/jobs');

    await expect(page).toHaveTitle('Hire Ground · Careers');
});

test('the career page lists twelve jobs', async ({ page }) => {
    await page.goto('http://localhost:3000/jobs');

    await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('12 jobs');
});
