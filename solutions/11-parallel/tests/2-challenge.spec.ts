import { test, expect } from '../fixtures';
import type { Locator } from '@playwright/test';

// Four tests for the recruiter workspace, written top to bottom.
// This version is green with four workers, as often as you like:  npx playwright test 2-challenge --workers=4 --repeat-each=3
// Steps and hints: README.md · https://playwright.dev/docs/test-parallel

/** The stage dropdown from case 2: built from <div>s, and its panel is rendered at the end of <body>. */
async function selectStage(row: Locator, stage: string) {
    await row.locator('.hg-select__trigger').click();
    await row.page().locator('.hg-select__panel').getByText(stage, { exact: true }).click();
}

/** The star in a row of the candidates table: an icon without a name (case 2). */
const star = (row: Locator) => row.locator('button:has(use[href="#icon-star"])');

test('a new application shows up in the table', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    await expect(page.getByRole('status')).toHaveText('1 candidate');
    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});

test('the new candidate moves to Screening', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    await selectStage(page.getByRole('row', { name: applicant.name }), 'Screening');
    await expect(page.getByText(`${applicant.name} moved to Screening.`)).toBeVisible();
});

test('a candidate can be put on the shortlist', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const button = star(page.getByRole('row', { name: applicant.name }));
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
});

test('a candidate can be taken off the shortlist', async ({ page, request, applicant }) => {
    // this test starts with a candidate who is on the shortlist: it says so itself, through the API
    await request.patch(`/api/applications/${applicant.id}`, { data: { shortlisted: true } });

    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const button = star(page.getByRole('row', { name: applicant.name }));
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
});
