# Hire Ground · Playwright training

The course app, one folder per case, and a finished solution for each.
Playwright 1.64.1 · Node.js 22.13 or later.

## Start

```bash
npm install          # Playwright, pinned
npm run setup        # the app's packages and three browsers
npm run app          # http://localhost:3000
```

Back after a day off:

```bash
git stash            # only if you changed files
git pull
npm run app
npm run reset        # in a second terminal: the seed data, 12 jobs and 36 candidates
```

Recruiter sign-in: `rita.recruiter@hireground.test` / `hire-ground`

## What is where

| Folder | What |
|---|---|
| `labs/` | one folder per case: a `README.md` (the idea, the commands in order, links to the docs) and the starting state |
| `solutions/` | the same folders, finished |
| `support/` | fixtures that several cases share: written in Case 4 |
| `app/` | Hire Ground, the application under test. `app/README.md` lists its pages, its API, and what is hard to test |
| `handouts/` | pages to keep open: the survival card, structure and config, TypeScript, Selenide to Playwright |
| `.github/workflows/e2e.yml` | the pipeline of this repository: it runs `solutions/12-ci` on GitHub Actions |
| `compose.yaml` | the pipeline's machine on your laptop: `docker compose run --rm ci` |

## The cases

| Day | Case | Folder | The problem |
|---|---|---|---|
| 1 | first steps | `labs/00-setup` … `04-forms`, `pc1` | run tests, write tests, locators, actions, forms |
| 2 | 1 · Tools | `labs/05-tools` | a recording is green, and stays green when the feature breaks |
| 2 | 2 · Locators | `labs/06-locators` | an icon without a name, a dropdown built from `<div>`s |
| 2 | 3 · Assertions | `labs/07-assertions` | the page answers late; a matcher of your own |
| 2 | 4 · Test data | `labs/08-data` | no reset button: fixtures, the API, the database |
| 2 | 5 · Network | `labs/09-network` | what real data cannot show: a failure, a rare answer |
| 2 | 6 · Time | `labs/10-time` | time zones as projects; a clock you control |
| 3 | 7 · Parallel | `labs/11-parallel` | green with one worker, red with four workers on one database |
| 3 | 8 · CI/CD | `labs/12-ci` | the suite in the pipeline; a red run, read and reproduced |
| 3 | 9 · Migration | `labs/13-migration` | from Selenide to Playwright, by hand and with an assistant |
| 3 | 10 · AI and MCP | `labs/14-agents` | an assistant drives the browser, writes a test, repairs a test |
| 3 | bonus | `labs/15-frameworks`, `16-accessibility`, `17-visual` | one spec for three frameworks; a scan; screenshots against a baseline |

On Day 3 every example is finished: read the sheet in `labs/`, run the commands, read the code in `solutions/`.

## Work on a case

```bash
cd labs/06-locators
npx playwright test          # first in a terminal: it signs in and saves the session
npx playwright test --ui     # then UI mode
npx playwright show-report   # the last run, with traces
```

A folder of Day 2 has `tests/1-warm-up.spec.ts`, a small finished example, and `tests/2-challenge.spec.ts`, a test that
shows the problem when it runs. The steps are in the folder's `README.md`.

| If | Then |
|---|---|
| UI mode says "Error reading storage state" | run `npx playwright test` once in a terminal, in that folder |
| the counts are off (37 candidates, 13 jobs) | `npm run reset` |
| a run fails with `ENOENT … test-results` | two runs at the same time (UI mode and a terminal) share one results folder: close one of them |
| port 3000 is taken | `PORT=3001 npm run app` and `PORT=3001 npx playwright test` |
| you want to change the application | `npm run app:dev` starts it with hot reload |
| something on the machine is missing | `npm run preflight` |

The data lives in `app/data/hire-ground.db` (SQLite) and survives a restart. From Case 4 on, tests create and
remove their own data.

MIT licence. The repository is yours to keep.
