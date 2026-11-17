import { expect, test } from '@playwright/test';
import { cv, person } from './data';

// 1 · stub: the API never answers; the route does.
test('stub: empty search result', async ({ page }) => {
    await page.route('**/api/jobs?*', (route) => route.fulfill({ json: [] }));
    await page.goto('/jobs');
    await expect(page.getByText('No jobs found. Try another search.')).toBeVisible();
});

// 2 · patch: take the real response and change one field.
test('patch: the job closed yesterday', async ({ page }) => {
    await page.route('**/api/jobs/senior-qa-engineer', async (route) => {
        const response = await route.fetch();
        const job = await response.json();
        await route.fulfill({ response, json: { ...job, deadline: '2020-01-31' } });
    });
    await page.goto('/jobs/senior-qa-engineer');
    await expect(page.getByRole('button', { name: 'Applications closed' })).toBeDisabled();
});

// 3 · break: the API answers 503.
test('break: the API answers 503', async ({ page }) => {
    await page.route('**/api/applications', (route) => route.fulfill({ status: 503 }));
    const p = person();
    await page.goto('/jobs/senior-qa-engineer/apply');
    await page.getByLabel('First name').fill(p.firstName);
    await page.getByLabel('Last name').fill(p.lastName);
    await page.getByLabel('Email').fill(p.email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();
    await page.getByRole('button', { name: 'Submit application' }).click();
    await expect(page.getByRole('alert')).toHaveText('Something went wrong. Please try again.');
});

// 4 · spy: nothing is changed, only observed. Start listening before the action.
test('spy: the filter reaches the API', async ({ page }) => {
    await page.goto('/jobs');
    const request = page.waitForRequest((r) => r.url().includes('/api/jobs?') && r.url().includes('location='));
    await page.getByRole('combobox', { name: 'Location' }).selectOption('Dresden');
    const url = new URL((await request).url());
    expect(url.searchParams.get('location')).toBe('Dresden');
});

// 5 · API: no browser at all.
test('API: apply and withdraw', async ({ request }) => {
    const created = await request.post('/api/applications', {
        multipart: { jobId: '1', ...person('api'), consent: 'true', cv },
    });
    expect(created.status()).toBe(201);
    const { id, withdrawToken } = await created.json();

    const withdrawn = await request.delete(`/api/applications/${id}`, { headers: { 'x-withdraw-token': withdrawToken } });
    expect(withdrawn.status()).toBe(204);
});
