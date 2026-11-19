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
// Step 2 · a project for Tokyo. In playwright.config.ts, above the line  // signs in once and saves the session :
//         // the same Chromium, in another time zone
//         {
//             name: 'chromium-tokyo',
//             use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/recruiter.json', timezoneId: 'Asia/Tokyo' },
//             dependencies: ['setup'],
//         },
// It is the project 'chromium', copied: another name, and timezoneId in use.
// Run  npx playwright test : two tests are red. The bug, and a warm-up test that was written for Berlin.
//
// Step 3 · only the time zone test. In this file, the first line of the test becomes:
// test('the table shows the day of the interview that the recruiter entered', { tag: '@timezone' }, async ({ page, applicant }) => {
// and in playwright.config.ts the project 'chromium-tokyo' gets one more line, under its name:
//             grep: /@timezone/, // only the tests with this tag
// Run  npx playwright test --list : 6 tests instead of 9. Run  npx playwright test : one test is red, the bug.
//
// Step 4 · the bug is known. In this file the test gets testInfo as its second argument, and test.fail() as its first lines:
// test('the table shows the day of the interview that the recruiter entered', { tag: '@timezone' }, async ({ page, applicant }, testInfo) => {
//     test.fail(
//         testInfo.project.name === 'chromium-tokyo',
//         'formatInterviewDay() in app/src/format.ts cuts the day out of the UTC instant: one day early in Tokyo',
//     );
// Run  npx playwright test : green. The list shows ✘ next to the Tokyo test and the run says "passed": this failure was expected.
