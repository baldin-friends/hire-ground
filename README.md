# Hire Ground · Playwright training

Everything for the three days: the course app, the labs, the pair challenges and the handouts.
Playwright 1.64.1 · Node.js 22.12 or later · macOS, Linux or Windows.

## Setup, once

```bash
git clone https://github.com/baldin-friends/hire-ground.git
cd hire-ground
npm install             # Playwright 1.64.1, pinned
npm run setup           # the app's packages, and three browsers (about 600 MB)
npm run preflight       # checks everything the course needs; ends with "Ready."
```

Then start the app and open http://localhost:3000/jobs:

```bash
npm run app
```

## What is where

| Folder | What |
|---|---|
| `app/` | Hire Ground: a small job board with an applicant pipeline, and 17 teaching bugs that are off until a lab switches one on |
| `labs/` | one folder per lab, each with a `README.md` (the task, the steps, hints) and a starting point with TODOs |
| `labs/pc1`, `pc2`, `pc3` | the three pair challenges |
| `solutions/` | one finished version per lab. Look after you tried; the hints in the lab sheet come first |
| `handouts/` | the survival card and the reference sheets |
| `board/` | a small sorting board for group work: `npm run board`, then open the address it prints |

## The labs

| Day | Step or lab | Folder | You build |
|---|---|---|---|
| 1 | setup check | `labs/00-setup` | the application runs on your machine |
| 1 | steps 1–4 | `labs/01-first-run` | a green run in three browsers, UI mode, then a first test of your own |
| 1 | step 5 | `board/` | which checks deserve a browser test: sorted in groups, on the board |
| 1 | step 6 | `labs/02-setup` | a config that starts the application by itself |
| 1 | steps 7–9 | `labs/03-locators` | locators by role, label and text; a search test without sleeps |
| 1 | step 10 | `labs/04-forms` | an application with a CV upload |
| 1 | PC1 | `labs/pc1` | pair programming: locator traps |
| 1 | optional | `labs/00-typescript` | a warm-up for everybody who is new to TypeScript or `async`/`await` |
| 2 | steps 1–4 | `labs/05-evidence` | failures, diagnosed from the trace alone |
| 2 | steps 5–9 | `labs/06-network` | stub, patch, break and spy on the API; one API test |
| 2 | steps 10–12 | `labs/07-reuse` | one login for all tests, a page object, a fixture |
| 2 | steps 14–15 | `labs/08-time` | thirty minutes in seconds; a mail that arrives late |
| 2 | PC2 | `labs/pc2` | pair challenge: six failed CI runs, solved from the evidence |
| 3 | steps 1–4 | `labs/09-parallel` | the suite with four workers, shuffled, still green |
| 3 | steps 6–7 | `labs/10-ci` | shards and one merged report, on your laptop and in a pipeline |
| 3 | steps 8–9 | `labs/11-frameworks` | one test for React, Angular and Vue |
| 3 | step 10 | `labs/12-accessibility` | an accessibility scan, and the fix |
| 3 | PC3 | `labs/pc3` | pair challenge: the flaky hunt |

Every lab starts from a working state. If one lab did not go well, the next one is not affected.

## How to work in a lab

```bash
cd labs/03-locators
npx playwright test                  # run the tests of this lab; the app starts by itself (from step 6 on)
npx playwright test --ui             # watch, step through, pick locators
npx playwright show-report           # the last run, with traces
```

A skeleton test ends with a line that throws `TODO`. Write your steps above it, then delete it.
Reports and traces of the last run land in `playwright-report/` and `test-results/` in the repository root.

Useful once in a while:

| You want | Command |
|---|---|
| the app in a terminal of its own | `npm run app` |
| the app back to its original data | `npm run reset` |
| another port, because 3000 is taken | `PORT=3001 npm run app` and `PORT=3001 npx playwright test` |
| check the machine again | `npm run preflight` |

## Accounts in Hire Ground

Password for all: `hire-ground`

- `rita.recruiter@hireground.test`, the recruiter
- `adam.admin@hireground.test`
- `recruiter-1@hireground.test` to `recruiter-8@hireground.test`, one per parallel worker

The test mailbox shows every mail the app sends: http://localhost:3000/mailbox

## Teaching bugs

All off by default. A test switches one on for its own browser context with `?bugs=` on the first URL:
`page.goto('/jobs?bugs=slow-search')`. The lab sheets and tickets say which one is meant for you.
`app/README.md` has the list and the API.

## After the course

The repository stays online and is yours to keep, app and solutions included (MIT licence).
`handouts/` has the survival card; the slides of each day come as PDF.
