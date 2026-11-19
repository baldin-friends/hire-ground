import { test, expect } from '@playwright/test';

// These two tests were written against the seed data.
//   npm run reset                         (repository root: a fresh database)
//   npx playwright test 2-challenge       green
//   npx playwright test 2-challenge       run it again
//
// The steps are in README.md. The fixtures for step 2 are in ../fixtures.ts.

test('a candidate goes from New to Hired', async ({ page }) => {
    await page.goto('/recruiter/candidates');
    await expect(page.getByRole('status')).toHaveText('36 candidates');

    const row = page.getByRole('row', { name: 'Hannah Becker' });
    const stage = row.locator('.hg-select__value');
    await expect(stage).toHaveText('New');

    for (const next of ['Screening', 'Interview', 'Offer', 'Hired']) {
        await row.locator('.hg-select__trigger').click();
        await page.locator('.hg-select__panel').getByText(next, { exact: true }).click();
        await expect(page.getByText(`Hannah Becker moved to ${next}.`)).toBeVisible();
    }

    await expect(stage).toHaveText('Hired');
});

test('a new application is in the candidates table', async ({ page, request }) => {
    const response = await request.post('/api/applications', {
        multipart: {
            jobId: '4',
            firstName: 'Max',
            lastName: 'Power',
            email: 'max.power@example.com',
            consent: 'true',
            cv: { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') },
        },
    });
    expect(response.status(), await response.text()).toBe(201);

    await page.goto('/recruiter/candidates');

    await expect(page.getByRole('status')).toHaveText('37 candidates');
    await expect(page.getByRole('row', { name: 'Max Power' })).toBeVisible();
});

// Step 5: no API makes an application older. Use the `db` fixture.
test.fixme('a candidate who has waited for more than 14 days is flagged', async () => {
    // UPDATE applications SET created_at = ? WHERE id = ?
    // then: the row shows "Waiting 16 days"
});

// Step 6: delete through the API, then ask the database.
test.fixme('a withdrawn application is gone from the database', async () => {});

// Step 7: data that was there before the test. Ask the API what is there, then compare the table with it.
test.fixme('the table shows what the API returns', async () => {
    // GET /api/candidates?q=mustermann&sort=name&dir=asc   answers { items, total }
});

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The steps of the challenge as code, ready to copy. Try each step yourself first.
// To use a piece: copy its lines to the place named, select them, and remove the comment (Cmd+/ or Ctrl+/).
// The numbers are the steps in README.md. The finished files: solutions/08-data/fixtures.ts and tests/2-challenge.spec.ts
//
// Step 2 · the fixture applicant. In ../fixtures.ts, in place of the line  throw new Error('TODO: …');
//         const id = randomUUID().slice(0, 8);
//         const person = { firstName: 'Ada', lastName: `Test-${id}`, email: `ada.test-${id}@example.com` };
//         const response = await request.post('/api/applications', {
//             multipart: { jobId: job.id, ...person, consent: 'true', cv: CV },
//         });
//         expect(response.status(), `POST /api/applications: ${await response.text()}`).toBe(201);
//         const created = await response.json();
//
//         await use({ id: created.id, reference: created.reference, ...person, name: `${person.firstName} ${person.lastName}` });
//
//         await request.delete(`/api/applications/${created.id}`);
// In this file, in place of the first line. Without it the tests do not know applicant:
// import { test, expect } from '../fixtures';
// Test 1 asks for the fixture and uses its name in place of 'Hannah Becker', in two places:
// test('a candidate goes from New to Hired', async ({ page, applicant }) => {
//     const row = page.getByRole('row', { name: applicant.name });
//         await expect(page.getByText(`${applicant.name} moved to ${next}.`)).toBeVisible();
// Test 2: delete everything from  const response = …  down to  expect(response.status() …  The fixture has applied already.
// test('a new application is in the candidates table', async ({ page, applicant }) => {
//     await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
// Run it: test 1 is red in a new way. '36 candidates' is 37, because of its own applicant.
//
// Step 3 · no counts, and a search for my candidate. Delete the lines with '36 candidates' and '37 candidates'.
// In both tests, in place of  await page.goto('/recruiter/candidates');
//     await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
// Run it twice: green twice.
//
// Step 4 · four workers. In ../playwright.config.ts delete the line  workers: 1,  Then, in the terminal:
//   npx playwright test --repeat-each=5 --workers=4
// 16 passed, 15 skipped: the three test.fixme, five times each.
//
// Step 5 · in place of the first test.fixme(…) block. Replace it: the same title twice is an error.
// test('a candidate who has waited for more than 14 days is flagged', async ({ page, applicant, db }) => {
//     const sixteenDaysAgo = new Date(Date.now() - 16 * 86_400_000).toISOString();
//     db.prepare('UPDATE applications SET created_at = ? WHERE id = ?').run(sixteenDaysAgo, Number(applicant.id));
//
//     await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
//
//     await expect(page.getByRole('row', { name: applicant.name }).getByText('Waiting 16 days')).toBeVisible();
// });
//
// Step 6 · in place of the second test.fixme(…) line:
// test('a withdrawn application is gone from the database', async ({ request, applicant, db }) => {
//     const response = await request.delete(`/api/applications/${applicant.id}`);
//     expect(response.status()).toBe(204);
//
//     const { n } = db.prepare('SELECT count(*) AS n FROM applications WHERE email = ?').get(applicant.email) as { n: number };
//     expect(n).toBe(0);
// });
//
// Step 7 · in place of the third test.fixme(…) block:
// test('the table shows what the API returns', async ({ page, request }) => {
//     const response = await request.get('/api/candidates', { params: { q: 'mustermann', sort: 'name', dir: 'asc' } });
//     const { items, total } = await response.json();
//     expect(total, 'this test needs at least one match').toBeGreaterThan(0);
//
//     await page.goto('/recruiter/candidates?q=mustermann&sort=name&dir=asc');
//
//     await expect(page.getByRole('status')).toHaveText(`${total} candidate${total === 1 ? '' : 's'}`);
//     const names = items.map((a: { firstName: string; lastName: string }) => `${a.firstName} ${a.lastName}`);
//     // name: /\S/ means "a link with a name". Each row also has a download link that has none.
//     await expect(page.locator('tbody').getByRole('link', { name: /\S/ })).toHaveText(names);
// });
// Then, in the terminal:  npx playwright test --repeat-each=5 --workers=4     31 passed, and no leftovers in the table.
