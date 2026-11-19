import { test, expect } from '../expect';

test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
});

// The recruiter invites Luis Hartmann to an interview. The test proves three things:
// the page confirms it, the candidate gets a mail, and the table shows the new stage.
//
// This version asks again where the first one looked once, and it does not sleep. The steps are in README.md.

test('an invitation to an interview reaches the candidate', async ({ page, request }) => {
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await page.getByRole('link', { name: 'Luis Hartmann' }).click();

    await page.getByLabel('Date and time').fill('2026-11-26T10:00');
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByText('Interview scheduled.')).toBeVisible();

    // the candidate gets a mail
    await expect
        .poll(async () => {
            const response = await request.get('/api/mail', { params: { to: 'luis.hartmann@example.com' } });
            return (await response.json()).map((mail: { subject: string }) => mail.subject);
        }, { timeout: 10_000 })
        .toContain('Invitation to an interview: Senior QA Engineer');

    // the table shows the new stage
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await expect(page.getByRole('row', { name: 'Luis Hartmann' })).toHaveStage('Interview');
});

// Done early: the same test with a date that does not age, and with a matcher of its own for the mail (expect.ts).

/** Tomorrow at hh:mm, in the format of <input type="datetime-local">. */
const tomorrowAt = (hhmm: string) => `${new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}T${hhmm}`;

test('done early: a computed date, and a matcher for the mail', async ({ page, request }) => {
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await page.getByRole('link', { name: 'Luis Hartmann' }).click();

    await page.getByLabel('Date and time').fill(tomorrowAt('10:00'));
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByText('Interview scheduled.')).toBeVisible();

    await expect(request).toHaveMail('luis.hartmann@example.com', 'Invitation to an interview: Senior QA Engineer');
});
