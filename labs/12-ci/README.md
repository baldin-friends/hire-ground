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

`.github/workflows/e2e.yml`, to be read from top to bottom. On GitHub: the tab **Actions** of the repository.

| Lines | What they do |
|---|---|
| `on:` | a pull request, and a push to `main` |
| `SELECTION` | the one expression of the file: a pull request runs `--grep @smoke`, a push to `main` runs everything |
| `container:` | the Playwright image, with the browsers. Its tag is the version of `@playwright/test` in `package.json` |
| `matrix: shard: [1, 2, 3]` | three machines; each runs `--shard=N/3` |
| `fail-fast: false` | a failed shard does not cancel the other two |
| `npm ci`, `npm ci --prefix app` | the image has browsers, not your packages |
| `--reporter=blob,github` | `blob`: the raw result of one shard. `github`: failures as annotations on the run |
| `if: ${{ !cancelled() }}` | upload the result also when tests failed: that is the report you need |
| job `report` | downloads the three blobs and writes one HTML report: the artifact `html-report--attempt-1` |

The merged report of a full run shows 37 tests, not 35: the sign-in ran once on each of the three machines.

## 4 · A failed run

1. Open the run on GitHub (from the pull request: **Details** on a failed check, then **Summary**). It lists the
   jobs, the **annotations** (test, file, line, error) and the **artifacts**.
2. Download the artifact `html-report--attempt-1`, in the browser or with the GitHub CLI:

   ```bash
   gh run list --limit 5                       # the runs and their ids
   gh run download <id> --name html-report--attempt-1 --dir red-report
   npx playwright show-report red-report
   ```

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

## Read more

- CI: https://playwright.dev/docs/ci · https://playwright.dev/docs/ci-intro
- Sharding and merged reports: https://playwright.dev/docs/test-sharding
- Retries and flaky tests: https://playwright.dev/docs/test-retries
- Tags: https://playwright.dev/docs/test-annotations#tag-tests
- The trace viewer: https://playwright.dev/docs/trace-viewer
