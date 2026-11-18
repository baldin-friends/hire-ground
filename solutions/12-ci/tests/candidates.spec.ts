import { test, expect } from '../../../support/fixtures.per-worker';
import type { Locator } from '@playwright/test';

// The candidates table. Every test brings its own candidate (applicant fixture, case 4)
// and runs with the account of its worker (case 7): the tests share nothing, on one machine or on ten.

/** The star in a row of the candidates table: an icon without a name (case 2). */
const star = (row: Locator) => row.locator('button:has(use[href="#icon-star"])');

test('a new application arrives in the table', { tag: '@smoke' }, async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    await expect(page.getByRole('status')).toHaveText('1 candidate');
    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});

test('a candidate can be put on the shortlist', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const button = star(page.getByRole('row', { name: applicant.name }));
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
});

test('a candidate can be taken off the shortlist', async ({ page, request, applicant }) => {
    await request.patch(`/api/applications/${applicant.id}`, { data: { shortlisted: true } });

    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const button = star(page.getByRole('row', { name: applicant.name }));
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('the filter shows the shortlisted candidates only', async ({ page, request, applicant }) => {
    await request.patch(`/api/applications/${applicant.id}`, { data: { shortlisted: true } });

    await page.goto(`/recruiter/candidates?shortlisted=1&q=${applicant.lastName}`);
    await expect(page.getByRole('checkbox', { name: 'Shortlisted only' })).toBeChecked();
    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});
