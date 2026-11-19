import { test, expect } from '../../../support/fixtures';

// Warm-up: spy on a request. Nothing is changed; the test only listens.

test('spy: a rating is saved without any message on the page', async ({ page, applicant }) => {
    await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);
    const row = page.getByRole('row', { name: applicant.name });

    // The page gives no sign that the rating was saved. The network does.
    // Start listening BEFORE the click, await the result AFTER it.
    // https://playwright.dev/docs/network#network-events
    const saved = page.waitForResponse(`**/api/applications/${applicant.id}`);
    await row.getByRole('radio', { name: '4 stars' }).click();
    const response = await saved;

    expect(response.request().postDataJSON(), 'what the page sent').toEqual({ rating: 4 });
    expect(response.status(), 'what the server answered').toBe(200);
});
