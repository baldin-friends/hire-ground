import { expect, test } from '@playwright/test';

// Steps 3 and 4 · your own tests, written from an empty file.
test.describe('the job page', () => {
    // step 4: what both tests need first lives in one place
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/jobs/senior-qa-engineer');
    });

    // step 3: open the page, then check what a candidate sees
    test('shows the job title', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Senior QA Engineer' })).toBeVisible();
    });

    // step 4: a second test
    test('has an Apply link', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Apply' })).toBeVisible();
    });
});
