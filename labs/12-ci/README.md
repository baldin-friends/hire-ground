# Case 8 · CI/CD with GitHub Actions

The tests of Cases 1 to 6 as one suite, the pipeline that runs it on GitHub, and what to do when a run fails.

| What | Where |
|---|---|
| the suite: 34 tests in 6 files, in Chromium and Firefox | `solutions/12-ci` |
| the pipeline (GitHub Actions) | `.github/workflows/e2e.yml` |

This folder holds this sheet and `red-run.patch`, a change that breaks one test. Everything runs from `solutions/12-ci`.

## 1 · The suite

```bash
cd solutions/12-ci
npx playwright test --list                 # 35 tests in 7 files: 17 per browser, and the sign-in
npx playwright test                        # 35 passed
npx playwright test --grep @smoke --list   # 7 tests: what a pull request runs
npx playwright test --shard=1/3 --list     # 13 tests. --shard=2/3 and 3/3: 12 each
```

Every test brings its own data (`support/fixtures.ts`), so the order, the number of workers and the number of
machines do not matter. `tests/auth.setup.ts` signs in once per run.

## 2 · What the pipeline changes

Every pipeline sets the variable `CI`. `playwright.config.ts` reads it:

| Setting | On a laptop | With `CI` |
|---|---|---|
| `forbidOnly` | off | a `test.only` that somebody forgot fails the run |
| `retries` | 0 | 2. A test that passes on a retry is reported as flaky |
| `workers` | half of the cores | 2 |
| `trace` | `retain-on-failure` | `on-first-retry` |
| `webServer.reuseExistingServer` | true | false: the run starts its own application |

## 3 · The pipeline

`.github/workflows/e2e.yml`, to be read from top to bottom: every step has a comment. On GitHub: the tab
**Actions**, workflow **e2e**.

**When it runs, and what**

| Lines | What they do |
|---|---|
| `on:` | two triggers: a pull request, and a push to `main` |
| `SELECTION` | the one expression of the file: a pull request runs `--grep @smoke`, a push to `main` runs everything |

**The job `tests`, step by step**

| Step | What it does | Why |
|---|---|---|
| `runs-on: ubuntu-latest` | a new, empty Linux machine for the job | every run starts from the same state; nothing is left from the run before |
| `timeout-minutes: 15` | stops a run that hangs | without it, GitHub waits for 6 hours |
| `container:` | runs the steps inside the Playwright image | the browsers and their system libraries are installed already. The tag must be the version of `@playwright/test` in `package.json`, or the browsers are not found |
| `strategy: matrix: shard: [1, 2, 3]` | starts the job three times at once; `matrix.shard` is 1, 2 or 3 | three machines share the suite |
| `fail-fast: false` | lets the other shards finish when one fails | you want the results of all tests, not of a third |
| `actions/checkout` | gets the code of the commit that started the run | the machine is empty |
| `actions/setup-node` | installs one fixed version of Node.js | the same version in every run |
| `npm ci` | installs the packages exactly as `package-lock.json` lists them | the same Playwright as on every laptop. It fails when the lock file and `package.json` disagree |
| `npm ci --prefix app` | installs the packages of the application under test | the test run starts the application itself (`webServer` in the config) |
| `npx playwright test --shard=N/3` | runs one third of the suite | see "Sharding" below |
| `--reporter=blob,github` | `blob`: the raw result of this shard as a zip file. `github`: failures as annotations on the run | the blob is what the job `report` merges; the annotations show the error without a download |
| `upload-artifact`, `if: ${{ !cancelled() }}` | keeps the blob of this shard | without the `if`, GitHub skips the step after a failed test: the run whose report you need |

**The job `report`** waits for the three shards (`needs: [tests]`), also when one failed. It downloads the three
blobs into one folder, runs `npx playwright merge-reports --reporter html`, and uploads the report as the artifact
`html-report--attempt-1`. The merged report of a full run shows 37 tests, not 35: the sign-in ran once on each of
the three machines.

**Sharding: how it works, why, how it behaves**

| Question | Answer |
|---|---|
| How are the tests split? | `--shard=2/3` runs the second of three parts. With `fullyParallel: true` (this suite) Playwright splits test by test. Without it, whole files go to a shard, and one large file makes one slow shard |
| Is the split the same every time? | Yes, for the same code and the same command: `npx playwright test --shard=1/3 --list` shows it. It goes by the number of tests, not by how long they take |
| Why shards, when there are workers? | Workers share the processor and memory of one machine. Shards add machines. Here: three machines with two workers each |
| What does a shard cost? | Each machine starts, loads the image and installs the packages: about 30 seconds on GitHub before its first test. Each one signs in on its own |
| When does it pay off? | When the tests take minutes. Here the tests of one shard take 10 to 20 seconds, so three shards are no faster than one machine |
| What must the tests do? | Create their own data (Case 7). In this pipeline every machine starts its own application and database. Shards against one shared environment meet like the workers of Case 7 |
| How do I get one report? | Each shard writes a blob report. `merge-reports` builds one HTML report from them, as if one machine had run everything |
| How do I run one shard on my laptop? | `CI=1 PORT=3001 npx playwright test --shard=2/3`: the same tests as machine 2 |

