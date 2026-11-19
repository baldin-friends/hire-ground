// spec: specs/job-administration.plan.md
// seed: tests/seed.spec.ts

// Written by the generator agent on 19 November 2026 from labs/14-agents/specs/job-administration.plan.md.
// A person changed four things afterwards. Each one is marked "review:" with the reason.
// As generated, the test passed alone and failed next to the other tests of this folder.

import { test, expect } from '@playwright/test';
import { inDays } from '../../../../support/fixtures';

test.describe('Job administration', () => {
    test('Create a job and save it as a draft', async ({ page }) => {
        // A different title in every run, the slug is derived from it
        const title = `Draft Job ${Date.now()}`;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        // review: the generator wrote the fixed date 2026-12-31. The application refuses a deadline in the past,
        // so the test would fail from 1 January 2027 on.
        const deadline = inDays(30);

        // 1. Open /recruiter/jobs (seed). Click the link "New job".
        await page.goto('/recruiter/jobs');
        await page.getByRole('link', { name: 'New job' }).click();
        await expect(page).toHaveURL(/\/recruiter\/jobs\/new$/);
        await expect(page.getByRole('heading', { name: 'New job' })).toBeVisible();
        await expect(page.getByRole('link', { name: '← Jobs' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save draft' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();

        // 2. Without filling anything click "Save draft" (negative check).
        await page.getByRole('button', { name: 'Save draft' }).click();
        await expect(page).toHaveURL(/\/recruiter\/jobs\/new$/);
        await expect(page.getByText('Please enter a title.')).toBeVisible();
        await expect(page.getByText('Please choose a team.')).toBeVisible();
        await expect(page.getByText('Please choose a location.')).toBeVisible();
        await expect(page.getByText('Please enter a salary range.')).toBeVisible();
        await expect(page.getByText('Please choose a date.')).toBeVisible();
        await expect(page.getByText('Please describe the job.')).toBeVisible();

        // 3. Fill the form with valid values
        await page.getByRole('textbox', { name: 'Job title' }).fill(title);
        await page.getByLabel('Team').selectOption('QA');
        await page.getByLabel('Location').selectOption('Berlin');
        await page.getByRole('spinbutton', { name: 'From' }).fill('50000');
        await page.getByRole('spinbutton', { name: 'To' }).fill('60000');
        await page.getByRole('textbox', { name: 'Application deadline' }).fill(deadline);
        await page.getByRole('textbox', { name: 'Description' }).fill('Draft scenario job');

        // 4. Click "Save draft".
        await page.getByRole('button', { name: 'Save draft' }).click();
        await expect(page).toHaveURL(/\/recruiter\/jobs$/);
        // review: removed  await expect(page.getByText('13 jobs', { exact: true })).toBeVisible();
        // It counts the jobs of every test: wrong as soon as another test creates a job at the same time.

        const row = page.getByRole('row').filter({ hasText: title });
        await expect(row).toBeVisible();
        // review: removed  await expect(page.getByRole('row').nth(1)).toContainText(title);
        // "Listed first" holds only until another test creates the next job.
        await expect(row.getByRole('cell').nth(1)).toHaveText('QA');
        await expect(row.getByRole('cell').nth(2)).toHaveText('Berlin');
        await expect(row.getByRole('cell').nth(3)).toHaveText(deadline.split('-').reverse().join('.'));
        await expect(row.getByRole('cell').nth(4)).toHaveText('Draft');
        await expect(row.getByRole('cell').nth(5)).toHaveText('0');
        await expect(row.getByRole('button', { name: 'Publish' })).toBeVisible();
        await expect(row.getByRole('button', { name: 'Unpublish' })).toHaveCount(0);
        await expect(row.getByRole('link', { name: title })).toHaveAttribute('href', `/jobs/${slug}`);

        // 5. Cleanup: delete the job via the trash button and "Delete" in the dialog.
        await row.locator('button.icon-btn').click();
        await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
        await expect(row).toHaveCount(0);
        // review: removed  await expect(page.getByText('12 jobs', { exact: true })).toBeVisible();
        // Still open: the job is deleted in the last step, so a run that fails before it leaves a draft behind.
    });
});
