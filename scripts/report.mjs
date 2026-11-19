#!/usr/bin/env node
// Fetches the report of a pipeline run from GitHub and opens it in the browser. It needs the GitHub CLI, signed in.
//   npm run report                   the last run of the branch you are on
//   npm run report -- 44595763530    the run with this id: the number at the end of its address
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8' }).trim();
let id = process.argv[2];
if (!id) {
    const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
    id = gh('run', 'list', '--workflow', 'e2e.yml', '--branch', branch, '--limit', '1', '--json', 'databaseId', '--jq', '.[0].databaseId');
    if (!id) { console.error(`No pipeline run for the branch ${branch}.`); process.exit(1); }
}
const dir = join('pipeline-report', id);
if (!existsSync(dir)) execFileSync('gh', ['run', 'download', id, '--pattern', 'html-report--attempt-*', '--dir', dir], { stdio: 'inherit' });
const report = join(dir, readdirSync(dir).sort().at(-1)); // the last attempt, if the run was started again
console.log(`The report of run ${id}: ${report}`);
spawnSync('npx', ['playwright', 'show-report', report], { stdio: 'inherit', shell: process.platform === 'win32' });
