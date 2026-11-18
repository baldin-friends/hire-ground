# Case 8 · Three machines, one report

What sharding is, how Playwright splits a suite, and how the pieces become one report again.
Then the pipeline: what a pull request runs, and what runs at night.

**Time** 75 minutes · together, on one screen

## The problem

670 tests at a minute each are eleven hours on one machine, one after another. Workers help as far as the machine
has cores. After that the suite needs more machines. Each machine runs one part of the suite: a **shard**.

Two things follow. Every machine writes its own report, and nobody wants to open ten of them. And a machine in the
pipeline is new: no session file from yesterday, no data that an earlier run left behind, a database that only
this machine uses. A suite that passed case 7 does not notice. A suite that shares data does.

## Warm-up · how the split works

`labs/12-ci` holds a suite of 14 tests in 4 files. `--list` shows what a command would run, without running it.

```bash
cd labs/12-ci
npx playwright test --list                  # 14 tests in 4 files
npx playwright test --shard=1/3 --list      # 6 tests
npx playwright test --shard=2/3 --list      # 8 tests
npx playwright test --shard=3/3 --list      # 0 tests: the third machine has nothing to do
```

Now set `fullyParallel: true` in `playwright.config.ts` and list the three shards again: 5, 5 and 4 tests.

Every machine builds the same list of tests, in the same order, and takes its own part of it. Without
`fullyParallel` a file cannot be cut: the tests of one file stay together, and one large file makes one slow shard.
With `fullyParallel` the cut goes between tests. That only works for tests that do not need their neighbours,
which is what case 7 was about.

## The challenge, part 1 · the red test that is not in the report

`./shard-locally.sh` plays three machines on one laptop. Each shard gets what a machine in the pipeline has: `CI=1`,
its own application on port 3012, and its own empty database. Each shard writes a blob report, and the last step
merges them into one HTML report.

One test of the suite is wrong on purpose (`tests/career-page.spec.ts`, the first test).

```bash
./shard-locally.sh                          # needs bash; on Windows: Git Bash
npx playwright show-report merged-report
```

### Done when

The merged report shows 14 tests, one of them failed, with the trace of its retry. And the same mistake is
repaired in `e2e.yml`.

### Steps

1. Run `./shard-locally.sh`. Which shard is red? Read its output: how often did the test run, and why?
2. Open the merged report. How many tests does it show, and where is the red one?
3. Read `shard-locally.sh`. Which line decides whether a shard's report is collected? Repair it and run the script again.
4. Open the failed test in the merged report, then its trace: the attempt "Retry #1" has one.
5. `e2e.yml` is the same pipeline for GitHub Actions. It loses the red shard's report in three places. Find them.
6. Correct the test (the heading is "Open positions") and run the script once more: three green shards, exit code 0.

## The challenge, part 2 · the gate and the nightly

A pull request should get an answer in minutes. The whole suite may take longer, at night.

1. On the whiteboard, with softgarden's numbers: 670 tests, about a minute each. How many machines with four workers
   does a ten-minute run of everything need? What else could make the gate fast?
2. Choose the three tests of this suite that a pull request must not break. Tag them:
   `test('the career page opens', { tag: '@smoke' }, async ({ page }) => { … })`
3. Check the selection without running it: `npx playwright test --grep @smoke --list`
4. `e2e.yml`, the two TODOs: a pull request runs `--grep @smoke`; a nightly schedule and the main branch run everything.

### Done when

`npx playwright test --grep @smoke --list` shows 3 tests in 3 files, and `e2e.yml` has a gate and a nightly.

## In UI mode and on your laptop

`npx playwright test` in this folder runs the suite the usual way: one application on port 3000, the `list` and
`html` reporters, no retries. Everything that is different in the pipeline hangs on one constant in the config: `CI`.

## Hints

<details>
<summary>Hint 1 · the red shard's report is missing</summary>

A shard with a failing test exits with 1. In a shell, `a && b` runs `b` only when `a` succeeded: the `cp` never
happens for the red shard. Run the copy on its own line.

```bash
CI=1 HG_DB="$PWD/shard-data/shard-$i.db" npx playwright test --shard="$i/$SHARDS" || status=1
cp blob-report/*.zip all-blob-reports/
```

</details>

<details>
<summary>Hint 2 · the three places in e2e.yml</summary>

GitHub Actions skips the steps after a failed step, and a job whose `needs` failed. A matrix cancels its other
jobs when one fails. So:

1. `strategy:` gets `fail-fast: false`: a red shard does not cancel the others.
2. The step `actions/upload-artifact` of the shard gets `if: ${{ !cancelled() }}`.
3. The job `merge-reports` gets `if: ${{ !cancelled() }}`.

</details>

<details>
<summary>Hint 3 · why the test ran three times</summary>

With `CI` set, the config has `retries: 2`. A test that fails runs again, up to twice. The first retry records a
trace (`trace: 'on-first-retry'`). A test that passes on a retry is reported as flaky, and `failOnFlakyTests`
turns that into a red run.

</details>

<details>
<summary>Hint 4 · the arithmetic</summary>

670 minutes of tests in 10 minutes need 67 tests running at the same time. With four workers per machine that
is 17 machines. The other three levers: a selection for the gate (40 tagged tests on 3 machines with four workers
take about 4 minutes), tests that are faster than a minute (no login through the form, data through the API,
no sleeps), and fewer browser tests for things a unit test can check.

</details>

<details>
<summary>Hint 5 · the gate and the nightly in e2e.yml</summary>

```yaml
on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1-5'        # 02:00 UTC, Monday to Friday
  workflow_dispatch:

env:
  SELECTION: ${{ github.event_name == 'pull_request' && '--grep @smoke' || '' }}
```

and in the step that runs the shard: `npx playwright test --shard=… $SELECTION`

</details>

## Done early?

- `./shard-locally.sh 5`: five shards. How many tests does each one get?
- After a red run: `npx playwright test --last-failed` runs only what failed last time.
- `npx playwright test --only-changed --list`: the test files with uncommitted changes. In a pipeline:
  `--only-changed=origin/main`, the files a pull request touched.
- This repository has the pipeline switched on: `.github/workflows/e2e.yml` runs `solutions/12-ci`. Look at the
  Actions tab on GitHub.

## Read more

- Sharding, and the GitHub Actions example this pipeline follows: https://playwright.dev/docs/test-sharding
- Merging blob reports: https://playwright.dev/docs/test-sharding#merge-reports-cli
- The blob reporter: https://playwright.dev/docs/test-reporters#blob-reporter
- Continuous integration, for GitHub Actions, GitLab, Jenkins and others: https://playwright.dev/docs/ci
- The Docker image and its version tag: https://playwright.dev/docs/docker
- Tags and `--grep`: https://playwright.dev/docs/test-annotations#tag-tests
- Retries and flaky tests: https://playwright.dev/docs/test-retries
- All command-line options (`--shard`, `--last-failed`, `--only-changed`, `--forbid-only`): https://playwright.dev/docs/test-cli#all-options
