import { test, expect } from '@playwright/test';

// The career page: tests that only read. Six tests in one file, the largest file of this suite.

test.use({ storageState: { cookies: [], origins: [] } }); // no sign-in

test('the career page opens', async ({ page }) => {
    await page.goto('/jobs');
    // Wrong on purpose: the heading is "Open positions". This is the red test you look for in the merged report.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Open roles');
});

const TEAMS = [
    { team: 'QA', job: 'Senior QA Engineer' },
    { team: 'Engineering', job: 'Site Reliability Engineer' },
    { team: 'Product', job: 'UX Researcher' },
    { team: 'Sales', job: 'Account Executive DACH' },
    { team: 'People', job: 'Recruiter (Tech)' },
];

for (const { team, job } of TEAMS) {
    test(`the career page lists a job of team ${team}`, async ({ page }) => {
        await page.goto('/jobs');
        await page.getByLabel('Team').selectOption(team);
        await expect(page.getByRole('article', { name: job })).toBeVisible();
    });
}
