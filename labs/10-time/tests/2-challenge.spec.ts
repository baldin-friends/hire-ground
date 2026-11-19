import { test, expect } from '../../../support/fixtures';

// A customer in Tokyo writes: "I schedule an interview for the 15th, and the candidates table shows the 14th."
// Nobody in Berlin can reproduce it. This test passes, too.
//
// Reproduce it without changing the clock of your laptop. The steps are in README.md.

test('the table shows the day of the interview that the recruiter entered', async ({ page, applicant }) => {
    await page.goto(`/recruiter/applications/${applicant.id}`);
    await page.getByLabel('Date and time').fill('2027-01-15T08:00'); // 08:00 where the recruiter sits
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByTestId('interview-time')).toContainText('Fri, 15 Jan 2027, 08:00');

    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('row', { name: applicant.name }).getByTestId('interview-day')).toHaveText('15.01.2027');
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The steps of the challenge as code, ready to copy. Try each step yourself first.
// To use a piece: copy its lines to the place named, select them, and remove the comment (Cmd+/ or Ctrl+/).
// The numbers are the steps in README.md. The finished files: solutions/10-time/playwright.config.ts and tests/2-challenge.spec.ts
//
// Step 1 · reproduce it. In this file, above the test:
// test.use({ timezoneId: 'Asia/Tokyo' });
// Run  npx playwright test 2-challenge : red, "14.01.2027" instead of "15.01.2027". Then delete the line again.
//
// Step 2 · two more time zones. In playwright.config.ts, above  export default defineConfig({ :
// const chrome = { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/recruiter.json' };
// and in  projects: [ , in place of the project 'chromium':
//         { name: 'chromium', use: { ...chrome }, dependencies: ['setup'] },
//         { name: 'chromium-new-york', use: { ...chrome, timezoneId: 'America/New_York' }, dependencies: ['setup'] },
//         { name: 'chromium-tokyo', use: { ...chrome, timezoneId: 'Asia/Tokyo' }, dependencies: ['setup'] },
// Run  npx playwright test : three tests are red. The bug in Tokyo, and the warm-up test for Berlin in both new projects.
//
// Step 3 · only the time zone tests. In this file, the first line of the test becomes:
// test('the table shows the day of the interview that the recruiter entered', { tag: '@timezone' }, async ({ page, applicant }) => {
// and in playwright.config.ts both new projects get  grep: /@timezone/ :
//         { name: 'chromium-new-york', grep: /@timezone/, use: { ...chrome, timezoneId: 'America/New_York' }, dependencies: ['setup'] },
//         { name: 'chromium-tokyo', grep: /@timezone/, use: { ...chrome, timezoneId: 'Asia/Tokyo' }, dependencies: ['setup'] },
// npx playwright test --list : 8 tests instead of 16. Run  npx playwright test : one test is red, the bug in chromium-tokyo.
//
// Step 4 · another engine, without these tests. In playwright.config.ts, above the project 'setup':
//         { name: 'firefox', grepInvert: /@timezone/, use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/recruiter.json' }, dependencies: ['setup'], default: false },
// It runs only when it is named:  npx playwright test --project=firefox  is green, without the tagged test.
//
// Step 5 · a known bug gets a mark. In this file: testInfo as the second argument, and test.fail() as the first lines of the test:
// test('the table shows the day of the interview that the recruiter entered', { tag: '@timezone' }, async ({ page, applicant }, testInfo) => {
//     test.fail(
//         testInfo.project.name === 'chromium-tokyo',
//         'formatInterviewDay() in app/src/format.ts cuts the day out of the UTC instant: one day early in Tokyo',
//     );
// Run  npx playwright test : green. The list shows ✘ next to the Tokyo test and still says "passed": the failure was expected.
