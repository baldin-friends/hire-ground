import { test, expect } from '../../../support/fixtures';

// The tag puts this test into the time zone projects of playwright.config.ts:
//   npx playwright test --project=chromium-tokyo
// https://playwright.dev/docs/test-annotations#tag-tests

test('the table shows the day of the interview that the recruiter entered', { tag: '@timezone' }, async ({ page, applicant }, testInfo) => {
    // A known bug gets a name instead of a red pipeline: the test is expected to fail in Tokyo.
    // When the application is repaired, this line makes the test fail ("expected to fail, but passed"): delete it then.
    // https://playwright.dev/docs/api/class-test#test-fail
    test.fail(
        testInfo.project.name === 'chromium-tokyo',
        'formatInterviewDay() in app/src/format.ts cuts the day out of the UTC instant: one day early east of Greenwich in the morning',
    );

    await page.goto(`/recruiter/applications/${applicant.id}`);
    await page.getByLabel('Date and time').fill('2027-01-15T08:00'); // 08:00 where the recruiter sits
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByTestId('interview-time')).toContainText('Fri, 15 Jan 2027, 08:00');

    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('row', { name: applicant.name }).getByTestId('interview-day')).toHaveText('15.01.2027');
});
