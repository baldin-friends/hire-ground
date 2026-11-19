import { test, expect } from '@playwright/test';

// Recorded with  npx playwright codegen http://localhost:3000/login  and pasted here unchanged.
// (Your own recording from the session replaces this one: same flow, your clicks.)
//
// The recruiter signs in, creates the job "Playwright Engineer", publishes it and opens it on the career page.
// Run it twice:  npx playwright test 2-challenge   The steps are in README.md.

test.use({ storageState: { cookies: [], origins: [] } }); // the recording signs in by itself

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('rita.recruiter@hireground.test');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('hire-ground');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('navigation', { name: 'Recruiter' }).getByRole('link', { name: 'Jobs' }).click();
  await page.getByRole('link', { name: 'New job' }).click();
  await page.getByRole('textbox', { name: 'Job title' }).click();
  await page.getByRole('textbox', { name: 'Job title' }).fill('Playwright Engineer');
  await page.getByLabel('Team').selectOption('QA');
  await page.getByLabel('Location').selectOption('Berlin');
  await page.getByRole('checkbox', { name: 'Remote possible' }).check();
  await page.getByRole('spinbutton', { name: 'From' }).click();
  await page.getByRole('spinbutton', { name: 'From' }).fill('60000');
  await page.getByRole('spinbutton', { name: 'To' }).click();
  await page.getByRole('spinbutton', { name: 'To' }).fill('75000');
  await page.getByRole('textbox', { name: 'Application deadline' }).fill('2026-12-31');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('You write end-to-end tests.');
  await page.getByRole('textbox', { name: 'Skills' }).click();
  await page.getByRole('textbox', { name: 'Skills' }).fill('Playwright');
  await page.getByRole('textbox', { name: 'Skills' }).press('Enter');
  await page.getByRole('textbox', { name: 'Skills' }).fill('TypeScript');
  await page.getByRole('textbox', { name: 'Skills' }).press('Enter');
  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Jobs' }).click();
  await page.getByRole('link', { name: 'Playwright Engineer' }).click();
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The steps of the challenge as code, ready to copy. Try each step yourself first.
// To use a piece: copy its lines to the place named, select them, and remove the comment (Cmd+/ or Ctrl+/).
// The numbers are the steps in README.md. The finished test: solutions/05-tools/tests/2-challenge.spec.ts
//
// Step 2 · assert. Directly after the click on 'Publish':
//   await expect(page.getByText('Playwright Engineer is published.')).toBeVisible();
// and as the last line of the test:
//   await expect(page.getByRole('heading', { level: 1 })).toHaveText('Playwright Engineer');
// Run it: red. The job of the earlier run is in the way, and now the test says so.
//
// Step 3 · a title no other run has. Under the first import:
// import { randomUUID } from 'node:crypto';
//
// let title: string;
// test.beforeEach(() => {
//     title = `Playwright Engineer ${randomUUID().slice(0, 8)}`;
// });
// and in the test, in four places, title instead of the fixed text:
//   .fill(title)     getByText(`${title} is published.`)     getByRole('link', { name: title })     .toHaveText(title)
// Run it twice: green twice. Every run leaves one more job behind.
//
// Step 4 · remove the sign-in. Delete the line  test.use({ storageState: … })  and, in the test, every line from
// page.goto('http://localhost:3000/login') down to the click on 'New job'. The test now starts with:
//   await page.goto('/recruiter/jobs/new');
//
// Step 5 · remove the job after the test. Under test.beforeEach. It needs the saved session, so step 4 comes first:
// test.afterEach(async ({ request }) => {
//     const jobs: { id: string; title: string }[] = await (await request.get('/api/admin/jobs')).json();
//     const mine = jobs.find((job) => job.title === title);
//     if (mine) await request.delete(`/api/jobs/${mine.id}`);
// });
//
// Step 6 · a deadline that does not expire. Above  let title:
// const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
// and in the test, instead of .fill('2026-12-31'):
//   .fill(inDays(30))
// Then delete the .click() lines that only moved the focus, and give the parts a name:
//   await test.step('publish', async () => {
//     …the lines that belong together…
//   });
