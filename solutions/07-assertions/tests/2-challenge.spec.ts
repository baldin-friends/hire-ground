import { test, expect } from '../expect';

test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
});

/** Tomorrow at hh:mm, in the format of <input type="datetime-local">. A fixed date is a failure with a start date. */
const tomorrowAt = (hhmm: string) => `${new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}T${hhmm}`;

test('an invitation to an interview reaches the candidate', async ({ page, request }) => {
    await page.goto('/recruiter/candidates');

    // No sleep after the search: click() waits until the link exists. Before the search it does not: page 2.
    await page.getByLabel('Search').fill('Luis Hartmann');
    await page.getByRole('link', { name: 'Luis Hartmann' }).click();

    await page.getByLabel('Date and time').fill(tomorrowAt('10:00'));
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    await expect(page.getByText('Interview scheduled.')).toBeVisible();

    // the mail arrives one to two seconds later: the matcher polls the mailbox
    await expect(request).toHaveMail('luis.hartmann@example.com', 'Invitation to an interview: Senior QA Engineer');

    // the table shows the new stage: the matcher knows where a row keeps it
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await expect(page.getByRole('row', { name: 'Luis Hartmann' })).toHaveStage('Interview');
});
