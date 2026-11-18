# Setup check · Get Hire Ground running on your machine

The app runs on your laptop, and Playwright is installed in the pinned version.

**Time** 10 min · alone. If you ran the pre-flight check before the course, this is a thirty-second check.

## Steps

```bash
node --version          # 22.13 or later
git clone https://github.com/baldin-friends/hire-ground.git
cd hire-ground
npm install             # Playwright 1.64.1, pinned
npm run setup           # the app's packages, and three browsers (about 600 MB, once)
npm run preflight       # checks everything this course needs
npm run app             # Hire Ground on http://localhost:3000
```

Leave the app running in this terminal and open a second one for the labs.

## Done when

- http://localhost:3000/jobs shows 12 jobs
- `npx playwright --version` prints `Version 1.64.1`
- `npm run preflight` ends with "Ready."

## Stuck?

<details>
<summary>A proxy or certificate error during npm install or the browser download</summary>

Say so now, not at 13:00. Behind a proxy, set `HTTPS_PROXY`. With TLS inspection, set
`NODE_EXTRA_CA_CERTS` to your company certificate file. If the browser download is blocked,
the trainer has an offline copy.

</details>

<details>
<summary>Port 3000 is already in use</summary>

Start the app on another port: `PORT=3001 npm run app`. Use the same port for your tests:
`PORT=3001 npx playwright test`.

</details>

<details>
<summary>Playwright prints another version, or asks to download browsers again</summary>

Something installed a newer Playwright. In the repository root run `npm ci`, then `npm run setup`.
The course uses 1.64.1 on purpose: the version in `package.json`, the browsers and (on Day 3) the
Docker image must match.

</details>

## Done early?

Sign in as the recruiter and look at the pipeline board. The demo login is on the sign-in page.
