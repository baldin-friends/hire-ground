import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

// The recording, turned into a test worth keeping. What changed, and why:
//   1. it asserts: the message after Publish, the card on the career page, the heading of the job page
//   2. it can run twice: the title is unique, and the job is removed afterwards
//   3. it does not sign in: the saved session from the setup project does (playwright.config.ts)
//   4. it has no date that expires: the deadline is "30 days from today"
//   5. it has no clicks that only moved the focus, and its steps have names: they show in the report and the trace

/** A date as YYYY-MM-DD, n days from today. */
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

let title: string;

test.beforeEach(() => {
    title = `Playwright Engineer ${randomUUID().slice(0, 8)}`;
});

// Remove what the test created, also when it failed. Case 4 turns this into a fixture.
test.afterEach(async ({ request }) => {
    const jobs: { id: string; title: string }[] = await (await request.get('/api/admin/jobs')).json();
    const mine = jobs.find((job) => job.title === title);
    if (mine) await request.delete(`/api/jobs/${mine.id}`);
});

test('a published job appears on the career page', async ({ page }) => {
    // https://playwright.dev/docs/api/class-test#test-step
    await test.step('fill in the job form', async () => {
        await page.goto('/recruiter/jobs/new');
        await page.getByLabel('Job title').fill(title);
        await page.getByLabel('Team').selectOption('QA');
        await page.getByLabel('Location').selectOption('Berlin');
        await page.getByLabel('Remote possible').check();
        await page.getByLabel('From').fill('60000');
        await page.getByLabel('To').fill('75000');
        await page.getByLabel('Application deadline').fill(inDays(30));
        await page.getByRole('textbox', { name: 'Description' }).fill('You write end-to-end tests.');
        await page.getByLabel('Skills').fill('Playwright');
        await page.getByLabel('Skills').press('Enter');
    });

    await test.step('publish', async () => {
        await page.getByRole('button', { name: 'Publish' }).click();
        await expect(page.getByText(`${title} is published.`)).toBeVisible();
    });

    await test.step('the career page lists the job', async () => {
        await page.goto('/jobs');
        const card = page.getByRole('article', { name: title });
        await expect(card).toContainText('60.000–75.000 € per year');
        await card.getByRole('link', { name: title }).click();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    });
});

test('the job administration opens the career page in a new tab', async ({ page, request }) => {
    // Setup through the API: this test is about the new tab, not about the form.
    const response = await request.post('/api/jobs', {
        data: { title, team: 'QA', location: 'Berlin', salaryMin: 60_000, salaryMax: 75_000, deadline: inDays(30), description: 'You write end-to-end tests.', status: 'published' },
    });
    expect(response.status()).toBe(201);
    await page.goto('/recruiter/jobs');

    // The link has target="_blank". Start waiting for the new page before the click.
    // https://playwright.dev/docs/pages#handling-new-pages
    const newTab = page.waitForEvent('popup');
    await page.getByRole('link', { name: title }).click();
    const careerPage = await newTab;

    await expect(careerPage.getByRole('heading', { level: 1 })).toHaveText(title);
});
