# Case 9 · From Selenide to Playwright

Two Selenide classes for Hire Ground, each one three times: the Java source, a line-by-line translation, and a
rewrite. The lines translate. The habits of the suite come along, unless you leave them behind on purpose.

**Time** 75 minutes · read and run together

## What is where

| Path | What |
|---|---|
| `selenide/src/test/java/hireground/` | the Selenide suite: `BaseTest`, two page objects, `JobSearchTest`, `CandidatePipelineTest`. Written against Selenide 7.19.1. It is read in this course, not run. |
| `tests/` | the two classes, translated line by line |
| `../../solutions/13-migration/tests/` | the same two classes, rewritten |
| `migration-rules.md` | the rules of the rewrite, for a person and for an assistant |
| `assistant/` | what an assistant wrote from `CandidatePipelineTest.java` and the rules, unchanged |
| `../../handouts/selenide-to-playwright.md` | every Selenide call and its Playwright counterpart |

Open UI mode only after one run in a terminal: that run signs in and saves the session.

## 1 · One class, line by line

```bash
cd labs/13-migration
npx playwright test job-search          # 2 passed: the test and the sign-in
```

Read `selenide/…/JobSearchTest.java` next to `tests/job-search.spec.ts`: the Selenide line is the comment, the
Playwright line is below it. Three lines do not translate one to one. They are numbered in the file:

| | Selenide | Playwright |
|---|---|---|
| 1 | `$(".job-card")` is the first of twelve cards | a locator must match one element: `.first()` |
| 2 | `text("remote possible")` ignores case | `toContainText` does not, unless you pass `ignoreCase` |
| 3 | `sizeGreaterThanOrEqual(4)` | no "at least" for a count: assert the fourth element |

Then read `solutions/13-migration/tests/job-search.spec.ts`: the same test by role, label and text. No id, no class name.

## 2 · A class with habits

```bash
npm run reset --prefix ../..            # once: the fixed candidate may exist already
npx playwright test candidate-pipeline  # 4 passed, about 9 seconds
npx playwright test candidate-pipeline  # 1 failed, 2 did not run
```

`tests/candidate-pipeline.spec.ts` is `CandidatePipelineTest.java`, line by line. The second run fails in test 1:
the form answers "You have already applied with this email address." Tests 2 and 3 never start.

| Habit in `CandidatePipelineTest.java` | What it costs | In the rewrite |
|---|---|---|
| one fixed candidate | the second run is refused | a new address per run; the fixture `applicant` |
| `@Order`, a static `reference` | one failure hides two more: "2 did not run" | tests that do not know each other |
| `loginAsRecruiter()` in every test | one sign-in through the form per test | one sign-in per run, saved as `storageState` |
| three `sleep()`, seven seconds | slow on a good day, red on a slow day | assertions that wait, `expect.poll` for the mail |
| any mail with that subject | green also when this run's mail never left | the mailbox, filtered by this candidate |
| nothing is cleaned up | the environment fills up until the nightly restore | fixtures remove what they created |

## 3 · The rewrite

```bash
cd ../../solutions/13-migration
npx playwright test candidate-pipeline.spec --repeat-each=3 --workers=3     # 7 passed, about 5 seconds
```

`tests/candidate-pipeline.spec.ts`: two tests where the class had three. Run it as often as you like: the
application has 12 jobs and 36 candidates afterwards, as before.

## 4 · With an assistant

The prompt, typed into Claude Code in the repository root:

```text
Read labs/13-migration/migration-rules.md and follow it.

Rewrite the Selenide class labs/13-migration/selenide/src/test/java/hireground/CandidatePipelineTest.java,
with BaseTest.java and the page objects it uses, as Playwright tests in
solutions/13-migration/tests/candidate-pipeline.assistant.spec.ts.

The pages and the API of the application are described in app/README.md.
Run the tests from the folder solutions/13-migration.
```

What came back on 19 November 2026 (Claude Code 2.1.325, model Sonnet 5.5), next to the same class pasted into
a chat without the rules and without the repository:

| | Class pasted into a chat | Rules, repository, allowed to run the tests |
|---|---|---|
| Time | 24 seconds | 76 seconds |
| First run | does not start: `__dirname is not defined` | 13 passed with `--repeat-each=3 --workers=3`, twice |
| Second run, after fixing the path | 1 failed, 2 did not run | passes |
| The fixed candidate, the order, the sign-in, no cleanup | all kept | all gone |
| The three sleeps | gone | gone |

`assistant/candidate-pipeline.assistant.spec.ts` is the file as it came. The review changed three places:

| What it wrote | Why it does not stay | After the review |
|---|---|---|
| `getByLabel(/consent\|agree/i)` | a guess with two tries: it had not seen the label, and its report does not say so | the label, as the page shows it |
| a helper with the comment "the row itself has no role" | the comment is wrong: a table row has the role `row` | `getByRole('row', { name })` |
| the candidate's status page, opened with `page` | `page` carries the recruiter's session, as Selenide's one browser did | a browser context without a session |

Two things the review leaves to the team. The assistant made four small tests: no test follows the click of the
recruiter to the mail any more. And it could not count jobs and candidates before and after, and said so.

```bash
npx playwright test assistant --repeat-each=3 --workers=3                   # 13 passed: the reviewed file
diff ../../labs/13-migration/assistant/candidate-pipeline.assistant.spec.ts tests/candidate-pipeline.assistant.spec.ts
```

For a class of your own: write your rules down first, let the assistant run the tests, and review the result against
the Selenide class: is every assertion of the original still there? When a review finds a mistake, change the
rules file, not only the test.

## The strategy, in five lines

1. Sort before you port: delete what nobody would miss, move rules and calculations down to API tests, port the journeys.
2. The ground first: the sign-in, fixtures for your data, one green job in the pipeline.
3. Both suites run in the pipeline. From a date you set, new tests are written in Playwright only.
4. One pull request moves one area: it adds the Playwright tests and deletes the Selenide classes of that area.
5. An area is done when its tests pass with `--repeat-each=5 --workers=4` and create their own data.

## Read more

- Locators: https://playwright.dev/docs/locators
- Assertions that wait: https://playwright.dev/docs/test-assertions
- Fixtures in place of a base class: https://playwright.dev/docs/test-fixtures
- One sign-in per run: https://playwright.dev/docs/auth
- A second user in the same test: https://playwright.dev/docs/browser-contexts#multiple-contexts-in-a-single-test
- Playwright for Java: https://playwright.dev/java/docs/intro
- Selenide's selectors `byRole`, `byLabel`, `byTestId`: https://selenide.org/javadoc/current/com/codeborne/selenide/Selectors.html
