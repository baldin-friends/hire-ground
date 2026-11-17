import { expect, test } from '@playwright/test';

test('career page lists all open positions', async ({ page }) => {
    await page.goto('/jobs');

    await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('12 jobs');
});

// Find the QA job in Dresden.
// User-facing locators only: getByRole, getByLabel, getByText. No CSS, no XPath.
test('candidate finds the senior QA job in Dresden', async ({ page }) => {
    await page.goto('/jobs');

    // TODO 1: type "QA" into the search box and press the Search button
    // TODO 2: choose the location "Dresden" and tick "Remote only"
    // TODO 3: the status line says "1 job"

    // TODO 4: open the posting "Senior QA Engineer"
    // TODO 5: the main heading says "Senior QA Engineer",
    //         and the salary "62.000–78.000 € per year" is visible (copy the text: the dash is an en dash)

    throw new Error('TODO: write the steps above, then delete this line');
});
