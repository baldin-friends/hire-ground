# Case 5 · The network: what real data cannot show

**The problem.** Real data answers most questions. Three it cannot answer on demand: what happens when a request
fails, what a rare answer looks like on the page, and what the page really sent.

## Before you start

```bash
cd labs/09-network
npx playwright test          # once, in a terminal: signs in and saves the session
```

The warm-up passes, the two tests of the challenge fail, and two more are skipped (`2 failed, 2 skipped, 2 passed`):
that is the starting point.

The fixtures `job` and `applicant` are the ones from Case 4. They live in `support/fixtures.ts`, and every case from here on imports them from there.

## Which one? Ask what you want to know

| You want to know | The test | You write |
|---|---|---|
| what the page really sent | listens: spy | `page.waitForResponse(…)` |
| what the page does when the server fails | breaks the request | `route.fulfill({ status: 500 })` |
| what the page does with an answer you cannot produce | patches the real answer | `route.fetch()`, then `route.fulfill({ response, json })` |
| what the page does with the answer of somebody else's service | answers itself: stub | `route.fulfill({ json: … })` |

Stub what you do not own: a third party, a payment provider. Test what you own for real, and patch the one detail
that real data does not give you.

## Warm-up

`tests/1-warm-up.spec.ts`: a rating is saved without any message on the page. The test waits for the response and
reads what was sent and what came back.

## The challenge · 15 minutes, together

`tests/2-challenge.spec.ts`: two tests, each complete except for its network part.

**Done when** both pass.

1. Run it: `npx playwright test 2-challenge`. Two tests fail. Read both failures: the page did what it always does.
   Saving worked, and the table shows its real count.
2. **Break.** When saving a stage fails, the row jumps back and the recruiter sees a message. Before `page.goto`, set
   a route that answers every request to this candidate's address with status 500. The first test is green.
3. **Patch.** How does the paging look for a customer with 1234 candidates? Set a route for `**/api/candidates?*`,
   fetch the real answer and change `total` and `pages`. The second test is green. The `?*` is needed: the URL has a
   query string, and a pattern without it never matches (the page then shows the real count).
4. Look at the second test in UI mode (`npx playwright test 2-challenge --ui`): the rows are the real candidates.
   Only "1234 candidates" and "Page 1 of 124" come from the test.

Steps 2 and 3 are at the end of `tests/2-challenge.spec.ts` as comments, ready to copy.

## Hints

<details>
<summary>Hint 1 · break (step 2)</summary>

```ts
await page.route(`**/api/applications/${applicant.id}`, (route) => route.fulfill({ status: 500 }));
```

Set the route before the page sends the request. If only some requests to an address should fail, look at the
request and pass the others on:

```ts
await page.route(`**/api/applications/${applicant.id}`, async (route) => {
    if (route.request().method() === 'PATCH') await route.fulfill({ status: 500 });
    else await route.fallback();
});
```

</details>

<details>
<summary>Hint 2 · patch (step 3)</summary>

```ts
await page.route('**/api/candidates?*', async (route) => {
    const response = await route.fetch();          // the request goes to the real server
    const body = await response.json();
    await route.fulfill({ response, json: { ...body, total: 1234, pages: 124 } });
});
```

</details>

## Done early?

The challenge file has two more tests, skipped with `test.fixme`. Remove `.fixme` from one and work through its `TODO`.

- **Spy.** Typing a name must send one search, not one per key. Collect the `q` of every request to
  `/api/candidates` that has one. The first load of the table has no `q`: without the check the list starts with `null`.
- **API test.** A job without a title: 422. A second job with the title of the fixture's job: 409. No browser.

The code for both is at the end of the challenge file, and the solution has both.

## Read more

- Network: https://playwright.dev/docs/network
- Mock APIs, modify responses, HAR files: https://playwright.dev/docs/mock
- API testing: https://playwright.dev/docs/api-testing
- `route`: https://playwright.dev/docs/api/class-route
