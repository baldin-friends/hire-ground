import { test, expect } from '../fixtures';
import type { Locator, Page } from '@playwright/test';

// The repaired suite. It passes with any number of workers, in any order, as often as you like:
//
//   npx playwright test --workers=4 --shuffle --repeat-each=3
//
// What changed, cause by cause:
//   order      no test needs a test that ran before it: each one gets its candidate from the applicant fixture
//   counts     no assertion on a number that other tests change: a search for the own candidate has one result
//   records    no test touches seed data or a fixed e-mail address: Max and Paula are gone
//   account    one recruiter account per worker (fixtures.ts), and each settings test sets its starting point itself
//   reset      gone, and with it the setup project: nothing here needs a clean database
// https://playwright.dev/docs/test-parallel · https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible

/** The stage dropdown from case 2: built from <div>s, and its panel is rendered at the end of <body>. */
async function selectStage(row: Locator, stage: string) {
    await row.locator('.hg-select__trigger').click();
    await row.page().locator('.hg-select__panel').getByText(stage, { exact: true }).click();
}

/** The star in a row of the candidates table: an icon without a name (case 2). */
const star = (row: Locator) => row.locator('button:has(use[href="#icon-star"])');

test.describe('candidates table', () => {
    // "36 candidates" was true for one moment on one machine. What the test wanted to know:
    // a new application arrives in the table. The search makes the count the test's own.
    test('shows a new application', async ({ page, applicant }) => {
        await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
        await expect(page.getByRole('status')).toHaveText('1 candidate');
        await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
    });
});

test.describe('shortlist', () => {
    test('a candidate can be put on the shortlist', async ({ page, applicant }) => {
        await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
        const button = star(page.getByRole('row', { name: applicant.name }));
        await button.click();
        await expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    test('the filter shows the shortlisted candidates only', async ({ page, request, applicant }) => {
        // arrange through the API: this test is about the filter, not about the star
        await request.patch(`/api/applications/${applicant.id}`, { data: { shortlisted: true } });

        await page.goto(`/recruiter/candidates?shortlisted=1&q=${applicant.lastName}`);
        await expect(page.getByRole('checkbox', { name: 'Shortlisted only' })).toBeChecked();
        await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
    });

    test('a candidate can be taken off the shortlist', async ({ page, request, applicant }) => {
        await request.patch(`/api/applications/${applicant.id}`, { data: { shortlisted: true } });

        await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
        const button = star(page.getByRole('row', { name: applicant.name }));
        await button.click();
        await expect(button).toHaveAttribute('aria-pressed', 'false');
    });
});

test.describe('stages', () => {
    test('a new candidate moves to Screening', async ({ page, applicant }) => {
        await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
        await selectStage(page.getByRole('row', { name: applicant.name }), 'Screening');
        await expect(page.getByText(`${applicant.name} moved to Screening.`)).toBeVisible();
    });
});

// The setting belongs to the account, and every worker has its own account. Two of these tests
// never run at the same time on one account: a worker runs one test at a time.
// "On by default" is true for an account nobody has touched. On a system without a reset
// a test says where it starts: it sets the setting through the API first.
test.describe('notification setting', () => {
    const settingOf = (page: Page) => page.getByRole('checkbox', { name: 'Email me when a new application arrives' });

    test('shows the saved setting', async ({ page, request, account }) => {
        await request.put('/api/settings', { data: { notifyOnNewApplication: true } });

        await page.goto('/recruiter/settings');
        await expect(page.getByText(`Signed in as ${account.name}`)).toBeVisible();
        await expect(settingOf(page)).toBeChecked();
    });

    test('can be switched off', async ({ page, request }) => {
        await request.put('/api/settings', { data: { notifyOnNewApplication: true } });

        await page.goto('/recruiter/settings');
        await settingOf(page).uncheck();
        await page.getByRole('button', { name: 'Save settings' }).click();
        await expect(page.getByRole('status')).toHaveText('Settings saved.');

        await page.reload();
        await expect(settingOf(page)).not.toBeChecked();
    });
});
