import { expect, test } from '@playwright/test';

// Two jobs that exist only in this test, so the list does not depend on the seed.
const job = (id: string, title: string, location: string) => ({
    id,
    slug: title.toLowerCase().replaceAll(' ', '-'),
    title,
    team: 'QA',
    location,
    remote: false,
    salaryMin: 52000,
    salaryMax: 64000,
    deadline: '2030-12-31',
    summary: '',
    description: [],
    requirements: [],
});
const stubbedJobs = [job('901', 'Release Manager', 'Dresden'), job('902', 'Test Data Engineer', 'Berlin')];

test('the job list shows what the API returns', async ({ page }) => {
    await page.goto('/jobs');
    await page.route('**/api/jobs?*', (route) => route.fulfill({ json: stubbedJobs }));

    await expect(page.getByRole('status')).toHaveText('2 jobs');
    await expect(page.getByRole('link', { name: 'Release Manager' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Test Data Engineer' })).toBeVisible();
});
