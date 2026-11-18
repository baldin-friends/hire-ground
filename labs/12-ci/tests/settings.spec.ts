import { test, expect } from '../../../support/fixtures.per-worker';
import type { Page } from '@playwright/test';

// The setting belongs to the account, and every worker has its own account (case 7).
const settingOf = (page: Page) => page.getByRole('checkbox', { name: 'Email me when a new application arrives' });

test('the settings page shows the saved setting', async ({ page, request, account }) => {
    await request.put('/api/settings', { data: { notifyOnNewApplication: true } });

    await page.goto('/recruiter/settings');
    await expect(page.getByText(`Signed in as ${account.name}`)).toBeVisible();
    await expect(settingOf(page)).toBeChecked();
});

test('the notification can be switched off', async ({ page, request }) => {
    await request.put('/api/settings', { data: { notifyOnNewApplication: true } });

    await page.goto('/recruiter/settings');
    await settingOf(page).uncheck();
    await page.getByRole('button', { name: 'Save settings' }).click();
    await expect(page.getByRole('status')).toHaveText('Settings saved.');

    await page.reload();
    await expect(settingOf(page)).not.toBeChecked();
});
