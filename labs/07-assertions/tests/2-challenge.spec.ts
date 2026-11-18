import { test, expect } from '../expect';

test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
});

// The recruiter invites Luis Hartmann to an interview. The test proves three things:
// the page confirms it, the candidate gets a mail, and the table shows the new stage.
//
// This version reads everything once and sleeps where it is unsure. Run it. The steps are in README.md.

test('an invitation to an interview reaches the candidate', async ({ page, request }) => {
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await page.waitForTimeout(2000); // the search needs a moment
    await page.getByRole('link', { name: 'Luis Hartmann' }).click();

    await page.getByLabel('Date and time').fill('2026-11-26T10:00');
    await page.getByRole('button', { name: 'Schedule interview' }).click();
    expect(await page.getByText('Interview scheduled.').isVisible()).toBe(true);

    // the candidate gets a mail
    const response = await request.get('/api/mail?to=luis.hartmann@example.com');
    const mails = await response.json();
    expect(mails[0].subject).toBe('Invitation to an interview: Senior QA Engineer');

    // the table shows the new stage
    await page.goto('/recruiter/candidates');
    await page.getByLabel('Search').fill('Luis Hartmann');
    await page.waitForTimeout(2000);
    const stage = await page.getByRole('row', { name: 'Luis Hartmann' }).locator('.hg-select__value').textContent();
    expect(stage).toBe('Interview');
});
