import { expect, test } from '@playwright/test';

// Ticket 3: the job title is on the screen, and the XPath does not find it.
// Symptom: the heading locator finds no element.
// Rule: no CSS, no XPath.
test('ticket 3: the job page shows title, team and location', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer?bugs=nbsp-title');

    await expect(page.locator('//h1[text()="Senior QA Engineer"]')).toBeVisible();
    await expect(page.locator('//p[contains(text(), "Dresden")]')).toHaveText('QA · Dresden · Remote possible');
});
