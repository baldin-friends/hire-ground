#!/usr/bin/env node
// Pre-flight check for the Playwright training. Run it in the repository root: npm run preflight
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';

const WANT = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).devDependencies['@playwright/test'];
const PORT = Number(process.env.PORT ?? 3000);
let problems = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const warn = (msg, fix) => console.log(`  note  ${msg}\n        ${fix}`);
const bad = (msg, fix) => { problems++; console.log(`  FAIL  ${msg}\n        ${fix}`); };

console.log('\nPlaywright training · pre-flight check\n');

// Node.js
const [major, minor] = process.versions.node.split('.').map(Number);
if (major > 22 || (major === 22 && minor >= 12)) ok(`Node.js ${process.versions.node}`);
else bad(`Node.js ${process.versions.node} is too old`, 'Install Node.js 22.12 or later (https://nodejs.org).');

// git
try { ok(execSync('git --version', { encoding: 'utf8' }).trim()); }
catch { bad('git not found', 'Install git (macOS: xcode-select --install).'); }

// Playwright, pinned
let playwright;
try {
    playwright = await import('@playwright/test');
    const have = JSON.parse(readFileSync(new URL('../node_modules/@playwright/test/package.json', import.meta.url))).version;
    if (have === WANT) ok(`@playwright/test ${have}`);
    else bad(`@playwright/test is ${have}, the course uses ${WANT}`, 'Run: npm ci');
} catch {
    bad('@playwright/test is not installed', 'Run: npm install');
}

// the app's packages
if (existsSync(new URL('../app/node_modules/express', import.meta.url))) ok('Hire Ground packages installed');
else bad('Hire Ground packages are missing', 'Run: npm run setup');

// three browsers: start each one and load a page
if (playwright) {
    for (const name of ['chromium', 'firefox', 'webkit']) {
        try {
            const browser = await playwright[name].launch();
            const page = await browser.newPage();
            await page.setContent('<h1>ready</h1>');
            await page.getByRole('heading', { name: 'ready' }).waitFor({ timeout: 10_000 });
            await browser.close();
            ok(`${name} starts`);
        } catch (e) {
            bad(`${name} does not start`, `Run: npx playwright install ${name}   (${String(e.message).split('\n')[0]})`);
        }
    }
}

// port 3000: free, or Hire Ground already runs there
const health = await fetch(`http://localhost:${PORT}/api/health`).then((r) => r.ok).catch(() => false);
if (health) ok(`Hire Ground answers on port ${PORT}`);
else {
    const free = await new Promise((resolve) => {
        const s = net.createServer().once('error', () => resolve(false)).once('listening', () => s.close(() => resolve(true))).listen(PORT);
    });
    if (free) ok(`port ${PORT} is free`);
    else warn(`port ${PORT} is used by another program`, `Stop it, or use another port for the app and the tests: PORT=3001 npm run app`);
}

// internet (only the example test in Lab 1 needs it)
const online = await fetch('https://playwright.dev', { method: 'HEAD', signal: AbortSignal.timeout(8000) }).then((r) => r.ok).catch(() => false);
if (online) ok('playwright.dev is reachable');
else warn('playwright.dev is not reachable from here', 'Fine for the course; only the example test in Lab 1 needs it.');

console.log(problems === 0 ? '\nReady.\n' : `\nNot ready: ${problems} problem(s). Fix them in the order shown, then run this check again.\n`);
process.exit(problems === 0 ? 0 : 1);
