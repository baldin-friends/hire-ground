import { expect, test } from '@playwright/test';
import { recruiter } from './data';

test.beforeEach(async ({ page }) => {
    // sign in through the API: the session cookie lands in the browser context
    await page.request.post('/api/auth/login', { data: recruiter });
});

test('a recruiter moves a candidate from Interview to Offer', async ({ page }) => {
    await page.goto('/recruiter');
    await page.getByRole('link', { name: 'Lena Schmidt' }).click();

    const stage = page.getByLabel('Stage');
    await expect(stage).toHaveValue('interview');
    await stage.selectOption('offer');
    await expect(page.getByRole('status')).toHaveText('Stage changed to Offer.');
});
