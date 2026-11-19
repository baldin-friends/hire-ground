# Case 8 · CI/CD with GitHub Actions

The tests of Cases 1 to 6 as one suite, the pipeline that runs it on GitHub, and what to do when a run is red.

| What | Where |
|---|---|
| the suite: 34 tests in 6 files, in Chromium and Firefox | `solutions/12-ci` |
| the pipeline (GitHub Actions) | `.github/workflows/e2e.yml` |
| the pipeline's machine on your laptop (Docker) | `compose.yaml` |
| the report of a pipeline run on your laptop | `npm run report -- <run id>` |

This folder holds this sheet and `red-run.patch`, a change that breaks one test. Everything runs from `solutions/12-ci`.

## 1 · The suite

```bash
cd solutions/12-ci
npx playwright test --list                 # 35 tests in 7 files: 17 per browser, and the sign-in
npx playwright test                        # 35 passed
npx playwright test --grep @smoke --list   # 7 tests: what a pull request runs
npx playwright test --shard=1/3 --list     # 13 tests. --shard=2/3 and 3/3: 12 each
```

| File | Area | From |
|---|---|---|
| `career-page.spec.ts` | the career page, as a visitor | Case 1 |
| `jobs.spec.ts` | the job administration: the form, a new tab, the API | Cases 1, 4, 5 |
| `candidates.spec.ts` | the candidates table: stars, the waiting flag, a patched answer | Cases 2, 4, 5 |
| `stages.spec.ts` | New to Hired; a request that fails | Cases 4, 5 |
| `interviews.spec.ts` | the invitation mail; time zones | Cases 3, 6 |
| `session.spec.ts` | the warning after 30 minutes, with `page.clock` | Case 6 |

Every test brings its own data (`support/fixtures.ts`), so the order, the number of workers and the number of
machines do not matter. `tests/auth.setup.ts` signs in once per run.

## 2 · What the pipeline changes

`playwright.config.ts` reads three variables.

| Variable | Effect |
|---|---|
| `CI` | set by GitHub Actions, GitLab and Jenkins. See the table below |
| `BASE_URL` | the suite runs against that address and starts no application |
| `PORT` | the port of the application this run starts or reuses (default 3000) |

| Setting | On a laptop | With `CI` |
|---|---|---|
| `forbidOnly` | off | a `test.only` that somebody forgot fails the run |
| `retries` | 0 | 2. A test that passes on a retry is reported as flaky |
| `failOnFlakyTests` | off | a flaky test makes the run red |
| `workers` | half of the cores | 2 |
| `trace` | `retain-on-failure` | `on-first-retry` |
| `screenshot`, `video` | off | kept for every failed test |
| `webServer.reuseExistingServer` | true | false: the run starts its own application |

The reporters are not in this list. The config writes `list` and `html`. The pipeline asks for its own on the
command line: `--reporter=blob,github`.

## 3 · The pipeline

`.github/workflows/e2e.yml`, to be read from top to bottom. On GitHub: the tab **Actions** of the repository.

| Job | What it runs | When |
|---|---|---|
| `tests` | the suite `solutions/12-ci`, cut into three shards | always |
| `visual` | the screenshots of `solutions/17-visual` against the baseline images in the repository | always |
| `report` | one HTML report from all results, and a summary on the run and on the pull request | always, also after failures |

| Lines | What they do |
|---|---|
| `on:` | a pull request, a push to `main`, and every night at 02:00 UTC |
| `concurrency:` | a new push to the same branch cancels the run that is still going |
| `SELECTION` | the one expression of the file: a pull request runs `--grep @smoke`, everything else runs everything |
| `container:` | the Playwright image, with the browsers. Its tag is the version of `@playwright/test` in `package.json` |
| `matrix: shard: [1, 2, 3]` | three machines; each runs `--shard=N/3` |
| `fail-fast: false` | a failed shard does not cancel the other two |
| `npm ci`, `npm ci --prefix app` | the image has browsers, not your packages |
| `--reporter=blob,github` | `blob`: the raw result of one job. `github`: failures as annotations on the run |
| `if: ${{ !cancelled() }}` | upload the result also when tests failed: that is the report you need |
| `merge-reports -c …/merge.config.ts` | one HTML report from the three shards and the visual comparison: the artifact `html-report--attempt-1` |
| `scripts/ci-summary.mjs` | the summary: the numbers, every failed test with its error, the command that opens the report |

The merged report of a full run shows 40 tests: 34 of the suite, the sign-in once on each of the three machines, and
three of the visual comparison.

## 4 · A failed run

1. The pull request has a comment from the pipeline: how many tests failed, each one with its file, line and error,
   and the command for step 2. The same summary is on the page of the run.
2. Open the report of that run. It needs the GitHub CLI, signed in:

   ```bash
   npm run report -- <run id>       # the number from the comment; without a number: the last run of your branch
   ```

   By hand: `gh run download <run id> --name html-report--attempt-1 --dir red-report`, then
   `npx playwright show-report red-report`. Or download the artifact in the browser and unzip it.
3. In the report, a failed test has a **screenshot** of the page at the moment of the failure, a **video** of the
   attempt, and a tab for every attempt. "Retry #1" has the **trace**: the step that failed, and the page as it was.
