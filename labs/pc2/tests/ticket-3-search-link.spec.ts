import { expect, test } from '@playwright/test';

// The search matches parts of words: "ing" is in the Engineering team (three jobs)
// and in "Working Student" (two jobs).
test('a search link opens the list with its results', async ({ page }) => {
    await page.goto('/jobs?q=ing');

    const results = page.getByRole('article');
    expect.soft(await results.first().isVisible(), 'the link shows results').toBe(true);
    await expect.soft(page.getByRole('status')).toHaveText('5 jobs');
    await expect.soft(page.getByRole('searchbox', { name: 'Search jobs' })).toHaveValue('ing');
});
