import { expect, test as setup } from '@playwright/test';
import { recruiterState } from './data';

// Step 1 · sign in once, through the UI, and keep the session for every other test.
// Account: rita.recruiter@hireground.test · password: hire-ground
setup('sign in as recruiter', async ({ page }) => {
    await page.goto('/login');
    // TODO: fill "Email" and "Password", press "Sign in"
    // TODO: wait until you are in: the heading "Pipeline" is visible
    // TODO: save the session:  await page.context().storageState({ path: recruiterState });
    throw new Error('TODO: write the steps above, then delete this line');
});
