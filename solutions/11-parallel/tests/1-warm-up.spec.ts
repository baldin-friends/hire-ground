import { test, expect } from '@playwright/test';

// Warm-up: what a worker is.
//   npx playwright test 1-warm-up --workers=1     one process runs all five tests
//   npx playwright test 1-warm-up --workers=4     four processes, each with its own copy of this file
// Read the lines the tests print, and the time on the last line.
// https://playwright.dev/docs/test-parallel

test.use({ storageState: { cookies: [], origins: [] } }); // the career page needs no sign-in

// A variable in a test file. Every worker process loads the file itself, so every worker has its own `testsInThisProcess`.
let testsInThisProcess = 0;

const TEAMS = [
    { team: 'QA', job: 'Senior QA Engineer' },
    { team: 'Engineering', job: 'Site Reliability Engineer' },
    { team: 'Product', job: 'UX Researcher' },
    { team: 'Sales', job: 'Account Executive DACH' },
    { team: 'People', job: 'Recruiter (Tech)' },
];

for (const { team, job } of TEAMS) {
    test(`the career page lists a job of team ${team}`, async ({ page }, testInfo) => {
        testsInThisProcess++;
        console.log(
            `${team.padEnd(12)} worker process ${testInfo.workerIndex}, slot ${testInfo.parallelIndex}: ` +
                `test number ${testsInThisProcess} in this process`,
        );

        await page.goto('/jobs');
        await page.getByLabel('Team').selectOption(team);

        // These tests only read, and they look for a job that no test changes.
        // A count ("2 jobs") would break as soon as another test publishes a job in this team.
        await expect(page.getByRole('article', { name: job })).toBeVisible();
    });
}
