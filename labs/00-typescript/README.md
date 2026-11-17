# Optional warm-up · Enough TypeScript

Five small tests about the language itself. No browser, no app.

**Time** 15 min · alone or with a neighbour, in a break or in the evening. For everybody who is new to TypeScript or to `async` and `await`.

## Steps

```bash
cd labs/00-typescript
npx playwright test
```

All five tests are red. Open `primer.spec.ts` and work from top to bottom: each test has one line marked `TODO`.
Change one line, run again, look.

| Test | What it shows |
|---|---|
| 1 | `const`, and a text built from values: `` `${title} in ${location}` `` |
| 2 | an object (`job.location`) and an array (`jobs[0]`, `jobs.length`) |
| 3 | an arrow function: `(job) => job.remote` |
| 4 | taking an object apart: `({ title, location })`. Every Playwright test starts like this: `async ({ page }) => …` |
| 5 | `await`: wait for an answer that comes later |

## Done when

`npx playwright test` says `5 passed`.

## Stuck?

<details>
<summary>Test 5 says "Received: Promise {}"</summary>

`countJobs()` answers later. Without `await`, the test compares the promise of an answer with the number 3.
Write `await countJobs()`.

</details>

## Done early?

Read the type at the top of the file: `type Job = { … }`. Add a job without a `location` to the array and look at
what your editor does with it. Then remove it again.

The solution is in `solutions/00-typescript`. More on one page: the handout "TypeScript for testers".
