import { test, expect } from '../../../support/fixtures';

// The candidates table. From Case 2 (locators), Case 4 (own data, the database) and Case 5 (a patched answer).
// Every test brings its own candidate: the applicant fixture creates one before the test and withdraws it afterwards.

test('a new application is in the candidates table', { tag: '@smoke' }, async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('status')).toHaveText('1 candidate');
    await expect(page.getByRole('row', { name: applicant.name })).toBeVisible();
});

test('a candidate gets four stars and a place on the shortlist', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const row = page.getByRole('row', { name: applicant.name });

    // the radios are in a shadow root, and role locators see them
    const fourStars = row.getByRole('radio', { name: '4 stars' });
    await fourStars.click();
    await expect(fourStars).toBeChecked();

    // a button with nothing but an icon
    const star = row.locator('button:has(use[href="#icon-star"])');
    await star.click();
    await expect(star).toHaveAttribute('aria-pressed', 'true');
});

// No API makes an application older: the db fixture writes to the database. The tag says what this test needs:
// against a deployed environment, where the database is out of reach, leave it out with --grep-invert @db
test('a candidate who has waited for more than 14 days is flagged', { tag: '@db' }, async ({ page, applicant, db }) => {
    const sixteenDaysAgo = new Date(Date.now() - 16 * 86_400_000).toISOString();
    db.prepare('UPDATE applications SET created_at = ? WHERE id = ?').run(sixteenDaysAgo, Number(applicant.id));

    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

    await expect(page.getByRole('row', { name: applicant.name }).getByText('Waiting 16 days')).toBeVisible();
});

test('the paging of a large customer: the real answer with two numbers changed', async ({ page }) => {
    // https://playwright.dev/docs/mock#modify-api-responses
    await page.route('**/api/candidates?*', async (route) => {
        const response = await route.fetch(); // the request goes to the real server
        const body = await response.json();
        await route.fulfill({ response, json: { ...body, total: 1234, pages: 124 } });
    });

    await page.goto('/recruiter/candidates');

    await expect(page.getByRole('status')).toHaveText('1234 candidates');
    await expect(page.getByText('Page 1 of 124')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});
