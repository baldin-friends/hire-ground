import { expect, test } from '@playwright/test';

// TypeScript warm-up · five small tests, no browser.
// Each test is red. Change the line marked TODO until it is green. Run:  npx playwright test

type Job = { title: string; location: string; remote: boolean };

const jobs: Job[] = [
    { title: 'Senior QA Engineer', location: 'Dresden', remote: true },
    { title: 'Test Automation Engineer', location: 'Berlin', remote: true },
    { title: 'Frontend Developer', location: 'Dresden', remote: false },
];

test('1 · a constant and a template string', () => {
    const title = 'Senior QA Engineer';
    const location = 'Dresden';

    // TODO: build the text from the two constants: `${...} in ${...}`
    const headline = '';

    expect(headline).toBe('Senior QA Engineer in Dresden');
});

test('2 · an object and an array', () => {
    const first = jobs[0];

    // TODO: read the location of the first job: first.location
    const whereIsIt = '';

    // TODO: count the jobs: jobs.length
    const howMany = 0;

    expect(whereIsIt).toBe('Dresden');
    expect(howMany).toBe(3);
});

test('3 · an arrow function', () => {
    // an arrow function: (input) => result
    const isRemote = (job: Job) => job.remote;

    // TODO: write inDresden the same way: true when job.location is 'Dresden'
    const inDresden = (job: Job) => false;

    expect(jobs.filter(isRemote)).toHaveLength(2);
    expect(jobs.filter(inDresden)).toHaveLength(2);
});

test('4 · taking an object apart', () => {
    // { title, location } takes two properties out of the object. Playwright tests start the same way: async ({ page }) => …
    const describe = ({ title, location }: Job) => `${title}, ${location}`;

    // TODO: call describe with the second job: jobs[1]
    const text = describe(jobs[0]);

    expect(text).toBe('Test Automation Engineer, Berlin');
});

// This function answers later, like a browser does. It returns a promise.
async function countJobs(): Promise<number> {
    await new Promise((done) => setTimeout(done, 200));
    return jobs.length;
}

test('5 · await', async () => {
    // TODO: one word is missing in the next line. Without it, count is a promise, not a number.
    const count = countJobs();

    expect(count).toBe(3);
});
