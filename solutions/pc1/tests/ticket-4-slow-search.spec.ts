import { expect, test } from '@playwright/test';

// Ticket 4: the job search answers after 300 to 1500 ms.
// Fix in the test: toHaveCount retries until the list has caught up. count() looks once.
test('ticket 4: searching for "QA" narrows twelve jobs down to three', async ({ page }) => {
    await page.goto('/jobs?bugs=slow-search');
    const jobs = page.getByRole('article');

    await expect(jobs).toHaveCount(12);

    await page.getByRole('searchbox', { name: 'Search jobs' }).fill('QA');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(jobs).toHaveCount(3);
});
