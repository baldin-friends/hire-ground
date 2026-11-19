# Case 10 · AI and MCP

Playwright 1.64.1 contains no language model. It has what a model needs to work on tests: a prompt for every
failed test, an MCP server that gives an assistant a browser, and an agent that repairs failed tests: the healer.

**Time** 60 minutes · on the projector · the demos use Claude Code · every result is also in `solutions/14-agents`

## The three demos

Run the commands in `labs/14-agents`. The application runs on port 3000.

| Demo | Command | You should see |
|---|---|---|
| 1 | `npx playwright test` | 2 failed, 1 passed. The two failures are on purpose |
| 1 | `npx playwright show-report` | the report. Open "a recruiter opens the form for a new job", click **Copy prompt** and paste the text into an assistant: it answers with the new locator |
| 2 | `claude "$(cat prompts/write-a-test.md)"` | a Chromium window: the assistant signs in and rejects a candidate. After about four minutes: a new file `tests/reject-a-candidate.spec.ts` that passed twice |
| 3 | `claude "$(cat prompts/heal.md)"` | after about two minutes: the healer says what it changed |
| 3 | `git diff tests/` | test 1 has a new locator. Test 2 is marked `test.fixme()`, with a comment that names the bug |

- Demo 1 needs no setup. The prompt holds the error, the page as an aria snapshot, and the source around the
  failing line.
- Demo 2: read the new test with Thursday's questions. Whose data does it use, does it pass a second time, what
  does it assert?
- Demo 3: decide before the healer runs. For each failure: is the test wrong, or the application?

Put the folder back afterwards: `git checkout . && git clean -fd tests`

## The second test

`one person can apply for two jobs with the same e-mail address` is right, and the application is wrong. This
folder runs a build with one regression switched on: `unique-email`, see `tests/auth.setup.ts`.

The healer marks the test `test.fixme()`. That skips the test, so nobody notices when the bug is fixed.
`solutions/14-agents/tests/heal-me.spec.ts` uses `test.fail()` with the reason: the test still runs.

## What is in this folder

| File | What it is |
|---|---|
| `tests/heal-me.spec.ts` | two tests that fail: the material of demos 1 and 3 |
| `prompts/` | the prompts of demos 2 and 3 |
| `.mcp.json` | two MCP servers: `playwright` (the browser) and `playwright-test` (the test runner, for the agents) |
| `.claude/agents/` | the agents that `init-agents` installs, one Markdown file each. Demo 3 uses the healer |
| `.claude/settings.json` | what Claude Code may start and call in this folder without asking |

## The setup, for your own project

```bash
npx playwright init-agents --loop=claude
claude mcp add -s project playwright -- npx playwright mcp --isolated --browser=chromium
```

- Keep this order: the first command replaces `.mcp.json`.
- `--isolated`: the browser profile stays in memory. Every session starts signed out.
- `--browser=chromium`: the Chromium that Playwright installed. Without it the server looks for Google Chrome.
- With VS Code and Copilot: `npx playwright init-agents --loop=vscode`.

## Read more

- Test agents: <https://playwright.dev/docs/test-agents>
- Playwright MCP: <https://playwright.dev/mcp/introduction> · snapshots: <https://playwright.dev/mcp/snapshots>
- Annotations, `test.fail()` and `test.fixme()`: <https://playwright.dev/docs/test-annotations>
