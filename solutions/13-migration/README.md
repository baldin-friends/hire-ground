# Case 9 · From Selenide to Playwright: the debrief

`tests/2-challenge.spec.ts` is the rewrite. It has two tests where the Selenide class had three, and none of them
needs another one.

| Habit in `CandidatePipelineTest.java` | What it costs | In the rewrite |
|---|---|---|
| one fixed candidate, `selma.selenide@example.com` | the second run is refused: "You have already applied with this email address." Nobody else may use the environment during a run. | a new address per run in test 1; the fixture `applicant` in test 2 |
| `@TestMethodOrder`, a static `reference` | test 3 cannot run alone; one failure hides two more ("2 did not run") | two tests, any order, any worker |
| `loginAsRecruiter()` in every recruiter test | one sign-in through the form per test: with 670 tests, 670 sign-ins | one sign-in per run in `tests/auth.setup.ts`, saved as `storageState` |
| three `sleep()`, seven seconds | 4 tests in about 9 s, and a slow day still breaks them | assertions that wait, `expect.poll` for the mail: about 2 s per test |
| the mailbox assertion finds any mail with that subject | green also when this run's mail never left | the mailbox API, filtered by this candidate's address |
| XPath by column position, ids, class names | a new column or a renamed class breaks the test | role, label, text; CSS only for the dropdown without roles, scoped to the row |
| nothing is cleaned up | the environment fills up until the nightly restore | fixtures remove what they created; `withdrawAfterTest` removes what the form created |

Measured on the trainer's laptop: the literal translation needs about 9 s for one run with one worker and cannot
run twice. The rewrite runs three times in parallel (`--repeat-each=3 --workers=3`) in under 5 s and leaves
36 candidates and 12 jobs behind, as before.

The order of teardown matters: `withdrawAfterTest` and `applicant` both depend on `job`, so Playwright removes the
applications first and the job last. The API refuses to delete a job that still has applications.
