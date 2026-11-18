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
