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
