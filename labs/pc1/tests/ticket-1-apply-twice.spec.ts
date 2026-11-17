import { expect, test } from '@playwright/test';

// Ticket 1: the Apply link exists twice on the job page.
// Symptom: strict mode violation, the locator resolves to 2 elements.
// Rule: no CSS, no XPath.
test('ticket 1: the job page leads to the application form', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer?bugs=dup-apply');

    await page.getByRole('link', { name: 'Apply' }).click();

    await expect(page.getByRole('heading', { name: 'Apply for Senior QA Engineer' })).toBeVisible();
});
