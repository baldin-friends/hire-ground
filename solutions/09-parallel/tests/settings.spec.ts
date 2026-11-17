import { cv, person } from './data';
import { expect, test } from './fixtures';

// The notification setting. With the teaching bug global-settings there is ONE
// setting for all recruiters: an account per worker does not keep these tests apart.
// Fixed: the lock lets only one of these tests run at a time, across all workers.
const rita = 'rita.recruiter@hireground.test';

test.describe('notification setting', { lock: 'notification-settings' }, () => {
    test.beforeEach(async ({ page, account }) => {
        await page.request.post('/api/auth/login?bugs=global-settings', {
            data: { email: account.email, password: 'hire-ground' },
        });
        await page.goto('/recruiter/settings');
    });

    test('is on by default', async ({ page }) => {
        await expect(page.getByRole('checkbox', { name: 'Email me when a new application arrives' })).toBeChecked();
    });

    test('on: a new application sends a mail to the recruiter', async ({ page }) => {
        const p = person('notify');
        await page.request.post('/api/applications', { multipart: { jobId: '3', ...p, consent: 'true', cv } });

        const mails = await (await page.request.get(`/api/mail?to=${rita}`)).json();
        expect(mails.filter((m: { body: string }) => m.body.includes(p.lastName))).toHaveLength(1);
    });

    test('off: a new application sends no mail', async ({ page }) => {
        const setting = page.getByRole('checkbox', { name: 'Email me when a new application arrives' });
        await setting.uncheck();
        await page.getByRole('button', { name: 'Save settings' }).click();
        await expect(page.getByRole('status')).toHaveText('Settings saved.');

        const p = person('silent');
        await page.request.post('/api/applications', { multipart: { jobId: '3', ...p, consent: 'true', cv } });
        const mails = await (await page.request.get(`/api/mail?to=${rita}`)).json();
        expect(mails.filter((m: { body: string }) => m.body.includes(p.lastName))).toHaveLength(0);

        // leave it the way we found it
        await setting.check();
        await page.getByRole('button', { name: 'Save settings' }).click();
        await expect(page.getByRole('status')).toHaveText('Settings saved.');
    });
});
