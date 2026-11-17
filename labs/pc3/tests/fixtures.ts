import { expect, test as base, type BrowserContext } from '@playwright/test';
import { apply, person, type Person } from './data';

type Account = { email: string; name: string };
type Session = Awaited<ReturnType<BrowserContext['storageState']>>;
type Candidate = Person & { id: string; reference: string; jobTitle: string };

// Our users, according to the analytics dashboard: the window sizes they work
// with and the hours at which they visit. Each worker takes one of each, so a
// full run covers all four.
const SCREENS = [
    { width: 1280, height: 720 },
    { width: 820, height: 1180 },
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
];
const HOURS = ['09:00', '13:00', '18:00', '00:30'];

/** Today at the given time of day. */
function todayAt(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

export const test = base.extend<{}, { account: Account; session: Session; candidate: Candidate }>({
    viewport: async ({}, use, testInfo) => {
        await use(SCREENS[testInfo.parallelIndex % SCREENS.length]);
    },

    page: async ({ page }, use, testInfo) => {
        await page.clock.setFixedTime(todayAt(HOURS[testInfo.parallelIndex % HOURS.length]));
        // the consent dialog is not what these tests are about
        await page.addLocatorHandler(page.getByRole('dialog', { name: 'We use cookies' }), async (dialog) => {
            await dialog.getByRole('button', { name: 'Only necessary' }).click();
        });
        await use(page);
    },

    // one recruiter account per worker
    account: [
        async ({}, use, workerInfo) => {
            const n = workerInfo.parallelIndex + 1;
            await use({ email: `recruiter-${n}@hireground.test`, name: `Recruiter ${n}` });
        },
        { scope: 'worker' },
    ],

    // sign in once per worker and keep the session
    session: [
        async ({ browser, account }, use, workerInfo) => {
            const { baseURL, actionTimeout } = workerInfo.project.use;
            const page = await browser.newPage({ baseURL, storageState: undefined });
            page.setDefaultTimeout(actionTimeout!);
            await page.goto('/login');
            await page.getByLabel('Email').fill(account.email);
            await page.getByLabel('Password').fill('hire-ground');
            await page.getByRole('button', { name: 'Sign in' }).click();
            await expect(page.getByText(`Signed in as ${account.name}`)).toBeVisible();
            const session = await page.context().storageState();
            await page.close();
            await use(session);
        },
        { scope: 'worker' },
    ],

    // every test starts signed in; the job pages do not mind
    storageState: async ({ session }, use) => {
        await use(session);
    },

    // one applicant per worker, for the tests that need somebody who is already
    // in the system: applies when the worker starts, withdraws when it stops
    candidate: [
        async ({ playwright }, use, workerInfo) => {
            const api = await playwright.request.newContext({ baseURL: workerInfo.project.use.baseURL });
            const who = person('candidate');
            const { id, reference, withdrawToken } = await apply(api, 'ux-researcher', who);
            await use({ ...who, id, reference, jobTitle: 'UX Researcher' });
            await api.delete(`/api/applications/${id}`, { headers: { 'x-withdraw-token': withdrawToken } });
            await api.dispose();
        },
        { scope: 'worker', auto: true },
    ],
});

export { expect };
