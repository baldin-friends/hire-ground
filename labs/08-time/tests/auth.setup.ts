import { expect, test as setup } from '@playwright/test';
import { recruiterState } from './data';

// Sign in once, through the UI, and keep the session for every other test.
setup('sign in as recruiter', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('rita.recruiter@hireground.test');
    await page.getByLabel('Password').fill('hire-ground');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();
    await page.context().storageState({ path: recruiterState });
});
