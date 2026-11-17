# Steps 5 to 9 · Own the network

What does a candidate see when there are no jobs, when a job has closed, or when the API is down? Find out without waiting for production.

**Time** five short steps, one test each · alone

## Start here

`labs/06-network`: `tests/network.spec.ts` with five tests to finish. Open the browser's network tab on http://localhost:3000/jobs first and watch which requests the page sends.

## Steps

1. **Step 5 · Stub** `/api/jobs` with `[]`; assert the empty state.
2. **Step 6 · Patch** one job's `deadline` into the past; assert "Applications closed".
3. **Step 7 · Break** `/api/applications` with a 503; assert the alert.
4. **Step 8 · Spy** on the search request; assert the `location` parameter.
5. **Step 9 · API**: create an application, withdraw it; assert 201 and 204.

## Done when

All five pass, and none of them needed the real API to misbehave.

## Stuck?

<details>
<summary>Hint 1 · my route is never called</summary>

Register the route before `page.goto`. And check the pattern: `**/api/jobs?*` matches the list (`/api/jobs?q=…`), not a single job (`/api/jobs/senior-qa-engineer`).

</details>

<details>
<summary>Hint 2 · patching</summary>

```ts
await page.route('**/api/jobs/senior-qa-engineer', async (route) => {
    const response = await route.fetch();           // the real answer
    const job = await response.json();
    await route.fulfill({ response, json: { ...job, deadline: '2020-01-31' } });
});
```

</details>

<details>
<summary>Hint 3 · the spy misses the request</summary>

Start waiting before the action, and await it after:
```ts
const request = page.waitForRequest((r) => r.url().includes('/api/jobs?') && r.url().includes('location='));
await page.getByRole('combobox', { name: 'Location' }).selectOption('Dresden');
const url = new URL((await request).url());
```

</details>

<details>
<summary>Hint 4 · the API test</summary>

```ts
const created = await request.post('/api/applications', { multipart: { jobId: '1', ...person('api'), consent: 'true', cv } });
expect(created.status()).toBe(201);
const { id, withdrawToken } = await created.json();
```

</details>

## Done early?

Record the job list into a HAR file and replay it:
`await page.routeFromHAR('hars/jobs.har', { url: '**/api/jobs?*', update: true });` records on the first run.
Then set `update: false` and run again: the list now comes from the file, and the API is not asked.
