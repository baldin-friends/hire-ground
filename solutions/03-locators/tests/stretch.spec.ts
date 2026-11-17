import { expect, test } from '@playwright/test';

// Step 9 · done early: the same search with the keyboard only.
test('keyboard only', async ({ page }) => {
    await page.goto('/jobs');
    const search = page.getByRole('searchbox', { name: 'Search jobs' });
    await search.pressSequentially('Recruiter'); // key by key, fires every keydown
    await search.press('Enter');
    await expect(page.getByRole('status')).toHaveText('1 job');

    await search.press('ControlOrMeta+A');
    await search.press('Backspace');
    await expect(search).toHaveValue('');
});

// Narrowing: filter by text, filter by a child, count.
test('narrow down: filter and has', async ({ page }) => {
    await page.goto('/jobs');
    const cards = page.getByRole('article');

    const hamburgRemote = cards.filter({ hasText: 'Hamburg' }).filter({ hasText: 'Remote possible' });
    await expect(hamburgRemote.getByRole('heading')).toHaveText('UX Researcher');

    await expect(cards.filter({ has: page.getByText('Applications closed') })).toHaveCount(1);
});
