import { cv, person } from './data';
import { expect, test } from './fixtures';

// 1 · thirty minutes in no time.
// The test signs in with its own account: when the session expires, the app
// logs it out, and a shared session would log out every other test with it.
test('the session warning appears after 30 minutes', async ({ page, account }) => {
    await page.request.post('/api/auth/login', { data: { email: account.email, password: 'hire-ground' } });
    await page.clock.install(); // before goto: the page must start with the fake clock
    await page.goto('/recruiter');
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();

    await page.clock.fastForward('30:00');
    await expect(page.getByRole('alertdialog')).toContainText('Your session expires in 2 minutes.');

    await page.clock.fastForward('02:00');
    await expect(page.getByText('Your session expired. Please sign in again.')).toBeVisible();
});

// 2 · something that arrives eventually: poll until it is there.
test('the confirmation mail arrives, sooner or later', async ({ request }) => {
    const p = person('mail');
    await request.post('/api/applications?bugs=mail-delay', { multipart: { jobId: '1', ...p, consent: 'true', cv } });

    await expect
        .poll(async () => (await (await request.get(`/api/mail?to=${p.email}`)).json()).length, { timeout: 15_000 })
        .toBe(1);
});
