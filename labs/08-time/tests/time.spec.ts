import { cv, person } from './data';
import { expect, test } from './fixtures';

// Steps 14 and 15 · thirty minutes in under ten seconds.

// 1 · the session warning. The `account` fixture gives this test its own recruiter:
// when the session expires the app logs out, and that must not hit the other tests.
test('the session warning appears after 30 minutes', async ({ page, account }) => {
    await page.request.post('/api/auth/login', { data: { email: account.email, password: 'hire-ground' } });

    // TODO: install the fake clock BEFORE the page loads:  await page.clock.install();
    // TODO: open /recruiter and wait for the heading "Pipeline"
    // TODO: fast-forward 30 minutes:  await page.clock.fastForward('30:00');
    // TODO: the alert dialog says "Your session expires in 2 minutes."
    throw new Error('TODO: write the steps above, then delete this line');
});

// 2 · the confirmation mail arrives after 2 to 8 seconds (teaching bug mail-delay).
test('the confirmation mail arrives, sooner or later', async ({ request }) => {
    const p = person('mail');
    await request.post('/api/applications?bugs=mail-delay', { multipart: { jobId: '1', ...p, consent: 'true', cv } });

    // The test mailbox: GET /api/mail?to=<address> answers with a list of mails.
    // TODO: poll until the list has one entry. expect.poll(async () => …, { timeout: 15_000 }).toBe(1)
    throw new Error('TODO: write the steps above, then delete this line');
});
