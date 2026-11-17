import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const mails = (page: Page) => page.getByRole('checkbox', { name: 'Email me when a new application arrives' });

async function save(page: Page) {
    await page.getByRole('button', { name: 'Save settings' }).click();
    await expect(page.getByRole('status')).toHaveText('Settings saved.');
}

test('a recruiter gets mails about new applications by default', async ({ page }) => {
    await page.goto('/recruiter/settings');

    await expect(mails(page)).toBeChecked();
});

test('switching the mails off survives a reload', async ({ page }) => {
    await page.goto('/recruiter/settings');
    await mails(page).uncheck();
    await save(page);

    await page.reload();
    await expect(mails(page)).not.toBeChecked();

    // leave the account as we found it
    await mails(page).check();
    await save(page);
});

test('a second tab shows the saved setting', async ({ page, context }) => {
    await page.goto('/recruiter/settings');
    await mails(page).uncheck();
    await save(page);

    const tab = await context.newPage();
    await tab.goto('/recruiter/settings');
    await expect(mails(tab)).not.toBeChecked();
    await tab.close();

    // leave the account as we found it
    await mails(page).check();
    await save(page);
});

test('the choice sticks while the recruiter works on the board', async ({ page }) => {
    await page.goto('/recruiter/settings');
    await mails(page).uncheck();
    await save(page);

    const menu = page.getByRole('navigation', { name: 'Recruiter' });
    for (const name of ['Lena Schmidt', 'Jonas Weber']) {
        await menu.getByRole('link', { name: 'Pipeline' }).click();
        await page.getByRole('link', { name }).click();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
    }
    await menu.getByRole('link', { name: 'Settings' }).click();
    await expect(mails(page)).not.toBeChecked();

    // leave the account as we found it
    await mails(page).check();
    await save(page);
});
