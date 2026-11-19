import { test, expect, inDays } from '../../../support/fixtures';
import { randomUUID } from 'node:crypto';

// The job administration. From Case 1 (the recording that became a test), Case 4 (the job fixture) and Case 5 (the API test).

test.describe('a job created through the form', () => {
    let title: string;

    test.beforeEach(() => {
        title = `Playwright Engineer ${randomUUID().slice(0, 8)}`; // unique: a second run and a second browser get their own
    });

    // The form created the job, so no fixture knows it: find it by its title and remove it, also after a failure.
    test.afterEach(async ({ request }) => {
        const jobs: { id: string; title: string }[] = await (await request.get('/api/admin/jobs')).json();
        const mine = jobs.find((job) => job.title === title);
        if (mine) await request.delete(`/api/jobs/${mine.id}`);
    });

    test('a published job appears on the career page', async ({ page }) => {
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
});

test('a new job shows up in the job administration', async ({ page, job }) => {
    await page.goto('/recruiter/jobs');

    const row = page.getByRole('row', { name: job.title });
    await expect(row).toBeVisible();
    await expect(row.getByText('Published')).toBeVisible();
});

test('the job administration opens the career page in a new tab', async ({ page, job }) => {
    await page.goto('/recruiter/jobs');

    // The link has target="_blank". Start waiting for the new page before the click.
    // https://playwright.dev/docs/pages#handling-new-pages
    const newTab = page.waitForEvent('popup');
    await page.getByRole('link', { name: job.title }).click();
    const careerPage = await newTab;

    await expect(careerPage.getByRole('heading', { level: 1 })).toHaveText(job.title);
});

test('API: a job needs a title, and a title can be used once', async ({ request, job }) => {
    // No browser in this test: request talks to the API directly, with the recruiter's session.
    // https://playwright.dev/docs/api-testing
    const valid = { team: 'People', location: 'Dresden', salaryMin: 50_000, salaryMax: 60_000, deadline: inDays(30), description: 'Text.' };

    const withoutTitle = await request.post('/api/jobs', { data: { ...valid, title: '' } });
    expect(withoutTitle.status()).toBe(422);
    expect(await withoutTitle.json()).toEqual({ errors: { title: 'Please enter a title.' } });

    const sameTitle = await request.post('/api/jobs', { data: { ...valid, title: job.title } });
    expect(sameTitle.status()).toBe(409);
    expect(await sameTitle.json()).toMatchObject({ error: 'duplicate-title' });
});
