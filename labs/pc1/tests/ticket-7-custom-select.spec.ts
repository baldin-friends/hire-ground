import { expect, test } from '@playwright/test';

// Ticket 7: the location filter looks like a select and is not one.
// Symptom: selectOption fails, "Element is not a <select> element".
// Rule: no CSS, no XPath.
test('ticket 7: the location filter shows the four jobs in Dresden', async ({ page }) => {
    await page.goto('/jobs?bugs=custom-select');

    await page.getByRole('combobox', { name: 'Location' }).selectOption('Dresden');

    await expect(page.getByRole('status')).toHaveText('4 jobs');
    await expect(page.getByRole('article')).toHaveCount(4);
});
