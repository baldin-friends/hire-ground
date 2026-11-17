import type { APIRequestContext } from '@playwright/test';
import { expect, test } from './fixtures';

// The seed data has a job for every case. "Recruiter (Tech)" closes on the
// day the data is created, "Working Student People Operations" closed three
// days before that.

/** The last day of "Recruiter (Tech)" as YYYY-MM-DD, and the day after. */
async function lastDay(request: APIRequestContext) {
    const job: { deadline: string } = await (await request.get('/api/jobs/recruiter-tech')).json();
    const next = new Date(`${job.deadline}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    return { day: job.deadline, dayAfter: next.toISOString().slice(0, 10) };
}

test('on its last day a job says "Closes today"', async ({ page }) => {
    await page.goto('/jobs/recruiter-tech');

    await expect(page.getByText('Closes today')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Apply' })).toBeVisible();
});

test('the last day lasts until midnight', async ({ page, request }) => {
    const { day } = await lastDay(request);
    await page.clock.setFixedTime(`${day}T23:59:00`);
    await page.goto('/jobs/recruiter-tech');

    await expect(page.getByText('Closes today')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Apply' })).toBeVisible();
});

test('the morning after, nobody can apply any more', async ({ page, request }) => {
    const { dayAfter } = await lastDay(request);
    await page.clock.setFixedTime(`${dayAfter}T06:00:00`);
    await page.goto('/jobs/recruiter-tech');

    await expect(page.getByRole('button', { name: 'Applications closed' })).toBeDisabled();
    await expect(page.getByRole('link', { name: 'Apply' })).toBeHidden();
});

test('an open job shows its deadline as day.month.year', async ({ page }) => {
    await page.goto('/jobs/senior-qa-engineer');

    await expect(page.getByText(/^Apply by \d{2}\.\d{2}\.\d{4}$/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Apply' })).toBeVisible();
});

test('the job list marks the job that closes today', async ({ page }) => {
    await page.goto('/jobs');

    const card = page.getByRole('article').filter({ hasText: 'Recruiter (Tech)' });
    await expect(card.getByText('Closes today')).toBeVisible();
});
