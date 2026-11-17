# Hire Ground

Course app for the Playwright training: a small job board with an applicant
pipeline and 17 switchable teaching bugs. All people and jobs are fictional.

```bash
npm install
npm start            # builds the frontend, serves everything on http://localhost:3000
npm run dev          # same port, hot reload
```

Node 22.12 or later. No database, no Docker, no mail server: data lives in
memory and resets with `POST /api/test/reset` or a restart.

## Pages

| Path | What |
|---|---|
| `/jobs` | search (text, location, team, remote), 12 jobs |
| `/jobs/:slug` | job detail, Apply |
| `/jobs/:slug/apply` | application form with CV upload (PDF/DOCX, ≤ 5 MB), consent |
| `/applied/:reference` | confirmation with reference `HG-123456` |
| `/login` | recruiter sign-in |
| `/recruiter` | pipeline board, drag and drop between stages |
| `/recruiter/applications/:id` | candidate detail: stage, CV download, notes |
| `/recruiter/settings` | notification setting |
| `/mailbox` | test mailbox: every mail the app sends |

Recruiter area: 30 minutes without input shows a session warning, 32 minutes
signs out. Timers are `setTimeout`, so `page.clock` controls them.

## Accounts

Password for all: `hire-ground`

- `rita.recruiter@hireground.test` (receives "new application" mails)
- `adam.admin@hireground.test`
- `recruiter-1@hireground.test` … `recruiter-8@hireground.test`, one per worker

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | for `webServer.url` |
| GET | `/api/config` | active teaching bugs |
| GET | `/api/jobs?q=&location=&team=&remote=1` | |
| GET | `/api/jobs/:slug` | slug or id |
| POST | `/api/applications` | multipart: `jobId`, `firstName`, `lastName`, `email`, `consent`, `cv`, optional `phone`, `startDate`, `salaryExpectation`, `coverLetter` · 201 `{ id, reference, withdrawToken }` · 422 `{ errors }` · 409 duplicate or closed |
| DELETE | `/api/applications/:id` | header `x-withdraw-token`, or as recruiter · 204 |
| GET | `/api/applications` · `/api/applications/:id` | recruiter |
| PATCH | `/api/applications/:id` | recruiter · `{ stage }`: new, screening, interview, offer, hired, rejected |
| POST | `/api/applications/:id/notes` | recruiter · `{ text }` |
| GET | `/api/applications/:id/cv` | recruiter · download |
| POST | `/api/auth/login` · `/api/auth/logout` · GET `/api/auth/me` | session cookie `hg_session` |
| GET · PUT | `/api/settings` | recruiter · `{ notifyOnNewApplication }` |
| GET | `/api/mail?to=` · `/api/mail/:id` | test mailbox |
| POST | `/api/test/reset` | restores the seed; off with `HG_TEST_API=off` |

## Teaching bugs

All off by default. Switch on for the whole server with `BUGS=a,b npm start`
(or `BUGS=all`), or per browser context with `?bugs=a,b` on any URL. The
query sets the `hg_bugs` cookie, so it survives navigation in that context;
`?bugs=none` clears it. API requests accept `?bugs=` too.

| Flag | Behaviour |
|---|---|
| `dup-apply` | second Apply link in a sticky bar on the job page |
| `dynamic-ids` | element ids regenerate on every load (`#apply-button` is gone) |
| `nbsp-title` | job titles use non-breaking spaces; XPath `text()=` fails, user-facing locators do not |
| `slow-search` | job search API answers after 300–1500 ms; old results stay visible meanwhile |
| `cookie-banner` | consent dialog on about 30 % of loads, after 0–800 ms |
| `toast-overlay` | "Draft saved" toast covers Submit for 800 ms after ticking consent |
| `custom-select` | location filter is an ARIA combobox, `selectOption` fails |
| `icon-save` | "Save job" icon button has no accessible name |
| `flaky-503` | 5 % of application submits return 503 |
| `slow-analytics` | third-party script on `127.0.0.1:3999` answers after 10 s, then beacons every 500 ms |
| `locale-dates` | dates follow the browser locale instead of de-DE |
| `mail-delay` | confirmation mail arrives after 2–8 s |
| `deadline-tz` | deadline status in UTC instead of Europe/Berlin (wrong between 00:00 and 01:00/02:00) |
| `debounce-search` | no Search button; search runs 400 ms after the last key |
| `pipeline-animation` | pipeline cards animate for 600 ms (respects reduced motion) |
| `unique-email` | one e-mail address may apply only once across all jobs |
| `global-settings` | notification setting shared by all recruiters |


## Ports and environment

| Variable | Default | |
|---|---|---|
| `PORT` | 3000 | app and API |
| `HG_ANALYTICS_PORT` | 3999 | third-party stand-in |
| `BUGS` | – | server-wide teaching bugs |
| `HG_TEST_API` | on | `off` disables `/api/test/*` |

Licence: MIT.
