import { expect, test } from '@playwright/test';
import { cv, person } from './data';

// Steps 5 to 9 · five tests, and in none of them the real API has to misbehave.
// Register a route before page.goto: a route only sees requests that start after it exists.

// 1 · stub: answer GET /api/jobs?… with an empty list
test('stub: empty search result', async ({ page }) => {
    // TODO: page.route('**/api/jobs?*', …) with route.fulfill({ json: [] })
    // TODO: open /jobs and expect the text "No jobs found. Try another search."
    throw new Error('TODO: write the steps above, then delete this line');
});

// 2 · patch: fetch the real job, move its deadline into the past
test('patch: the job closed yesterday', async ({ page }) => {
    // TODO: route '**/api/jobs/senior-qa-engineer': route.fetch(), change `deadline` to '2020-01-31', route.fulfill({ response, json })
    // TODO: open /jobs/senior-qa-engineer and expect the button "Applications closed" to be disabled
    throw new Error('TODO: write the steps above, then delete this line');
});

// 3 · break: POST /api/applications answers 503
test('break: the API answers 503', async ({ page }) => {
    // TODO: route '**/api/applications' with route.fulfill({ status: 503 })
    const p = person();
    await page.goto('/jobs/senior-qa-engineer/apply');
    await page.getByLabel('First name').fill(p.firstName);
    await page.getByLabel('Last name').fill(p.lastName);
    await page.getByLabel('Email').fill(p.email);
    await page.getByLabel('CV (PDF or Word, max. 5 MB)').setInputFiles(cv);
    await page.getByRole('checkbox', { name: /stores my data/ }).check();
    await page.getByRole('button', { name: 'Submit application' }).click();
    // TODO: what does the candidate read now? Assert the element with the role "alert".
    throw new Error('TODO: write the steps above, then delete this line');
});

// 4 · spy: change nothing, only look at the request the page sends
test('spy: the filter reaches the API', async ({ page }) => {
    await page.goto('/jobs');
    // TODO: const request = page.waitForRequest(…)   start listening BEFORE the action, without await
    // TODO: choose the location "Dresden"
    // TODO: await the request and assert its URL carries location=Dresden
    throw new Error('TODO: write the steps above, then delete this line');
});

// 5 · API: no browser. The `request` fixture speaks HTTP and knows the baseURL.
test('API: apply and withdraw', async ({ request }) => {
    // TODO: POST /api/applications with  multipart: { jobId: '1', ...person('api'), consent: 'true', cv }  → 201
    // TODO: the response body has { id, withdrawToken }
    // TODO: DELETE /api/applications/<id> with the header 'x-withdraw-token' → 204
    throw new Error('TODO: write the steps above, then delete this line');
});
