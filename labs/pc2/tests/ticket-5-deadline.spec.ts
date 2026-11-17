import { expect, test } from '@playwright/test';

// The seed moves every deadline with the calendar. This test pins the deadline and
// the clock, so the expected text is the same on every day of the year.
test('a job shows its deadline as a German date', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-01T09:00:00+02:00'));
    await page.route('**/api/jobs/senior-qa-engineer', async (route) => {
        const response = await route.fetch();
        const job = await response.json();
        await route.fulfill({ response, json: { ...job, deadline: '2026-10-11' } });
    });

    await page.goto('/jobs/senior-qa-engineer');

    await expect(page.getByText(/^Apply by/)).toHaveText('Apply by 11.10.2026');
});
