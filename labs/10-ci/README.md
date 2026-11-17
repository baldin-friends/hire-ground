# Steps 6 and 7 · Ship the suite to the pipeline

The suite moves to the pipeline: four shards, one report, and a trace when a test fails.

**Time** step 6: 12 min, alone · step 7: 25 min, alone or in pairs

## Start here

`labs/10-ci`: the finished suite, a workflow template `e2e.yml` for GitHub Actions with three TODOs, and `shard-locally.sh`.
Step 6 runs on your laptop and needs no pipeline. Step 7 does the same in GitHub Actions. Both end with the same merged report.

## Step 7 · GitHub Actions

1. Get your own copy of this repository on GitHub: fork it, or create an empty repository and push your clone to it.
2. `playwright.config.ts`: on CI, report with `blob` and `github` (the TODO).
3. Copy `labs/10-ci/e2e.yml` to `.github/workflows/e2e.yml` in the repository root and work through its three TODOs: pin the image, shard into four, merge the reports.
4. Break one test on purpose (expect 13 jobs in `tests/jobs.spec.ts`), commit, push, and open the Actions tab.
5. Download the artefact `html-report`, unzip it, and open it: `npx playwright show-report <folder>`.

## Step 6 · Shard on your laptop

1. Break one test on purpose (expect 13 jobs in `tests/jobs.spec.ts`).
2. Read `shard-locally.sh`, then run it: `./shard-locally.sh`. Two shards, two blob reports, one merge.
3. Open the merged report: `npx playwright show-report`.
4. Compare `shard-locally.sh` with `e2e.yml`: which line of the script is which step of the workflow?

## Done when

The test that fails on purpose appears in the merged report, with its trace.

## Stuck?

<details>
<summary>Hint 1 · which image tag?</summary>

The tag is the version of `@playwright/test` in `package.json`, with a `v` in front and the Ubuntu name behind: `v1.64.1-noble`.
If they differ, Playwright cannot find its browsers in the image.

</details>

<details>
<summary>Hint 2 · the report of the red shard is missing</summary>

A shard with a failing test exits with code 1. In a shell, `a && b` skips `b` then; in GitHub Actions, later steps are skipped unless they say
`if: ${{ !cancelled() }}`. The red shard's report is the one you want.

</details>

<details>
<summary>Hint 3 · the merge step</summary>

`npx playwright merge-reports --reporter html ./all-blob-reports`

</details>

## Done early?

Look at the templates for other CI systems in `labs/ci/` (GitLab, Jenkins, Azure DevOps, Bitbucket). What is the same in all of them?
