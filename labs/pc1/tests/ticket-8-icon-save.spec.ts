import { expect, test } from '@playwright/test';

// Ticket 8: "Save job" is a bookmark icon without a name.
// Symptom: the locator finds no button called "Save job".
// Rule: no CSS, no XPath. And this locator stays as it is.
test('ticket 8: a candidate saves a job from the list', async ({ page }) => {
    await page.goto('/jobs?bugs=icon-save');
    const card = page.getByRole('article', { name: 'Senior QA Engineer' });
    const save = card.getByRole('button', { name: 'Save job' });

    await expect(save).toHaveAttribute('aria-pressed', 'false');
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
});
