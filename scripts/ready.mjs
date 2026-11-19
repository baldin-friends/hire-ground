#!/usr/bin/env node
// Is this machine ready for Day 3? Run it in the repository root, with Hire Ground running: npm run ready
// Every line that is not "ok" says what to do. "note" lines are optional parts of the day.
import { execFileSync, spawnSync } from 'node:child_process';

const PORT = Number(process.env.PORT ?? 3000);
const app = `http://localhost:${PORT}`;
let problems = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const note = (msg, why) => console.log(`  note  ${msg}\n        ${why}`);
const bad = (msg, fix) => { problems++; console.log(`  FAIL  ${msg}\n        ${fix}`); };
const run = (cmd, args, options = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32', ...options });

console.log('\nReady for Day 3?\n');

// 1 · the repository has today's folders
const fetched = run('git', ['fetch', '--quiet', 'origin', 'main']);
const behind = run('git', ['rev-list', '--count', 'HEAD..origin/main']).stdout?.trim();
if (fetched.status !== 0) note('could not ask GitHub for the newest state', 'No network? Go on if you pulled this morning.');
else if (behind === '0') ok('the repository is up to date');
else bad(`the repository is ${behind} commit(s) behind`, 'Run: git stash   (only if you changed files), then: git pull');

// 2 · the application runs, with the seed data
const health = await fetch(`${app}/api/health`).then((r) => r.ok).catch(() => false);
if (!health) bad(`Hire Ground does not answer on port ${PORT}`, 'Run in another terminal, and leave it running: npm run app');
else {
    const login = await fetch(`${app}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'rita.recruiter@hireground.test', password: 'hire-ground' }),
    });
    const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
    const jobs = await fetch(`${app}/api/admin/jobs`, { headers: { cookie } }).then((r) => r.json()).catch(() => []);
    const candidates = await fetch(`${app}/api/candidates`, { headers: { cookie } }).then((r) => r.json()).catch(() => ({}));
    if (jobs.length === 12 && candidates.total === 36) ok(`Hire Ground runs on port ${PORT}, with the seed data: 12 jobs, 36 candidates`);
    else bad(`Hire Ground runs, but with data from earlier runs: ${jobs.length} jobs, ${candidates.total} candidates`, 'Run: npm run reset');
}

// 3 · a real test, in both browsers of today
if (health) {
    const test = run('npx', ['playwright', 'test', '2-fixed', '--reporter=line'], { cwd: new URL('../solutions/11-parallel/', import.meta.url), env: { ...process.env, PORT: String(PORT) } });
    const output = `${test.stdout}${test.stderr}`;
    if (test.status === 0) ok('a test passes in Chromium and in Firefox');
    else if (/Executable doesn't exist/.test(output)) bad('a browser is not installed', 'Run: npx playwright install chromium firefox');
    else bad('the test in solutions/11-parallel fails', `Run it to see why: cd solutions/11-parallel, then: npx playwright test 2-fixed\n        ${output.trim().split('\n').slice(-3).join('\n        ')}`);
}

// 4 · optional: Docker and the GitHub CLI
const docker = run('docker', ['info', '--format', '{{.ServerVersion}}']);
if (docker.status === 0) {
    const image = run('docker', ['image', 'inspect', 'mcr.microsoft.com/playwright:v1.64.1-noble', '--format', 'ok']);
    if (image.status === 0) ok('Docker runs, and the image of the pipeline is here');
    else note('Docker runs, the image of the pipeline is not here yet', 'For the Docker slide at 11:00, start now (2.5 GB): docker pull mcr.microsoft.com/playwright:v1.64.1-noble');
} else note('Docker is not running', 'Only needed to follow the Docker slide on your own machine. The trainer shows it.');
const gh = run('gh', ['auth', 'status']);
if (gh.status === 0) ok('the GitHub CLI is signed in');
else note('the GitHub CLI is missing or signed out', 'Only needed for "npm run report". The browser shows the same pages.');

console.log(problems === 0 ? '\nReady.\n' : `\nNot ready: ${problems} thing(s) to do. Do them in the order shown, then run this check again.\n`);
process.exit(problems === 0 ? 0 : 1);
