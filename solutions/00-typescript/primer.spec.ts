import { expect, test } from '@playwright/test';

// TypeScript warm-up · solution.

type Job = { title: string; location: string; remote: boolean };

const jobs: Job[] = [
    { title: 'Senior QA Engineer', location: 'Dresden', remote: true },
    { title: 'Test Automation Engineer', location: 'Berlin', remote: true },
    { title: 'Frontend Developer', location: 'Dresden', remote: false },
];

test('1 · a constant and a template string', () => {
    const title = 'Senior QA Engineer';
    const location = 'Dresden';

    const headline = `${title} in ${location}`;

    expect(headline).toBe('Senior QA Engineer in Dresden');
});

test('2 · an object and an array', () => {
    const first = jobs[0];

    const whereIsIt = first.location;
    const howMany = jobs.length;

    expect(whereIsIt).toBe('Dresden');
    expect(howMany).toBe(3);
});

test('3 · an arrow function', () => {
    const isRemote = (job: Job) => job.remote;
    const inDresden = (job: Job) => job.location === 'Dresden';

    expect(jobs.filter(isRemote)).toHaveLength(2);
    expect(jobs.filter(inDresden)).toHaveLength(2);
});

test('4 · taking an object apart', () => {
    const describe = ({ title, location }: Job) => `${title}, ${location}`;

    const text = describe(jobs[1]);

    expect(text).toBe('Test Automation Engineer, Berlin');
});

async function countJobs(): Promise<number> {
    await new Promise((done) => setTimeout(done, 200));
    return jobs.length;
}

test('5 · await', async () => {
    const count = await countJobs();

    expect(count).toBe(3);
});