4. A failed test with the tag `visual` has the **image comparison**: Diff, Actual, Expected, Side by side, Slider.

| The report says | It means | You |
|---|---|---|
| failed | failed three times in a row | read the trace: the application or the test is wrong |
| flaky | failed, then passed on a retry | read the trace of the failed attempt. Here the run fails on purpose (`failOnFlakyTests`) |
| did not run | something before it failed, for example the sign-in | repair that first |

A trace file on its own opens with `npx playwright show-trace trace.zip`, or in a browser on https://trace.playwright.dev
(the file stays on your machine).

**The baseline images of the pipeline** are in `solutions/17-visual/tests/__screenshots__/*-linux.png`. The pipeline
made them itself: a baseline belongs to one browser on one platform, so images from a Mac do not fit a Linux machine.
To make them again, start the second workflow by hand (`.github/workflows/baselines.yml`: tab Actions, "baselines",
"Run workflow", or `gh workflow run baselines.yml`), download its artifact `baselines` and commit the images.

## 5 · Reproduce it

**A failed run to practise with.** `red-run.patch` changes one line of the application: salaries in compact notation, "60K–76K € per year".

```bash
git apply labs/12-ci/red-run.patch                    # in the repository root
cd solutions/12-ci
CI=1 PORT=3001 npx playwright test --grep @smoke      # as the pipeline runs it: 2 failed, 5 passed, after about 40 seconds
npx playwright show-report                            # the failed test: screenshot, video, the tab "Retry #1" with the trace
cd ../..
git apply -R labs/12-ci/red-run.patch                 # take the change back
cd solutions/12-ci
CI=1 PORT=3001 npx playwright test --grep @smoke      # 7 passed. This run also builds the application again, without the change
```

With `CI` the run builds and starts its own application, here on port 3001, and stops it afterwards. The failing test
ran three times in each browser: the first attempt and two retries.

**The steps**, from the cheapest to the most exact one. Stop as soon as you see the failure.

```bash
cd solutions/12-ci
npx playwright test career-page -g salary                 # 1 · the one test, on your laptop
npx playwright test --last-failed                         # 2 · what failed in the last run here
npx playwright test -g salary --repeat-each=10            # 3 · a flaky test: ten times
CI=1 PORT=3001 npx playwright test --grep @smoke --shard=2/3   # 4 · the command of the pipeline. With CI it starts its own application, here on a free port
```

5 · The same image as the pipeline, with Docker. In the repository root:

```bash
docker compose run --rm ci                                    # the whole suite: 35 passed
docker compose run --rm ci npx playwright test --grep @smoke  # what a pull request runs
docker compose run --rm ci npx playwright test --shard=2/3    # one shard
docker compose run --rm ci bash                               # a shell in the image
npx playwright show-report                                    # on the laptop: the report of the container
```

The first start installs the packages inside the container (the two `npm ci` steps of the pipeline) and keeps
them in volumes. After a change of `package.json`: `docker compose down --volumes`.
The container has its own database and its own application: yours are not touched.
It uses the Node.js of the image; the pipeline installs Node.js 22 with `setup-node`.
On Linux the files the container writes (`playwright-report`, `test-results`) belong to root.

Green on the laptop and red in the pipeline: what differs.

| Difference | Typical effect |
|---|---|
| a slower machine, two workers | a race that the laptop always wins |
| a new database, no saved session | a test that needed data from an earlier run |
| Linux, headless, time zone UTC | fonts and pixels; a date that the test formats itself |
| `CI` is set | a forgotten `test.only`; retries hide a flaky test unless `failOnFlakyTests` is on |

## 6 · Against another environment

```bash
BASE_URL=https://staging-3.example.com E2E_ENV=@staging-3 E2E_USER=… E2E_PASSWORD=… npx playwright test --grep @smoke
BASE_URL=http://localhost:3000 E2E_ENV=@staging-3 npx playwright test --grep @smoke     # to try it: your own application, by address. 7 passed
```

With `BASE_URL` the config starts no application and leaves out the tests tagged `@db`: they write to the database,
which a test cannot reach on a deployed environment. `E2E_ENV` puts the name of the environment as a tag on every
test (`tag` in the config), so one merged report can hold the results of several environments. The account comes
from the environment. In the pipeline all of them go into `env:` of `e2e.yml` (the commented lines there), the
account from the repository's secrets.

## For your own repository

- Copy `e2e.yml` and `playwright.config.ts`, and change the folder and the start command of the application.
- The image tag and the version of `@playwright/test` change together, in one pull request.
- In the branch protection of `main`, require the checks of this workflow: then a red gate blocks the merge.
- Tag the tests a pull request must never break. Everything else runs after the merge and at night.

## Read more

- CI: https://playwright.dev/docs/ci · https://playwright.dev/docs/ci-intro
- Sharding and merged reports: https://playwright.dev/docs/test-sharding
- Docker: https://playwright.dev/docs/docker
- Retries and flaky tests: https://playwright.dev/docs/test-retries
- Tags: https://playwright.dev/docs/test-annotations#tag-tests
- The trace viewer: https://playwright.dev/docs/trace-viewer
- All command-line options: https://playwright.dev/docs/test-cli#all-options
