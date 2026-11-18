# Hire Ground

Course app for the Playwright training: a job board with a recruiter workspace. All people and jobs are fictional.

```bash
npm install
npm start            # builds the frontend, serves everything on http://localhost:3000
npm run dev          # same port, hot reload: for changing the application during a case
```

Node.js 22.13 or later. No Docker and no mail server. The data lives in one SQLite file, `data/hire-ground.db`
(through `node:sqlite`, which ships with Node.js). It survives a restart. `POST /api/test/reset`, or `npm run reset`
in the repository root, restores the seed: 12 jobs and 36 candidates.

## Pages

| Path | What |
|---|---|
| `/jobs` | career page: search (text, location, team, remote), 12 jobs |
| `/jobs/:slug` | job detail, Apply |
| `/jobs/:slug/apply` | application form with CV upload (PDF/DOCX, ≤ 5 MB), consent |
| `/applied/:reference` | confirmation with the reference `HG-123456` |
| `/status/:reference` | what the candidate sees: status, and the interview in the time zone of the browser |
| `/login` | recruiter sign-in |
| `/recruiter` | pipeline board, drag and drop between stages |
| `/recruiter/candidates` | candidates table: search, stage filter, sorting, paging, rating, shortlist, reject, CSV export |
| `/recruiter/applications/:id` | candidate detail: stage, rating, interview, CV download, notes |
| `/recruiter/jobs` | job administration: publish, unpublish, delete; the titles open the career page in a new tab |
| `/recruiter/jobs/new` | job form: selects, a date, a rich-text description, skills as tags |
| `/recruiter/settings` | notification setting |
| `/mailbox` | test mailbox: every mail the app sends |

## What is hard to test here, on purpose

| Where | What | Case |
|---|---|---|
| candidates table | 36 rows on four pages, newest first: "my" row is rarely on page 1 | 2, 4 |
| stage dropdown | built from `<div>`s (`.hg-select`), no role; the panel is rendered in `#overlays` at the end of `<body>` | 2 |
| icon buttons | `<button><svg><use href="#icon-star"></svg></button>`: no text, no label, no title | 2 |
| rating | `<hg-rating>`, a web component with a shadow root; its value is a property, not an attribute | 2 |
| test attribute | `data-qa`, on some elements only (`candidate-row`, `stage-select`, `stage-filter`, `interview-day`, `interview-time`, `job-row`, `skill`) | 2 |
| saving | every change of a candidate answers after 150 ms; the search runs 300 ms after the last key | 3, 5 |
| messages | a toast for four seconds; a rating is saved without any message | 3, 5 |
| mail | a status mail and an interview invitation leave through a queue: one to two seconds later | 3 |
| job form | a title can be used once (409); the deadline must not be in the past | 1 |
| interview day in the table | cut out of the UTC instant: one day early east of Greenwich in the morning | 6 |
| session | a warning after 30 minutes without input, sign-out after 32: `setTimeout`, so `page.clock` controls it | 6 |
| "Waiting N days" | a candidate in the stage New for more than 14 days is flagged | 4, 6 |

## Accounts

Password for all: `hire-ground`

- `rita.recruiter@hireground.test` (receives "new application" mails)
- `adam.admin@hireground.test`
- `recruiter-1@hireground.test` … `recruiter-8@hireground.test`, one per worker

A session survives a restart and a reset: a saved `storageState` stays valid.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | for `webServer.url` |
| GET | `/api/jobs?q=&location=&team=&remote=1` | published jobs |
| GET | `/api/jobs/:slug` | slug or id; a draft only for a recruiter |
| GET | `/api/admin/jobs` | recruiter · all jobs, drafts included, with the number of applications |
| POST | `/api/jobs` | recruiter · `{ title, team, location, remote, salaryMin, salaryMax, deadline, description, skills, status }` · 201 · 422 `{ errors }` · 409 `duplicate-title` |
| PATCH | `/api/jobs/:id` | recruiter · `{ status }`: draft, published |
| DELETE | `/api/jobs/:id` | recruiter · 204 · 409 `has-applications` |
| POST | `/api/applications` | multipart: `jobId`, `firstName`, `lastName`, `email`, `consent`, `cv`, optional `phone`, `startDate`, `salaryExpectation`, `coverLetter` · 201 `{ id, reference, withdrawToken }` · 422 `{ errors }` · 409 duplicate or closed |
| DELETE | `/api/applications/:id` | header `x-withdraw-token`, or as recruiter · 204 |
| GET | `/api/status/:reference` | what a candidate may see: `{ reference, firstName, jobTitle, stage, interviewAt }` |
| GET | `/api/candidates?q=&stage=&shortlisted=1&sort=name\|applied\|rating&dir=asc\|desc&page=&pageSize=` | recruiter · `{ items, total, page, pageSize, pages }` |
| GET | `/api/candidates/export.csv` | recruiter · the same filters, as a download |
| GET | `/api/applications` · `/api/applications/:id` | recruiter |
| PATCH | `/api/applications/:id` | recruiter · any of `{ stage, rating, shortlisted }` · stages: new, screening, interview, offer, hired, rejected |
| PUT | `/api/applications/:id/interview` | recruiter · `{ startsAt }`, an instant (ISO 8601) |
| POST | `/api/applications/:id/notes` | recruiter · `{ text }` |
| GET | `/api/applications/:id/cv` | recruiter · download |
| POST | `/api/auth/login` · `/api/auth/logout` · GET `/api/auth/me` | session cookie `hg_session` |
| GET · PUT | `/api/settings` | recruiter · `{ notifyOnNewApplication }`, per account |
| GET | `/api/mail?to=` · `/api/mail/:id` | test mailbox |
| POST | `/api/test/reset` | restores the seed; off with `HG_TEST_API=off` |

## The database

`data/hire-ground.db`, SQLite. Tables: `jobs`, `applications`, `notes`, `mails`, `settings`, `sessions`.
The schema is at the top of `server/store.js`. Open it with any SQLite client, or from a test: `labs/08-data/db.ts`.

## Teaching bugs from Day 1

All off by default. Switch them on for the whole server with `BUGS=a,b npm start` (or `BUGS=all`), or per browser
context with `?bugs=a,b` on any URL. The query sets the `hg_bugs` cookie, so it survives navigation in that context;
`?bugs=none` clears it.

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
| `deadline-tz` | deadline status in UTC instead of Europe/Berlin |
| `debounce-search` | no Search button; search runs 400 ms after the last key |
| `pipeline-animation` | pipeline cards animate for 600 ms (respects reduced motion) |
| `unique-email` | one e-mail address may apply only once across all jobs |
| `global-settings` | notification setting shared by all recruiters |

## Ports and environment

| Variable | Default | |
|---|---|---|
| `PORT` | 3000 | app and API |
| `HG_DB` | `data/hire-ground.db` | the database file; `:memory:` for a database that is gone after the process |
| `HG_ANALYTICS_PORT` | 3999 | third-party stand-in |
| `BUGS` | – | server-wide teaching bugs |
| `HG_TEST_API` | on | `off` disables `/api/test/reset`, like a staging system |

Licence: MIT.
