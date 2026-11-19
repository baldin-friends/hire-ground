# Case 10 · AI and MCP

Playwright 1.64.1 contains no language model. It contains what a model needs to work in a test suite: a prompt for
every failed test, an MCP server that gives an assistant a browser, and three agents that plan, generate and
repair tests. Four demos show them at work, each with one prompt.

**Time** 60 minutes · on the projector · the demos use Claude Code · every result is also in `solutions/14-agents`

## What is in this folder

| File | What it is |
|---|---|
| `prompts/` | the prompts of demos 2, 3 and 4 |
| `tests/heal-me.spec.ts` | two tests that fail: the material of demos 1 and 4 |
| `tests/seed.spec.ts` | the seed test: the page where the planner and the generator start, signed in |
| `specs/job-administration.plan.md` | a plan the planner wrote on 19 November 2026; a new run replaces it |
| `.mcp.json` | two MCP servers: `playwright` (a browser) and `playwright-test` (the test runner, for the agents) |
| `.claude/agents/` | planner, generator, healer: their instructions, in Markdown |
| `.claude/settings.json` | what Claude Code may start and call in this folder without asking |

Two commands wrote the configuration. The first one replaces `.mcp.json`, so it runs first.

```bash
npx playwright init-agents --loop=claude
claude mcp add -s project playwright -- npx playwright mcp --isolated --browser=chromium
```

- `--isolated`: the browser profile stays in memory. Every session starts signed out.
- `--browser=chromium`: the Chromium that Playwright installed. Without it the server looks for Google Chrome.
- To start signed in, add `--storage-state=playwright/.auth/recruiter.json`: the session the tests saved.
- After a Playwright update, run `init-agents` again: the agent definitions belong to the version.

With VS Code and Copilot: `npx playwright init-agents --loop=vscode` writes `.github/agents/` and
`.vscode/mcp.json`. It needs VS Code 1.105 or later, with `labs/14-agents` opened as the folder.

## Before you start

```bash
cd labs/14-agents
npx playwright test        # 2 failed, 2 passed: the two failures are the material
```

The application runs on port 3000. With another port, change the address in `prompts/write-a-test.md`.

## Demo 1 · a failed test writes its own prompt

No setup. You paste text, and the assistant needs no access to your code.

1. `npx playwright show-report`, open the failed test "a recruiter opens the form for a new job".
2. Click **Copy prompt** and paste it into an assistant.

The prompt holds the error, the page as an aria snapshot, and the source around the failing line. The same text
is a file next to the trace: `error-context.md` in the folder of the test under `test-results`. The trace viewer
has the button too, in its Errors tab.

## Demo 2 · the assistant gets a browser

```bash
claude "$(cat prompts/write-a-test.md)"      # or: start claude and paste the file
```

A Chromium window opens. The assistant signs in as Rita, rejects a candidate once, writes
`tests/reject-a-candidate.spec.ts` with the `applicant` fixture, and runs it twice.
The run of 19 November took four minutes and 23 calls to the browser.

Read the result with Thursday's questions: whose data does it use, does it pass a second time, what does it
assert, does it clean up?

## Demo 3 · a plan, then a test from the plan

```bash
claude "$(cat prompts/plan.md)"              # about two minutes
claude "$(cat prompts/generate.md)"          # about two minutes
```

The planner runs the seed test, explores the job administration and saves `specs/job-administration.plan.md`.
The generator performs the first scenario in a browser and writes `tests/job-administration/save-draft.spec.ts`.

Read the plan before a test is generated from it. The plan of 19 November expects "13 jobs" after saving:
a count of all jobs. The test generated from it passed alone and failed next to the other tests of the folder.
`solutions/14-agents` has that test with four review marks.

## Demo 4 · heal, and what is left for a person

Decide first, for each of the two failures: is the test wrong, or the application?

```bash
claude "$(cat prompts/heal.md)"              # about two minutes
git diff tests/
```

| Test | What is wrong | The healer on 19 November, in two runs |
|---|---|---|
| a recruiter opens the form for a new job | the test: the button "Create job" is a link "New job" now | a new locator |
| one person can apply for two jobs with the same e-mail address | the application: this build has a regression switched on (`unique-email`, see `tests/auth.setup.ts`) | `test.fixme()` and a comment that names the bug |

What the healer cannot do: file the bug. And `test.fixme()` skips the test, so nobody notices when the bug is
fixed. `solutions/14-agents/tests/heal-me.spec.ts` uses `test.fail()` instead: the test still runs.

Put the folder back afterwards: `git checkout . && git clean -fd tests`

## Rules for a team

1. Your rules go into the prompt: the fixture, data of its own, role and name first.
2. A generated plan or test goes through review, like any other code.
3. A healer may change a locator or a wait. A changed expectation is a question to the team.
4. An assistant drives a test system with test accounts, never a browser with real sign-ins. It acts with the
   session its browser has, and it reads every page as text: a page can contain a sentence that reads like an
   instruction.

Every step sends a snapshot of the page to the model. A narrow task with a starting page costs less than
"test the application".

## Read more

- Test agents: <https://playwright.dev/docs/test-agents>
- Playwright MCP: <https://playwright.dev/mcp/introduction> · snapshots: <https://playwright.dev/mcp/snapshots>
- Playwright CLI for coding agents: <https://playwright.dev/agent-cli/introduction>
- Annotations, `test.fail()` and `test.fixme()`: <https://playwright.dev/docs/test-annotations>
- An assistant in the migration from Selenide: `labs/13-migration`
