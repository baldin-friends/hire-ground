import { expect, test } from '@playwright/test';

// Ticket 1: the Apply link exists twice on the job page.
// Fix in the test: say which of the two links is meant.
test('ticket 1: the job page leads to the application form', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer?bugs=dup-apply');

    // The link under the job facts sits in a paragraph, the sticky bar is not one.
    // getByRole('main') does not help: it contains both links.
    await page.getByRole('paragraph').getByRole('link', { name: 'Apply' }).click();

    await expect(page.getByRole('heading', { name: 'Apply for Senior QA Engineer' })).toBeVisible();
});
