#!/usr/bin/env node
// Writes the summary of a pipeline run as Markdown: the numbers, every failed test with its error, and the command
// that opens the report. The pipeline puts it on the page of the run and, for a pull request, into a comment.
//   node scripts/ci-summary.mjs results.json <run id>  >  summary.md
import { readFileSync } from 'node:fs';

const [file, runId] = process.argv.slice(2);
const report = JSON.parse(readFileSync(file, 'utf8'));
const failed = [];
const flaky = [];
const visit = (suite) => {
    for (const spec of suite.specs ?? []) {
        for (const test of spec.tests) {
            if (test.status !== 'unexpected' && test.status !== 'flaky') continue;
            const error = test.results.find((r) => r.error)?.error?.message ?? '';
            const line = error.replace(/\u001b\[[0-9;]*m/g, '').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 2).join(' · ');
            (test.status === 'flaky' ? flaky : failed).push(`- **${spec.title}** (${test.projectName}, \`${spec.file}:${spec.line}\`)\n  ${line}`);
        }
    }
    (suite.suites ?? []).forEach(visit);
};
report.suites.forEach(visit);

const { expected, unexpected, flaky: flakyCount, skipped } = report.stats;
const out = [`### End-to-end tests: ${unexpected} failed, ${flakyCount} flaky, ${expected} passed, ${skipped} skipped`, ''];
if (failed.length) out.push('**Failed**', '', ...failed, '');
if (flaky.length) out.push('**Flaky: failed first, passed on a retry**', '', ...flaky, '');
out.push('The report, with a screenshot, a video and the trace of every failed test, and the image of every visual difference:', '', '```', `npm run report -- ${runId}`, '```');
console.log(out.join('\n'));
