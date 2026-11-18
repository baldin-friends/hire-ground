# Case 5 · The network: what real data cannot show

**The problem.** Real data answers most questions. Three it cannot answer on demand: what happens when a request
fails, what a rare answer looks like on the page, and what the page really sent.

## Before you start

```bash
cd labs/09-network
npx playwright test          # once, in a terminal: signs in and saves the session
```

The fixtures `job` and `applicant` are the ones from Case 4. They live in `support/fixtures.ts`, and every case from here on imports them from there.

## Four things a test can do with a request

| | The test | API |
|---|---|---|
| spy | listens and changes nothing | `page.waitForResponse()`, `page.on('request')` |
| stub | answers instead of the server | `route.fulfill({ status, json })` |
| patch | lets the server answer and changes a part | `route.fetch()`, then `route.fulfill({ response, json })` |
| break | makes the request fail | `route.fulfill({ status: 500 })`, `route.abort()` |

Stub what you do not own: a third party, a payment provider. Test what you own for real, and patch the one detail
that real data does not give you.

## Warm-up

`tests/1-warm-up.spec.ts`: a rating is saved without any message on the page. The test waits for the response and
reads what was sent and what came back.

## The challenge · 25 minutes, together

`tests/2-challenge.spec.ts`: four tests, each complete except for its network part.

**Done when** all four pass.

1. **Break.** When saving a stage fails, the row jumps back and the recruiter sees a message. Make the PATCH fail.
2. **Patch.** How does the paging look for a customer with 1234 candidates? Change two numbers in the real answer.
3. **Spy.** Typing a name must send one search, not one per key. Collect the requests.
4. **API test.** A job without a title: 422. A second job with the same title: 409. No browser.

## Hints

<details>
<summary>Hint 1 · break</summary>

```ts
await page.route(`**/api/applications/${applicant.id}`, async (route) => {
    if (route.request().method() === 'PATCH') await route.fulfill({ status: 500, json: { error: 'internal' } });
    else await route.fallback();
});
```

Set the route before the page sends the request. `route.fallback()` passes the request on to the next handler, and
in the end to the server.

</details>

<details>
<summary>Hint 2 · patch</summary>

```ts
await page.route('**/api/candidates?*', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    await route.fulfill({ response, json: { ...body, total: 1234, pages: 124 } });
});
```

</details>

<details>
<summary>Hint 3 · spy</summary>

```ts
page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/api/candidates' && url.searchParams.has('q')) searches.push(url.searchParams.get('q')!);
});
```

</details>

## Read more

- Network: https://playwright.dev/docs/network
- Mock APIs, modify responses, HAR files: https://playwright.dev/docs/mock
- API testing: https://playwright.dev/docs/api-testing
- `route`: https://playwright.dev/docs/api/class-route
