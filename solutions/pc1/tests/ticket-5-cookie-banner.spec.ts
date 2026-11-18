import { expect, test } from '@playwright/test';

// Ticket 5: a cookie banner covers the page on about 30 % of page loads, up to 800 ms late.
// Fix in the test: a locator handler. It runs when the banner is in the way, and only then.
const jobs = [
    'Senior QA Engineer',
    'QA Engineer (Working Student)',
    'Test Automation Engineer',
    'Frontend Developer (React)',
    'Backend Developer (Java)',
    'Site Reliability Engineer',
];

test('ticket 5: every QA and Engineering job leads to its application form and back', async ({ page }) => {
    // Registered once, before the first action. It stays active across page loads.
    await page.addLocatorHandler(page.getByRole('button', { name: 'Accept all' }), async (button) => {
        await button.click();
    });

    for (const title of jobs) {
        await page.goto('/jobs?bugs=cookie-banner');

        await page.getByRole('link', { name: title }).click();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

        await page.getByRole('link', { name: 'Apply' }).click();
        await expect(page.getByRole('heading', { name: `Apply for ${title}` })).toBeVisible();

        await page.getByRole('link', { name: title }).click();
        await page.getByRole('link', { name: 'All jobs' }).click();
        await expect(page.getByRole('heading', { name: 'Open positions' })).toBeVisible();
    }
});
