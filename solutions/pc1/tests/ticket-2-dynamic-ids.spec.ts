import { expect, test } from '@playwright/test';

// Ticket 2: the ids change on every page load.
// Fix in the test: roles, names and labels. No id is left.
test('ticket 2: a candidate opens a job from the list and starts the application', async ({ page }) => {
    await page.goto('/jobs?bugs=dynamic-ids');

    const card = page.getByRole('article', { name: 'Senior QA Engineer' });
    await expect(card).toContainText('62.000–78.000 € per year');
    await card.getByRole('link', { name: 'Senior QA Engineer' }).click();

    await page.getByRole('link', { name: 'Apply' }).click();
    await expect(page.getByLabel('First name')).toBeVisible();
});
