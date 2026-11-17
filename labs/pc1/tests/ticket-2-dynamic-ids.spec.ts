import { expect, test } from '@playwright/test';

// Ticket 2: the selectors were copied from DevTools yesterday. Today the ids are different.
// Symptom: the locator finds no element.
// Rule: no CSS, no XPath. An id selector is CSS.
test('ticket 2: a candidate opens a job from the list and starts the application', async ({ page }) => {
    await page.goto('/jobs?bugs=dynamic-ids');

    await expect(page.locator('#job-1-4f9a')).toContainText('62.000–78.000 € per year');
    await page.locator('#job-title-1-4f9a > a').click();

    await page.locator('#apply-button-x2k7').click();
    await expect(page.locator('#firstName')).toBeVisible();
});
