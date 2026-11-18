import { test, expect } from '../../../support/fixtures';

// Warm-up: two kinds of "time" in a test. The time zone of the browser, and the clock of the page.

// A fixed instant on purpose: winter time in all three zones.
// 09:00 UTC is 10:00 in Berlin, 04:00 in New York and 18:00 in Tokyo.
const INTERVIEW = '2027-01-15T09:00:00.000Z';

test.describe('time zone', () => {
    test.beforeEach(async ({ request, applicant }) => {
        await request.put(`/api/applications/${applicant.id}/interview`, { data: { startsAt: INTERVIEW } });
    });

    test('a candidate in Berlin reads Berlin time', async ({ page, applicant }) => {
        // the config says timezoneId: 'Europe/Berlin'
        await page.goto(`/status/${applicant.reference}`);

        await expect(page.getByRole('time')).toHaveText('Fri, 15 Jan 2027, 10:00');
        await expect(page.getByText('(Europe/Berlin)')).toBeVisible();
    });

    test.describe('in New York', () => {
        // The time zone is an option of the browser context: per config, per project, per file or per group.
        // https://playwright.dev/docs/emulation#locale--timezone
        test.use({ timezoneId: 'America/New_York' });

        test('a candidate in New York reads New York time', async ({ page, applicant }) => {
            await page.goto(`/status/${applicant.reference}`);

            await expect(page.getByRole('time')).toHaveText('Fri, 15 Jan 2027, 04:00');
            await expect(page.getByText('(America/New_York)')).toBeVisible();
        });
    });
});

test.describe('clock', () => {
    // page.clock replaces Date and the timers of the page. The server keeps living in the present.
    // https://playwright.dev/docs/clock

    test('after 30 minutes without input the recruiter is warned', async ({ page }) => {
        await page.clock.install();
        await page.goto('/recruiter');
        await expect(page.getByRole('heading', { name: 'Pipeline' })).toBeVisible();

        await page.clock.fastForward('30:00'); // 30 minutes pass in a few milliseconds

        await expect(page.getByRole('alertdialog')).toContainText('Your session expires in 2 minutes.');
        // Do not wait for the 32nd minute: the page would sign out, and this session is shared by every test.
        await page.getByRole('button', { name: 'Stay signed in' }).click();
        await expect(page.getByRole('alertdialog')).toBeHidden();
    });

    test('fifteen days from now a new candidate is flagged as waiting', async ({ page, applicant }) => {
        // Case 4 made the application older in the database. Here the browser lives fifteen days ahead.
        await page.clock.install({ time: new Date(Date.now() + 15 * 86_400_000) });

        await page.goto(`/recruiter/candidates?q=${applicant.lastName}`);

        await expect(page.getByRole('row', { name: applicant.name }).getByText('Waiting 15 days')).toBeVisible();
    });
});
