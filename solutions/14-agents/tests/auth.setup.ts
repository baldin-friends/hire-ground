import { test as setup, expect } from '@playwright/test';

// One sign-in for the whole run, as in labs/08-data: https://playwright.dev/docs/auth
setup('sign in as recruiter', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
        data: { email: 'rita.recruiter@hireground.test', password: 'hire-ground' },
    });
    expect(response.ok(), 'the sign-in request').toBeTruthy();

    // The build under test has one regression switched on. README.md, "The second test", says which one.
    // Hire Ground keeps the switch in a cookie, so every test of this folder sees the same build.
    await request.get('/api/config?bugs=unique-email');

    await request.storageState({ path: 'playwright/.auth/recruiter.json' });
});
