import { expect, test } from '@playwright/test';

// Ticket 3: the title contains non-breaking spaces. XPath text()= compares raw characters.
// Fix in the test: user-facing locators normalise whitespace.
test('ticket 3: the job page shows title, team and location', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer?bugs=nbsp-title');

    await expect(page.getByRole('heading', { name: 'Senior QA Engineer' })).toBeVisible();
    await expect(page.getByText('QA · Dresden · Remote possible')).toBeVisible();
});
