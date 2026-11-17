import { expect, test } from '@playwright/test';

// Ticket 5: a cookie banner covers the page on about 30 % of page loads.
// Symptom: the test accepts the banner as a fixed step, and waits for it when there is none.
// Rule: no CSS, no XPath.
const jobs = [
    'Senior QA Engineer',
    'QA Engineer (Working Student)',
    'Test Automation Engineer',
    'Frontend Developer (React)',
    'Backend Developer (Java)',
    'Site Reliability Engineer',
];

test('ticket 5: every QA and Engineering job leads to its application form and back', async ({ page }) => {
    for (const title of jobs) {
        await page.goto('/jobs?bugs=cookie-banner');
        await page.getByRole('button', { name: 'Accept all' }).click(); // the cookie banner

        await page.getByRole('link', { name: title }).click();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

        await page.getByRole('link', { name: 'Apply' }).click();
        await expect(page.getByRole('heading', { name: `Apply for ${title}` })).toBeVisible();

        await page.getByRole('link', { name: title }).click();
        await page.getByRole('link', { name: 'All jobs' }).click();
        await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    }
});
