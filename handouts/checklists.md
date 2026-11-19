# Checklists from the course

One page to keep open. Each list is the last slide of a case; the folder has the example and its sheet.
Course: Playwright · End-to-end testing for web applications · Playwright 1.64 · Node 22+

## Every test · Day 2, Cases 1 to 4

1. A recording is a draft. A test asserts, runs twice, and cleans up.
2. Role and name first. Where the markup has none: CSS on purpose, and one function per component.
3. `expect(locator)` waits. `isVisible()` looks once. For everything off the page: `expect.poll`.
4. Every test creates its own data, through a fixture that also removes it.

Folders: `labs/05-tools`, `06-locators`, `07-assertions`, `08-data`.

## Flaky tests in parallel runs · Case 7

1. Force it: `--workers=4 --repeat-each=5`. A test that fails here will fail in the pipeline.
2. Does the test reset or delete data that other tests use?
3. Does it count or list everything, where it means its own record?
4. Does it change a fixed record that other tests use: a seed candidate, a shared account?
5. The way out: no shared data. Every test creates and removes its own, through a fixture. A test that must see
   everything runs alone.
6. Retries hide the problem. `--fail-on-flaky-tests` turns a flaky run into a failed run.

Folder: `solutions/11-parallel` (`1-flaky`, `2-fixed`).

## CI/CD · Case 8

1. One config for the laptop and the pipeline. `CI` switches five settings.
2. A pull request runs the `@smoke` tests. Everything runs after the merge.
3. Shards make it faster. One job merges their results into one report.
4. A failed run: read the annotations, download the report, open the trace.
5. Reproduce in steps: the one test, repeated, like the pipeline, in the image.

Passes on the laptop, fails in the pipeline? Check:

| The pipeline has | Look for |
|---|---|
| a slower machine with two workers | a race condition: which step in the trace was late? |
| a new database, no saved session | a test that needs data from an earlier run |
| Linux, headless, time zone UTC | fonts and pixels; a date the test builds itself |
| `CI` set | a forgotten `test.only`; a retry that hides a flaky test |

Reproduce, from the cheapest step to the most exact one:

```bash
npx playwright test career-page -g salary                        # the one test, on your laptop
npx playwright test -g salary --repeat-each=10                   # how often does a flaky test fail?
CI=1 PORT=3001 npx playwright test --grep @smoke --shard=2/3     # the command of the pipeline
docker compose run --rm ci npx playwright test --shard=2/3       # in the image of the pipeline
```

Files: `.github/workflows/e2e.yml`, `solutions/12-ci`, `compose.yaml`, the sheet `labs/12-ci/README.md`.

## Migrating from Selenide · Case 9

- Sort before you port: delete what nobody would miss, move rules and calculations down to API tests, port the journeys.
- The ground first: the sign-in, fixtures for your data, one green job in the pipeline.
- One pull request moves one area: it adds the Playwright tests and deletes the Selenide classes of that area.
- A test is rewritten from what it proves. It is done when it passes with `--repeat-each=5 --workers=4` and creates
  its own data.
- An assistant gets your rules file and may run the tests. A person reviews what it wrote.

Files: `handouts/selenide-to-playwright.md`, `labs/13-migration/migration-rules.md`.

## AI in a test suite · Case 10

1. Put your rules into the prompt: the fixture, data of its own, role and name first.
2. Review a generated test like any other code. Run it next to the other tests.
3. Let a healer change a locator or a wait. A changed expectation is a question to the team.
4. Mark a failing test that is right with `test.fail()` and the reason. `test.fixme()` skips it, and nobody notices
   when the bug is gone.
5. Point an assistant at a test system with test accounts, never at a browser with real sign-ins.

Folder: `labs/14-agents` (`.mcp.json`, `prompts/`).
