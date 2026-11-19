import { test, expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

// Four tests for the recruiter workspace, written top to bottom.
// This version is green with one worker and red with four:  npx playwright test 2-challenge --workers=4
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

test('a new application shows up in the table', async ({ page, request }) => {
    const response = await request.post('/api/applications', {
        multipart: { jobId: '4', ...PAULA, consent: 'true', cv: CV },
    });
    expect(response.status(), await response.text()).toBe(201);

    await page.goto('/recruiter/candidates');
    await expect(page.getByRole('status')).toHaveText('37 candidates');
    await expect(page.getByRole('row', { name: 'Paula Parallel' })).toBeVisible();
});

test('the new candidate moves to Screening', async ({ page }) => {
    await page.goto('/recruiter/candidates?q=Parallel');
    await selectStage(page.getByRole('row', { name: 'Paula Parallel' }), 'Screening');
    await expect(page.getByText('Paula Parallel moved to Screening.')).toBeVisible();
});

test('a candidate can be put on the shortlist', async ({ page }) => {
    await page.goto('/recruiter/candidates?q=Max+Mustermann');
    const button = star(page.getByRole('row', { name: 'Max Mustermann' }));
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
});

test('a candidate can be taken off the shortlist', async ({ page }) => {
    await page.goto('/recruiter/candidates?q=Max+Mustermann');
    const button = star(page.getByRole('row', { name: 'Max Mustermann' }));
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The steps of the challenge as code, ready to copy. Try each step yourself first.
// To use a piece: copy its lines to the place named, select them, and remove the comment (Cmd+/ or Ctrl+/).
// The numbers are the steps in README.md. The finished files: solutions/11-parallel/tests/
//
// Steps 1 and 2 are reading: run it with --workers=1 and with --workers=4, and name what each failing test
// needs from another test.
//
// Step 3 · every test gets its own candidate. Line 1, the import, becomes:
// import { test, expect } from '../fixtures';
// Delete the two lines  const CV = …  and  const PAULA = …  Then the four tests, instead of the ones above:
// test('a new application shows up in the table', async ({ page, applicant }) => {
//     await page.goto('/recruiter/candidates');
//     await expect(page.getByRole('status')).toHaveText('37 candidates');
//     await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
// });
//
// test('the new candidate moves to Screening', async ({ page, applicant }) => {
//     await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
//     await selectStage(page.getByRole('row', { name: applicant.name }), 'Screening');
//     await expect(page.getByText(`${applicant.name} moved to Screening.`)).toBeVisible();
// });
//
// test('a candidate can be put on the shortlist', async ({ page, applicant }) => {
//     await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
//     const button = star(page.getByRole('row', { name: applicant.name }));
//     await button.click();
//     await expect(button).toHaveAttribute('aria-pressed', 'true');
// });
//
// test('a candidate can be taken off the shortlist', async ({ page, request, applicant }) => {
//     // this test starts with a candidate who is on the shortlist: it says so itself, through the API
//     await request.patch(`/api/applications/${applicant.id}`, { data: { shortlisted: true } });
//
//     await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
//     const button = star(page.getByRole('row', { name: applicant.name }));
//     await button.click();
//     await expect(button).toHaveAttribute('aria-pressed', 'false');
// });
// Run it with --workers=1: green. With --workers=4: the first test is red, "40 candidates" instead of 37.
//
// Step 4 · no count of everything. In the first test, instead of the lines with page.goto and '37 candidates':
//     await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
//     await expect(page.getByRole('status')).toHaveText('1 candidate');
// Run it with --workers=4 --repeat-each=3: green.
//
// Step 5 · no reset. In tests/auth.setup.ts delete the three lines about the reset: the comment and the two below it.
// Run it three times with --workers=4 --repeat-each=3: 13 passed each time, and the table has 36 candidates afterwards.
