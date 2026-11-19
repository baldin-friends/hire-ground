# Case 9 · From Selenide to Playwright

A Selenide test translates to Playwright line by line. A class with habits (a fixed candidate, a fixed order, a
sign-in in every test) is rewritten from what it proves, by a person or by an assistant that has your rules.

**Time** 75 minutes · read and run together

## Run

```bash
cd labs/13-migration
npx playwright test job-search          # 2 passed: the test and the sign-in

cd ../../solutions/13-migration
npx playwright test candidate-pipeline.spec --repeat-each=3 --workers=3     # 7 passed, about 5 seconds
npx playwright test assistant --repeat-each=3 --workers=3                   # 13 passed
```

Open UI mode only after one run in a terminal: that run signs in and saves the session.

## Read

| File | What |
|---|---|
| `selenide/src/test/java/hireground/JobSearchTest.java` | example 1 in Selenide. The Java code is read here, not run. |
| `tests/job-search.spec.ts` | example 1, line by line: the Selenide line is the comment, the Playwright line is below it |
| `../../solutions/13-migration/tests/job-search.spec.ts` | example 1 by role, label and text |
| `selenide/src/test/java/hireground/CandidatePipelineTest.java` | example 2 in Selenide: the class with habits |
| `../../solutions/13-migration/tests/candidate-pipeline.spec.ts` | example 2, rewritten: two tests that do not know each other |
| `migration-rules.md` | the rules of a rewrite, for a person and for an assistant |
| `assistant/candidate-pipeline.assistant.spec.ts` | example 2 as an assistant wrote it, unchanged |
| `../../solutions/13-migration/tests/candidate-pipeline.assistant.spec.ts` | the same file after the review: three places marked `review:` |
| `../../handouts/selenide-to-playwright.md` | every Selenide call and its Playwright counterpart |

Three lines of example 1 do not translate one to one. They are numbered in `tests/job-search.spec.ts`:

1. `$()` takes the first match. A locator must match exactly one element: `.first()`.
2. Selenide's `text()` ignores case. `toContainText()` does not, unless you pass `ignoreCase`.
3. A count has no "at least": assert that the fourth element is visible.

## With an assistant

The prompt, typed into Claude Code in the repository root:

```text
Read labs/13-migration/migration-rules.md and follow it.

Rewrite the Selenide class labs/13-migration/selenide/src/test/java/hireground/CandidatePipelineTest.java,
with BaseTest.java and the page objects it uses, as Playwright tests in
solutions/13-migration/tests/candidate-pipeline.assistant.spec.ts.

The pages and the API of the application are described in app/README.md.
Run the tests from the folder solutions/13-migration.
```

- Without the rules, class pasted into a chat: 24 seconds. The result fails on its second run.
- With the rules and the repository, allowed to run the tests: 76 seconds. 13 passed, in parallel.

Claude Code 2.1.325, model Sonnet 5.5, 19 November 2026. One run each.

## Read more

- Locators: https://playwright.dev/docs/locators
- Assertions that wait: https://playwright.dev/docs/test-assertions
- Fixtures in place of a base class: https://playwright.dev/docs/test-fixtures
- One sign-in per run: https://playwright.dev/docs/auth
- Playwright for Java: https://playwright.dev/java/docs/intro
