import { test, expect } from '@playwright/test';

// Warm-up: the same question asked in four ways. In labs/07-assertions the first test fails on purpose;
// here it is repaired.

test.beforeEach(async ({ request, page }) => {
    await request.post('/api/test/reset'); // a fresh database for every test; case 4 gets rid of this
    await page.goto('/recruiter/candidates');
});

test('toBeVisible() asks again until the answer is yes', async ({ page }) => {
    const row = page.getByRole('row', { name: 'Ben Braun' });
    await row.locator('button:has(use[href="#icon-star"])').click();

    // The message appears when the server has answered, about 150 ms after the click.
    // A web-first assertion retries for up to five seconds. In Selenide: shouldBe(visible).
    // https://playwright.dev/docs/test-assertions#auto-retrying-assertions
    await expect(page.getByText('Ben Braun added to the shortlist.')).toBeVisible();
});

test('isVisible() is for decisions, not for assertions', async ({ page }) => {
    // isVisible() answers for this very moment. In Selenide: isDisplayed().
    // That is right for a decision: is the banner there or not? Then act on the answer.
    // https://playwright.dev/docs/api/class-locator#locator-is-visible
    const emptyState = page.getByText('No candidates match these filters.');

    if (await emptyState.isVisible()) test.skip(true, 'no candidates in this database');

    await expect(page.getByRole('row', { name: 'Ben Braun' })).toBeVisible();
});

test('expect.poll() asks anything again and again: here, an API', async ({ page, request }) => {
    const row = page.getByRole('row', { name: 'Ben Braun' });
    await row.locator('.hg-select__trigger').click();
    await page.locator('.hg-select__panel').getByText('Interview', { exact: true }).click();

    // The candidate gets a mail. Mail leaves through a queue: one to two seconds later.
    // https://playwright.dev/docs/test-assertions#expectpoll
    await expect
        .poll(
            async () => {
                const response = await request.get('/api/mail', { params: { to: 'ben.braun@example.com' } });
                return (await response.json()).map((mail: { subject: string }) => mail.subject);
            },
            { message: 'mails for Ben Braun', timeout: 10_000 },
        )
        .toContain('Status update: Customer Success Manager');
});

test('toPass() retries a whole block: reload until the mailbox shows the mail', async ({ page }) => {
    const row = page.getByRole('row', { name: 'Ben Braun' });
    await row.locator('.hg-select__trigger').click();
    await page.locator('.hg-select__panel').getByText('Offer', { exact: true }).click();

    // The mailbox page loads its list once. Nothing on the page changes when a mail arrives,
    // so one assertion cannot wait for it: the block reloads and asks again.
    // https://playwright.dev/docs/test-assertions#expecttopass
    await expect(async () => {
        await page.goto('/mailbox');
        await expect(page.getByText('Status update: Customer Success Manager')).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
});

test('expect.soft() reports every difference, not only the first', async ({ page }) => {
    const row = page.getByRole('row', { name: 'Erika Mustermann' });

    // A soft assertion marks the test as failed and lets it go on. The second argument names the fact.
    // https://playwright.dev/docs/test-assertions#soft-assertions
    await expect.soft(row.getByRole('cell', { name: 'Senior QA Engineer' }), 'the job').toBeVisible();
    await expect.soft(row.locator('.hg-select__value'), 'the stage').toHaveText('Screening');
    await expect.soft(row.getByRole('radio', { name: '4 stars' }), 'the rating').toBeChecked();
});
