import { expect, test } from '@playwright/test';

// Ticket 4: the job search answers after 300 to 1500 ms.
// Symptom: the test counts the jobs and gets the wrong number.
// Rule: no CSS, no XPath. And no waitForTimeout.
test('ticket 4: searching for "QA" narrows twelve jobs down to three', async ({ page }) => {
    await page.goto('/jobs?bugs=slow-search');
    const jobs = page.getByRole('article');

    expect(await jobs.count()).toBe(12);

    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('QA');
    await page.getByRole('button', { name: 'Search' }).click();

    expect(await jobs.count()).toBe(3);
});
