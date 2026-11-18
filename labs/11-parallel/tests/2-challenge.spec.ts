import { test, expect, type Locator } from '@playwright/test';

// The challenge: a suite for the recruiter workspace, written top to bottom and run with one worker.
//
//   npx playwright test 2-challenge --workers=1               green
//   npx playwright test 2-challenge --workers=4               two tests fail
//   npx playwright test 2-challenge --workers=1 --shuffle=7   three tests fail, the same three every time
//
// Find out what each failing test shares with another test, and repair the suite.
// Steps and hints: README.md · https://playwright.dev/docs/test-parallel

const CV = { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') };
const PAULA = { firstName: 'Paula', lastName: 'Parallel', email: 'paula.parallel@example.com' };

/** The stage dropdown from case 2: built from <div>s, and its panel is rendered at the end of <body>. */
async function selectStage(row: Locator, stage: string) {
    await row.locator('.hg-select__trigger').click();
    await row.page().locator('.hg-select__panel').getByText(stage, { exact: true }).click();
}

/** The star in a row of the candidates table: an icon without a name (case 2). */
const star = (row: Locator) => row.locator('button:has(use[href="#icon-star"])');

test.describe('candidates table', () => {
    test('lists every candidate', async ({ page }) => {
        await page.goto('/recruiter/candidates');
        await expect(page.getByRole('status')).toHaveText('36 candidates');
    });

    test('shows a new application', async ({ page, request }) => {
        const response = await request.post('/api/applications', {
            multipart: { jobId: '4', ...PAULA, consent: 'true', cv: CV },
        });
        expect(response.status(), await response.text()).toBe(201);

        await page.goto('/recruiter/candidates');
        await expect(page.getByRole('status')).toHaveText('37 candidates');
        await expect(page.getByRole('row', { name: 'Paula Parallel' })).toBeVisible();
    });
});

test.describe('shortlist', () => {
    test('a candidate can be put on the shortlist', async ({ page }) => {
        await page.goto('/recruiter/candidates?q=Max+Mustermann');
        const button = star(page.getByRole('row', { name: 'Max Mustermann' }));
        await button.click();
        await expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    test('the filter shows the shortlisted candidates only', async ({ page }) => {
        await page.goto('/recruiter/candidates?shortlisted=1'); // the filter "Shortlisted only", straight from the address
        await expect(page.getByRole('checkbox', { name: 'Shortlisted only' })).toBeChecked();
        // twelve in the seed data, and Max
        await expect(page.getByRole('status')).toHaveText('13 candidates');
        await expect(page.getByRole('row', { name: 'Max Mustermann' })).toBeVisible();
    });

    test('a candidate can be taken off the shortlist', async ({ page }) => {
        await page.goto('/recruiter/candidates?q=Max+Mustermann');
        const button = star(page.getByRole('row', { name: 'Max Mustermann' }));
        await button.click();
        await expect(button).toHaveAttribute('aria-pressed', 'false');
    });
});

test.describe('stages', () => {
    test('the new candidate moves to Screening', async ({ page }) => {
        await page.goto('/recruiter/candidates?q=Parallel');
        await selectStage(page.getByRole('row', { name: 'Paula Parallel' }), 'Screening');
        await expect(page.getByText('Paula Parallel moved to Screening.')).toBeVisible();
    });
});

test.describe('notification setting', () => {
    test('is on by default', async ({ page }) => {
        await page.goto('/recruiter/settings');
        await expect(page.getByRole('checkbox', { name: 'Email me when a new application arrives' })).toBeChecked();
    });

    test('can be switched off', async ({ page }) => {
        await page.goto('/recruiter/settings');
        const setting = page.getByRole('checkbox', { name: 'Email me when a new application arrives' });
        await setting.uncheck();
        await page.getByRole('button', { name: 'Save settings' }).click();
        await expect(page.getByRole('status')).toHaveText('Settings saved.');

        await page.reload();
        await expect(setting).not.toBeChecked();
    });
});