## 4 · A failed run

1. Open the repository on GitHub, click the tab **Actions**, then the run with the red cross. You are on the page
   of the run, and **Summary** is selected on the left. Read it in this order: the jobs (which shard failed), the
   **annotations** (test, file, line, error), the **artifacts** at the bottom.
2. Download the artifact `html-report--attempt-1`.

   With the GitHub CLI, in the repository root. The id of a run is the number at the end of its address:

   ```bash
   gh run download <id> --name html-report--attempt-1 --dir red-report
   npx playwright show-report red-report
   ```

   Without it: click the name of the artifact on the page of the run (that needs a GitHub sign-in), unzip the
   file, and run `npx playwright show-report <folder>`.

3. In the report: open the failed test. It has a screenshot of the page at the moment of the failure, and a tab for
   every attempt. "Retry #1" has the trace: the step that failed, and the page as it was.

| The report says | It means | You |
|---|---|---|
| failed | failed three times in a row | read the trace: the application or the test is wrong |
| flaky | failed, then passed on a retry | read the trace of the failed attempt: a race, or data that tests share |
| did not run | something before it failed, for example the sign-in | repair that first |

## 5 · Reproduce it

**A failed run to practise with.** `red-run.patch` changes one line of the application: salaries in compact
notation, "60K–76K € per year".

```bash
git apply labs/12-ci/red-run.patch                    # in the repository root
cd solutions/12-ci
CI=1 PORT=3001 npx playwright test --grep @smoke      # as the pipeline runs it: 2 failed, 5 passed, after about 40 seconds
npx playwright show-report                            # the failed test: the screenshot, the tab "Retry #1" with the trace
cd ../..
git apply -R labs/12-ci/red-run.patch                 # take the change back
cd solutions/12-ci
CI=1 PORT=3001 npx playwright test --grep @smoke      # 7 passed. This run also builds the application again, without the change
```

With `CI` the run builds and starts its own application, here on port 3001, and stops it afterwards.

**From the cheapest step to the most exact one.** Stop as soon as you see the failure.

```bash
npx playwright test career-page -g salary                         # the one test, on your laptop
npx playwright test -g salary --repeat-each=10                    # a flaky test: ten times
CI=1 PORT=3001 npx playwright test --grep @smoke --shard=2/3      # the command of the pipeline
docker compose run --rm ci npx playwright test --shard=2/3        # in the image of the pipeline (compose.yaml, needs Docker)
```

## 6 · Against another environment

```bash
BASE_URL=https://staging-3.example.com npx playwright test --grep @smoke
BASE_URL=http://localhost:3000 npx playwright test --grep @smoke     # to try it: your own application, by address. 7 passed
```

With `BASE_URL` the config starts no application and runs against that address. In the pipeline the variable goes
into `env:` of `e2e.yml`, and the account for that environment comes from the repository's secrets.

## 7 · To explore: the extended workflow

`.github/workflows/e2e-extended.yml` is the same pipeline with nine additions for a larger project. Each has a
number in the file. It runs only when somebody starts it: tab **Actions**, workflow **e2e-extended**,
**Run workflow**, or `gh workflow run e2e-extended.yml -f args='--grep @smoke'`. In this repository you can read
its runs; to start one, use a fork or your own repository.

| # | Addition | When you want it | Read more |
|---|---|---|---|
| 1 | a manual start with two fields: more arguments, and the address of an environment | "run the smoke tests against staging 3, now" | [workflow_dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch) |
| 2 | a nightly run (switched off: two comment signs) | the whole suite every night, a selection per pull request | [schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) |
| 3 | `permissions: contents: read` | the token of a run can do no more than it needs | [permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions) |
| 4 | `concurrency` with `cancel-in-progress` | many pushes to one branch: only the newest run finishes | [concurrency](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#concurrency) |
| 5 | the account from the secrets of the repository | a deployed environment with its own user. `tests/auth.setup.ts` reads `E2E_USER` and `E2E_PASSWORD` | [secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) |
| 6 | `cache: npm` | `npm ci` downloads nothing that an earlier run has downloaded | [setup-node](https://github.com/actions/setup-node#caching-global-packages-data) |
| 7 | `--fail-on-flaky-tests` | a test that passes only on a retry fails the run | [docs/test-cli](https://playwright.dev/docs/test-cli#all-options) |
| 8 | `--reporter html,junit` in the merge | the results as JUnit XML, for a dashboard or a test management tool | [docs/test-reporters](https://playwright.dev/docs/test-reporters#junit-reporter) |
| 9 | a summary on the page of the run | the two commands that open the report of this run on a laptop | [job summaries](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#adding-a-job-summary) |

## Read more

- CI: https://playwright.dev/docs/ci · https://playwright.dev/docs/ci-intro
- Sharding and merged reports: https://playwright.dev/docs/test-sharding
- Retries and flaky tests: https://playwright.dev/docs/test-retries
- Tags: https://playwright.dev/docs/test-annotations#tag-tests
- The trace viewer: https://playwright.dev/docs/trace-viewer
