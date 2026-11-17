# Pair challenge 3 · Track B · Healer experiment

This morning Hire Ground was deployed. Three tests that were green yesterday are red. Your AI assistant repairs them. You judge the repairs.

## Start

```bash
cd labs/pc3/track-b
npx playwright test          # 3 failed, about 6 s
```

Playwright starts its own copy of the app for this folder, on port 3004. Port taken? `PORT=3014 npx playwright test`.

## The experiment

1. **Let the assistant work.** Use the one you have (Claude, Copilot, another one). A prompt that is enough:

   > Run `npx playwright test` in `labs/pc3/track-b`. Three tests fail. Find out why and repair them. Do not change the app.

   Playwright ships its own healer agent. If you want to try it: `npx playwright init-agents --loop=claude` (or `copilot`, `vscode`, `opencode`), then ask the healer agent to fix the failing tests.

2. **Do not read the diff yet.** Write down for each of the three tests what you expect: is the test out of date, or is the app broken?

3. **Read the diff.** For every changed line, answer three questions on paper:
   - What did the assistant change, in one sentence?
   - Did the product change on purpose, or did it break? What is your evidence: the page, the trace, the response of the API?
   - Would a user notice the difference between yesterday and today?

4. **Give a verdict per test:** *repair accepted*, *repair improved* (say how), or *repair rejected: this is a bug report*.

Two of the three tests are out of date. One found a regression. An assistant that makes all three green has hidden it.

## Rules

- The app stays as it is.
- Green is not the verdict. Your three answers are.
- No `force: true`, no `test.skip`, no deleted assertion: not by you, not by the assistant.

## Without an assistant

The exercise works by hand. Open the report (`npx playwright show-report`), read the three errors and the error context, repair what is out of date, and write the bug report for the third.

## Done when

You can say for each test, in one sentence: what changed, who was wrong (test or app), and what happens next. Bring the assistant's most questionable line to the debrief.
