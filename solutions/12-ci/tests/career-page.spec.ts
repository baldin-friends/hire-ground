import { test, expect } from '@playwright/test';

// The career page: tests that only read. Six tests in one file, the largest file of this suite.
// @smoke marks what the gate runs on every pull request: https://playwright.dev/docs/test-annotations#tag-tests

test.use({ storageState: { cookies: [], origins: [] } }); // no sign-in

test('the career page opens', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Open positions');
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
