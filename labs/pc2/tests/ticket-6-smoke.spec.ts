import { expect, test } from '@playwright/test';

// Smoke test: the three pages every candidate sees.
const pages = [
    { path: '/jobs', heading: 'Open positions' },
    { path: '/jobs/senior-qa-engineer', heading: 'Senior QA Engineer' },
    { path: '/jobs/senior-qa-engineer/apply', heading: 'Apply for Senior QA Engineer' },
];

test('smoke: the candidate pages load', async ({ page }) => {
    for (const { path, heading } of pages) {
        await page.goto(path, { waitUntil: 'networkidle' });
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    }
});
