import { test, expect } from '../../../support/fixtures';

// Interviews. From Case 3 (the page answers late: poll the mailbox) and Case 6 (the time zone of the browser).

/** Tomorrow at hh:mm, in the format of <input type="datetime-local">. */
const tomorrowAt = (hhmm: string) => `${new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}T${hhmm}`;

test('an invitation to an interview reaches the candidate', { tag: '@slow' }, async ({ page, request, applicant, job }) => {
    await page.goto(`/recruiter/applications/${applicant.id}`);
    await page.getByLabel('Date and time').fill(tomorrowAt('10:00'));
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByText('Interview scheduled.')).toBeVisible();

    // The mail leaves through a queue, one to two seconds later: ask the mailbox until it is there, never sleep.
    await expect
        .poll(async () => {
            const response = await request.get('/api/mail', { params: { to: applicant.email } });
            return (await response.json()).map((mail: { subject: string }) => mail.subject);
        }, { timeout: 10_000 })
        .toContain(`Invitation to an interview: ${job.title}`);

    // the table shows the new stage
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    await expect(page.getByRole('row', { name: applicant.name }).locator('.hg-select__value')).toHaveText('Interview');
});

test.describe('the candidate reads the time in the time zone of the browser', () => {
    // A fixed instant on purpose: winter time in both zones. 09:00 UTC is 10:00 in Berlin and 04:00 in New York.
    const INTERVIEW = '2027-01-15T09:00:00.000Z';

    test.beforeEach(async ({ request, applicant }) => {
        await request.put(`/api/applications/${applicant.id}/interview`, { data: { startsAt: INTERVIEW } });
    });

    test('in Berlin', async ({ page, applicant }) => {
        // the config says timezoneId: 'Europe/Berlin'
        await page.goto(`/status/${applicant.reference}`);

        await expect(page.getByRole('time')).toHaveText('Fri, 15 Jan 2027, 10:00');
        await expect(page.getByText('(Europe/Berlin)')).toBeVisible();
    });

    test.describe('in New York', () => {
        // https://playwright.dev/docs/emulation#locale--timezone
        test.use({ timezoneId: 'America/New_York' });

        test('in New York', async ({ page, applicant }) => {
            await page.goto(`/status/${applicant.reference}`);

            await expect(page.getByRole('time')).toHaveText('Fri, 15 Jan 2027, 04:00');
            await expect(page.getByText('(America/New_York)')).toBeVisible();
        });
    });
});
