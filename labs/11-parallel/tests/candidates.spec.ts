import { test, expect } from '../fixtures';

// One test. Two of its lines depend on what other tests do to the database: they are marked.
//
//   npx playwright test --workers=1 --repeat-each=3     passes
//   npx playwright test --workers=4 --repeat-each=3     fails, and not the same way every time
//
// The repaired test: solutions/11-parallel/tests/candidates.spec.ts

test.beforeEach(async ({ request }) => {
    await request.post('/api/test/reset'); // 1 · puts the whole database back to the seed data
});

test('a new application is in the candidates table', async ({ page, applicant }) => {
    await page.goto('/recruiter/candidates');

    await expect(page.getByRole('status')).toHaveText('37 candidates'); // 2 · counts all candidates: 36 from the seed data and this one
    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});
