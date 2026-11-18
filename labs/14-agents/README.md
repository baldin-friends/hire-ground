# Case 10 · AI: what Playwright ships

Playwright 1.64.1 does not contain a language model. It contains everything a language model needs to work with
tests: a prompt for every failure, three agent definitions (planner, generator, healer), an MCP server, and a
command line for coding agents. This case shows what each part does, and what a person still has to decide.

**Time** 45 min · together on the projector

## What ships with 1.64.1

| Part | Command or place | Needs an AI account? |
|---|---|---|
| A prompt for every failed test | `test-results/<test>/error-context.md`; the button "Copy prompt" in the HTML report and in the trace viewer | no, to produce it; yes, to answer it |
| Test agents: planner, generator, healer | `npx playwright init-agents --loop=claude` (or `vscode`, `copilot`, `codex`, `opencode`) | yes: Claude Code or Copilot runs them |
| The MCP server of the test runner | `npx playwright run-test-mcp-server` (the agents start it themselves) | yes |
| The browser MCP server | `npx playwright mcp` | yes: any MCP client |
| A browser on the command line | `npx playwright cli open --browser=chromium <url>`, then `snapshot`, `click`, `fill` | no |
| Skills for coding agents | `npx playwright init-skills` | yes |
| A paused test an agent can attach to | `npx playwright test --debug=cli` | no |
| A trace on the command line | `npx playwright trace open <trace.zip>`, then `actions`, `errors` | no |

Left out on purpose: the CLI lists `--run-agents` "to generate the code for page.perform". `page.perform` is not
in the published types of 1.64.1, so this course does not use it.

## Before you start

```bash
npx playwright test        # in labs/14-agents: 2 failed, 2 passed
```

The two failures are the material. That run also signs in and saves the session; UI mode does not do that by itself.

## Part 1 · What the model gets to see (no account needed)

1. Open the prompt of the first failure:

   ```bash
   cat ../../test-results/heal-me-a-recruiter-opens-the-form-for-a-new-job-chromium/error-context.md
   ```

   It has five parts: instructions, the test, the error, the page as an aria snapshot, the source around the failing
   line. Find the control the test was looking for in the snapshot. What is it, and what is it called?

2. Open the report, `npx playwright show-report`, open the failed test, click **Copy prompt**. It is the same text.
   Paste it into Claude or Copilot.

3. See the page the way an agent sees it, and act on it:

   ```bash
   npx playwright cli open --browser=chromium http://localhost:3000/jobs
   npx playwright cli snapshot
   npx playwright cli fill e19 "Reliability"      # e19: the ref of the search box in the snapshot
   npx playwright cli click e20
   npx playwright cli close
   ```

   Every action prints the Playwright code it ran, for example
   `await page.getByRole('searchbox', { name: 'Search jobs' }).fill('Reliability');`
   Without `--browser=chromium` the command looks for an installed Google Chrome.

## Part 2 · The healer (run live, not rehearsed)

The agents need Claude Code or VS Code with Copilot. What they answer differs from run to run.

```bash
npx playwright init-agents --loop=claude
```

It prints what it writes (observed with 1.64.1):

```
 🎭 Using project "chromium" as a primary project
 🤖 .claude/agents/playwright-test-generator.md - agent definition
 🤖 .claude/agents/playwright-test-healer.md - agent definition
 🤖 .claude/agents/playwright-test-planner.md - agent definition
 🔧 .mcp.json - mcp configuration
```

`specs/README.md` and `tests/seed.spec.ts` exist already, so it leaves them alone. With `--loop=vscode` the
files are `.github/agents/*.agent.md` and `.vscode/mcp.json`; open `labs/14-agents` as the folder in VS Code then.
Add `--prompts` and you also get four prompt templates in `.claude/prompts/`.

Read `.claude/agents/playwright-test-healer.md` before you run it. Two sentences in it matter for what follows:
"Fixing assertions and expected values" is on its list of repairs, and "do the most reasonable thing possible to
pass the test".

Then start Claude Code in this folder (`claude`), allow the MCP server `playwright-test`, and ask:

> Use the playwright-test-healer agent. Run the tests in tests/heal-me.spec.ts and fix the failing ones.

Afterwards: `git diff tests/`.

### The first test

`a recruiter opens the form for a new job` looks for a button "Create job". The page has a link "New job".
The test is out of date: a new locator is the right repair.

### The second test

`one person can apply for two jobs with the same e-mail address` fails because the application refuses the second
application: "You have already applied with this email address." This build has a regression switched on
(`unique-email`, see `tests/auth.setup.ts`): one address may apply only once across all jobs. The test is right.

Look at what the healer did with it. Three things are possible:

| What changed | Is it a fix? |
|---|---|
| the expectation: the test now expects the error message | No. The test is green and protects the bug. `solutions/14-agents/tests/healed-wrong.spec.ts` shows it. |
| the test is marked `test.fixme()` with a comment | Half. The healer's instructions ask for this when it is sure the test is right. Somebody still has to file the bug. |
| the setup: the line that switches the regression on is gone | No. The agent repaired the environment until the test passed. |

## Part 3 · Planner and generator (run live, not rehearsed)

> Use the playwright-test-planner agent. Create a test plan for the job administration. Seed file: tests/seed.spec.ts. Save it as specs/job-administration-ai.plan.md.

> Use the playwright-test-generator agent. Generate the test for scenario 1.1 of specs/job-administration.plan.md.

The planner opens the application through the seed test, explores it and writes a plan in Markdown. The generator
performs one scenario in the browser and writes a test file. `specs/job-administration.plan.md` is a plan in the
same layout, written by hand: use it if the planner is not available.

Read the generated test with Thursday's questions: does it pass a second time? Whose data does it use? What does
it assert? Does it clean up?

## House rules

1. A person reads every generated plan before a test is generated from it.
2. A generated or repaired test goes through review, like any other code.
3. A changed expectation is a question to the team, never a repair.
4. Agents help while you write tests. They do not decide whether the pipeline is green.

## Done when

You can say for both failing tests whether the test or the application was wrong, and
`npx playwright test` in `solutions/14-agents` passes.

## Read more

- Test agents: <https://playwright.dev/docs/test-agents>
- Playwright MCP: <https://playwright.dev/mcp/introduction>
- Playwright CLI for coding agents: <https://playwright.dev/agent-cli/introduction>
- Annotations, `test.fail()` and `test.fixme()`: <https://playwright.dev/docs/test-annotations>
- Timeouts, `actionTimeout`: <https://playwright.dev/docs/test-timeouts>
