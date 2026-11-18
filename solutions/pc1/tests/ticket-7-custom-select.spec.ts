import { expect, test } from '@playwright/test';

// Ticket 7: the location filter is an ARIA combobox, not a <select>.
// Fix in the test: open it and click the option, as a user does.
test('ticket 7: the location filter shows the four jobs in Dresden', async ({ page }) => {
    await page.goto('/jobs?bugs=custom-select');

    await page.getByRole('combobox', { name: 'Location' }).click();
    await page.getByRole('option', { name: 'Dresden' }).click();

    await expect(page.getByRole('status')).toHaveText('4 jobs');
    await expect(page.getByRole('article')).toHaveCount(4);
});
