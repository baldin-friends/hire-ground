// Hire Ground data: one SQLite file, app/data/hire-ground.db (or the path in HG_DB).
// It survives a restart, like the database of a staging system.
// POST /api/test/reset (npm run reset) restores the seed.
//
// node:sqlite ships with Node.js, so there is nothing to install. Tests may open the
// same file: see labs/08-data/db.ts.

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DB_FILE = process.env.HG_DB ?? join(root, 'data', 'hire-ground.db');
if (DB_FILE !== ':memory:') mkdirSync(dirname(DB_FILE), { recursive: true });

export const sql = new DatabaseSync(DB_FILE);
sql.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000; PRAGMA foreign_keys = ON;');

sql.exec(`
CREATE TABLE IF NOT EXISTS jobs (
    id            INTEGER PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    team          TEXT NOT NULL,
    location      TEXT NOT NULL,
    remote        INTEGER NOT NULL DEFAULT 0,
    salary_min    INTEGER NOT NULL,
    salary_max    INTEGER NOT NULL,
    deadline      TEXT NOT NULL,                      -- YYYY-MM-DD, a day in Europe/Berlin
    status        TEXT NOT NULL DEFAULT 'published',  -- draft | published
    summary       TEXT NOT NULL,
    description   TEXT NOT NULL,                      -- JSON array of paragraphs
    requirements  TEXT NOT NULL,                      -- JSON array
    skills        TEXT NOT NULL DEFAULT '[]',         -- JSON array
    seed_closes_in INTEGER,                           -- seed jobs only: deadline = today + n, refreshed at start
    created_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS applications (
    id            INTEGER PRIMARY KEY,
    reference     TEXT NOT NULL UNIQUE,
    withdraw_token TEXT NOT NULL,
    job_id        INTEGER NOT NULL REFERENCES jobs(id),
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT NOT NULL DEFAULT '',
    start_date    TEXT NOT NULL DEFAULT '',
    salary_expectation INTEGER,
    cover_letter  TEXT NOT NULL DEFAULT '',
    cv_name       TEXT NOT NULL,
    cv_type       TEXT NOT NULL,
    cv_size       INTEGER NOT NULL,
    cv_data       BLOB NOT NULL,
    stage         TEXT NOT NULL DEFAULT 'new',
    rating        INTEGER NOT NULL DEFAULT 0,         -- 0 = not rated, 1..5
    shortlisted   INTEGER NOT NULL DEFAULT 0,
    interview_at  TEXT,                               -- an instant in UTC, ISO 8601
    created_at    TEXT NOT NULL                       -- an instant in UTC, ISO 8601
);
CREATE TABLE IF NOT EXISTS notes (
    id            INTEGER PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    text          TEXT NOT NULL,
    author        TEXT NOT NULL,
    created_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mails (
    id            INTEGER PRIMARY KEY,
    recipient     TEXT NOT NULL,
    subject       TEXT NOT NULL,
    body          TEXT NOT NULL,
    created_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, email TEXT NOT NULL, created_at TEXT NOT NULL);
`);

// ---------------------------------------------------------------- constants

export const PASSWORD = 'hire-ground';

export const USERS = [
    { email: 'rita.recruiter@hireground.test', name: 'Rita Recruiter', role: 'recruiter' },
    { email: 'adam.admin@hireground.test', name: 'Adam Admin', role: 'admin' },
    // one account per worker, for worker-scoped fixtures
    ...Array.from({ length: 8 }, (_, i) => ({
        email: `recruiter-${i + 1}@hireground.test`,
        name: `Recruiter ${i + 1}`,
        role: 'recruiter',
    })),
];

export const STAGES = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'];
export const TEAMS = ['Engineering', 'People', 'Product', 'QA', 'Sales'];
export const LOCATIONS = ['Berlin', 'Dresden', 'Hamburg', 'München'];

const JOBS = [
    { title: 'Senior QA Engineer', team: 'QA', location: 'Dresden', remote: true, salary: [62000, 78000], closesIn: 21 },
    { title: 'QA Engineer (Working Student)', team: 'QA', location: 'Dresden', remote: false, salary: [18000, 22000], closesIn: 14 },
    { title: 'Test Automation Engineer', team: 'QA', location: 'Berlin', remote: true, salary: [58000, 72000], closesIn: 30 },
    { title: 'Frontend Developer (React)', team: 'Engineering', location: 'Berlin', remote: true, salary: [60000, 76000], closesIn: 28 },
    { title: 'Backend Developer (Java)', team: 'Engineering', location: 'Hamburg', remote: false, salary: [62000, 80000], closesIn: 35 },
    { title: 'Site Reliability Engineer', team: 'Engineering', location: 'München', remote: true, salary: [68000, 86000], closesIn: 42 },
    { title: 'Product Manager, Candidate Experience', team: 'Product', location: 'Berlin', remote: false, salary: [70000, 88000], closesIn: 18 },
    { title: 'UX Researcher', team: 'Product', location: 'Hamburg', remote: true, salary: [55000, 68000], closesIn: 25 },
    { title: 'Account Executive DACH', team: 'Sales', location: 'München', remote: false, salary: [55000, 70000], closesIn: 12 },
    { title: 'Customer Success Manager', team: 'Sales', location: 'Dresden', remote: false, salary: [48000, 60000], closesIn: 20 },
    { title: 'Recruiter (Tech)', team: 'People', location: 'Berlin', remote: true, salary: [50000, 62000], closesIn: 0 },
    { title: 'Working Student People Operations', team: 'People', location: 'Dresden', remote: false, salary: [16000, 19000], closesIn: -3 },
];

// first name, last name, job index, stage, applied n days ago, rating, shortlisted, interview in n days (Berlin 10:00)
const SEED_APPLICANTS = [
    ['Erika', 'Mustermann', 0, 'screening', 1, 4, 1],
    ['Max', 'Mustermann', 0, 'new', 2, 0, 0],
    ['Lena', 'Schmidt', 3, 'interview', 3, 5, 1, 2],
    ['Jonas', 'Weber', 3, 'offer', 4, 4, 1],
    ['Aylin', 'Demir', 4, 'new', 5, 0, 0],
    ['Tobias', 'Fischer', 4, 'rejected', 6, 2, 0],
    ['Hannah', 'Becker', 1, 'new', 2, 0, 0],
    ['Paul', 'Hoffmann', 2, 'screening', 7, 3, 0],
    ['Mia', 'Schulz', 2, 'interview', 9, 4, 1, 3],
    ['Felix', 'Wagner', 5, 'new', 16, 0, 0],
    ['Emma', 'Koch', 5, 'screening', 8, 3, 0],
    ['Leon', 'Richter', 6, 'new', 3, 0, 0],
    ['Sofia', 'Klein', 6, 'offer', 21, 5, 1],
    ['Noah', 'Wolf', 7, 'rejected', 12, 1, 0],
    ['Lea', 'Neumann', 7, 'new', 19, 0, 0],
    ['Elias', 'Schwarz', 8, 'screening', 10, 2, 0],
    ['Marie', 'Zimmermann', 8, 'interview', 11, 4, 0, 5],
    ['Ben', 'Braun', 9, 'new', 1, 0, 0],
    ['Clara', 'Krüger', 9, 'hired', 30, 5, 1],
    ['Luis', 'Hartmann', 0, 'new', 4, 0, 0],
    ['Amelie', 'Lange', 1, 'screening', 6, 3, 1],
    ['David', 'Werner', 2, 'new', 22, 0, 0],
    ['Nora', 'Krause', 3, 'screening', 13, 4, 0],
    ['Jan', 'Lehmann', 4, 'interview', 15, 3, 0, 1],
    ['Ida', 'Köhler', 5, 'offer', 18, 4, 1],
    ['Finn', 'Maier', 6, 'rejected', 20, 2, 0],
    ['Zeynep', 'Yılmaz', 3, 'new', 2, 0, 1],
    ['Mateusz', 'Kowalski', 4, 'screening', 5, 4, 0],
    ['Chiara', 'Rossi', 7, 'interview', 7, 5, 1, 7],
    ['Oleksandr', 'Shevchenko', 5, 'new', 3, 0, 0],
    ['Minh Anh', 'Nguyen', 3, 'screening', 9, 3, 0],
    ['Fatima', 'El-Sayed', 6, 'new', 1, 0, 0],
    ['João', 'Silva', 2, 'hired', 40, 5, 1],
    ['Priya', 'Nair', 0, 'interview', 8, 4, 1, 4],
    ['Anna', 'Müller', 8, 'new', 17, 0, 0],
    ['Lukas', 'Müller', 9, 'rejected', 14, 1, 0],
];

// A valid one-page PDF, small enough to seed applications with.
export const SAMPLE_PDF = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
        '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);

// ---------------------------------------------------------------- helpers

export const slugify = (s) =>
    String(s)
        .toLowerCase()
        .replace(/ü/g, 'ue')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ß/g, 'ss')
        .replace(/ı/g, 'i')
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

/** Today's date in Europe/Berlin as YYYY-MM-DD. */
export function berlinToday(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(now);
}

export function addDays(isoDate, days) {
    const d = new Date(`${isoDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

/** The UTC instant at which it is hh:mm in Berlin on that day. */
function berlinInstant(isoDate, hhmm) {
    for (const offset of ['+01:00', '+02:00']) {
        const d = new Date(`${isoDate}T${hhmm}:00${offset}`);
        const local = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' }).format(d);
        if (local === `${isoDate} ${hhmm}`) return d.toISOString();
    }
    return new Date(`${isoDate}T${hhmm}:00+01:00`).toISOString();
}

export const reference = () => `HG-${String(Math.floor(100000 + Math.random() * 900000))}`;
const now = () => new Date().toISOString();

function describe(job) {
    return {
        summary: `${job.team} team, ${job.location}${job.remote ? ', remote possible' : ''}.`,
        description: [
            `You join the ${job.team} team in ${job.location} and work on the hiring platform that thousands of candidates use every day.`,
            'We ship small changes often. Tests run on every pull request, and a red pipeline stops the line.',
        ],
        requirements: [
            'Two or more years in a similar role',
            'Good English; German is a plus',
            job.team === 'QA' ? 'Experience with test automation, ideally Playwright' : 'Curiosity about how things break',
        ],
    };
}

// ---------------------------------------------------------------- rows to JSON

const jobOut = (r) =>
    r && {
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        team: r.team,
        location: r.location,
        remote: !!r.remote,
        salaryMin: r.salary_min,
        salaryMax: r.salary_max,
        deadline: r.deadline,
        status: r.status,
        summary: r.summary,
        description: JSON.parse(r.description),
        requirements: JSON.parse(r.requirements),
        skills: JSON.parse(r.skills),
        ...(r.applications === undefined ? {} : { applications: r.applications }),
    };

const noteOut = (n) => ({ id: String(n.id), text: n.text, author: n.author, createdAt: n.created_at });

function applicationOut(r) {
    if (!r) return null;
    return {
        id: String(r.id),
        reference: r.reference,
        jobId: String(r.job_id),
        jobTitle: r.job_title ?? '',
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        startDate: r.start_date,
        salaryExpectation: r.salary_expectation,
        coverLetter: r.cover_letter,
        cv: { name: r.cv_name, type: r.cv_type, size: r.cv_size },
        stage: r.stage,
        rating: r.rating,
        shortlisted: !!r.shortlisted,
        interviewAt: r.interview_at,
        notes: sql.prepare('SELECT * FROM notes WHERE application_id = ? ORDER BY id').all(r.id).map(noteOut),
        createdAt: r.created_at,
    };
}

const mailOut = (m) => ({ id: String(m.id), to: m.recipient, subject: m.subject, body: m.body, createdAt: m.created_at });

// cv_data is left out of every list: a blob per row is slow and nobody needs it there
const APP_COLUMNS = `a.id, a.reference, a.withdraw_token, a.job_id, a.first_name, a.last_name, a.email, a.phone, a.start_date,
    a.salary_expectation, a.cover_letter, a.cv_name, a.cv_type, a.cv_size, a.stage, a.rating, a.shortlisted, a.interview_at,
    a.created_at, j.title AS job_title`;
const APP_FROM = 'FROM applications a JOIN jobs j ON j.id = a.job_id';

// ---------------------------------------------------------------- jobs

export const jobs = {
    /** Published jobs, filtered the way the career page filters. */
    search({ q = '', location = '', team = '', remote = false } = {}) {
        const needle = q.trim().toLowerCase();
        return sql
            .prepare("SELECT * FROM jobs WHERE status = 'published' ORDER BY id")
            .all()
            .map(jobOut)
            .filter(
                (j) =>
                    (!needle || `${j.title} ${j.team}`.toLowerCase().includes(needle)) &&
                    (!location || j.location === location) &&
                    (!team || j.team === team) &&
                    (!remote || j.remote),
            );
    },
    /** All jobs, drafts included, each with its number of applications. */
    all() {
        return sql
            .prepare('SELECT j.*, (SELECT count(*) FROM applications a WHERE a.job_id = j.id) AS applications FROM jobs j ORDER BY j.id DESC')
            .all()
            .map(jobOut);
    },
    get(slugOrId) {
        return jobOut(sql.prepare('SELECT * FROM jobs WHERE slug = ? OR id = ?').get(String(slugOrId), Number(slugOrId) || -1));
    },
    create(j) {
        const { lastInsertRowid } = sql
            .prepare(
                `INSERT INTO jobs (slug, title, team, location, remote, salary_min, salary_max, deadline, status, summary, description, requirements, skills, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .run(
                slugify(j.title),
                j.title,
                j.team,
                j.location,
                j.remote ? 1 : 0,
                j.salaryMin,
                j.salaryMax,
                j.deadline,
                j.status,
                j.summary ?? `${j.team} team, ${j.location}${j.remote ? ', remote possible' : ''}.`,
                JSON.stringify(j.description),
                JSON.stringify(j.requirements ?? []),
                JSON.stringify(j.skills ?? []),
                now(),
            );
        return jobs.get(lastInsertRowid);
    },
    setStatus(id, status) {
        sql.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, Number(id));
        return jobs.get(id);
    },
    remove(id) {
        sql.prepare('DELETE FROM jobs WHERE id = ?').run(Number(id));
    },
    applicationCount(id) {
        return sql.prepare('SELECT count(*) AS n FROM applications WHERE job_id = ?').get(Number(id)).n;
    },
};

// ---------------------------------------------------------------- applications

const collator = new Intl.Collator('de');
const SORTS = {
    name: (a, b) => collator.compare(`${a.lastName} ${a.firstName}`, `${b.lastName} ${b.firstName}`),
    applied: (a, b) => a.createdAt.localeCompare(b.createdAt),
    rating: (a, b) => a.rating - b.rating,
};

export const applications = {
    list({ jobId } = {}) {
        const rows = jobId
            ? sql.prepare(`SELECT ${APP_COLUMNS} ${APP_FROM} WHERE a.job_id = ? ORDER BY a.id`).all(Number(jobId))
            : sql.prepare(`SELECT ${APP_COLUMNS} ${APP_FROM} ORDER BY a.id`).all();
        return rows.map(applicationOut);
    },
    /** The candidates table: filter, sort, one page. */
    search({ q = '', stage = '', shortlisted = false, sort = 'applied', dir = 'desc', page = 1, pageSize = 10 } = {}) {
        const needle = q.trim().toLowerCase();
        const all = applications
            .list()
            .filter(
                (a) =>
                    (!needle || `${a.firstName} ${a.lastName} ${a.email} ${a.jobTitle}`.toLowerCase().includes(needle)) &&
                    (!stage || a.stage === stage) &&
                    (!shortlisted || a.shortlisted),
            );
        const by = SORTS[sort] ?? SORTS.applied;
        all.sort((a, b) => (dir === 'asc' ? by(a, b) : by(b, a)) || Number(a.id) - Number(b.id));
        const size = Math.min(Math.max(Number(pageSize) || 10, 1), 100);
        const pages = Math.max(Math.ceil(all.length / size), 1);
        const p = Math.min(Math.max(Number(page) || 1, 1), pages);
        return { items: all.slice((p - 1) * size, p * size), total: all.length, page: p, pageSize: size, pages, all };
    },
    get(id) {
        return applicationOut(sql.prepare(`SELECT ${APP_COLUMNS} ${APP_FROM} WHERE a.id = ?`).get(Number(id) || -1));
    },
    /** With the withdraw token and without the CV bytes; for the server only. */
    secrets(id) {
        return sql.prepare('SELECT id, withdraw_token, cv_name, cv_type FROM applications WHERE id = ?').get(Number(id) || -1);
    },
    cv(id) {
        return sql.prepare('SELECT cv_name, cv_type, cv_data FROM applications WHERE id = ?').get(Number(id) || -1);
    },
    byReference(ref) {
        return applicationOut(sql.prepare(`SELECT ${APP_COLUMNS} ${APP_FROM} WHERE a.reference = ?`).get(String(ref)));
    },
    findByEmail(email, jobId) {
        return jobId
            ? sql.prepare('SELECT id FROM applications WHERE email = ? AND job_id = ?').get(email, Number(jobId))
            : sql.prepare('SELECT id FROM applications WHERE email = ?').get(email);
    },
    create(a) {
        const withdrawToken = crypto.randomUUID();
        const { lastInsertRowid } = sql
            .prepare(
                `INSERT INTO applications (id, reference, withdraw_token, job_id, first_name, last_name, email, phone, start_date,
                    salary_expectation, cover_letter, cv_name, cv_type, cv_size, cv_data, stage, rating, shortlisted, interview_at, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .run(
                a.id ?? null,
                a.reference ?? reference(),
                withdrawToken,
                Number(a.jobId),
                a.firstName,
                a.lastName,
                a.email,
                a.phone ?? '',
                a.startDate ?? '',
                a.salaryExpectation ?? null,
                a.coverLetter ?? '',
                a.cv.name,
                a.cv.type,
                a.cv.size,
                a.cv.data,
                a.stage ?? 'new',
                a.rating ?? 0,
                a.shortlisted ? 1 : 0,
                a.interviewAt ?? null,
                a.createdAt ?? now(),
            );
        return { ...applications.get(lastInsertRowid), withdrawToken };
    },
    update(id, patch) {
        const columns = { stage: 'stage', rating: 'rating', shortlisted: 'shortlisted', interviewAt: 'interview_at' };
        for (const [key, column] of Object.entries(columns)) {
            if (!(key in patch)) continue;
            const value = key === 'shortlisted' ? (patch[key] ? 1 : 0) : patch[key];
            sql.prepare(`UPDATE applications SET ${column} = ? WHERE id = ?`).run(value, Number(id));
        }
        return applications.get(id);
    },
    remove(id) {
        sql.prepare('DELETE FROM applications WHERE id = ?').run(Number(id));
    },
    addNote(id, text, author) {
        sql.prepare('INSERT INTO notes (application_id, text, author, created_at) VALUES (?, ?, ?, ?)').run(Number(id), text, author, now());
        return applications.get(id);
    },
};

// ---------------------------------------------------------------- mails, settings, sessions

export const mails = {
    list(to = '') {
        const rows = to
            ? sql.prepare('SELECT * FROM mails WHERE recipient = ? ORDER BY id DESC').all(to)
            : sql.prepare('SELECT * FROM mails ORDER BY id DESC').all();
        return rows.map(mailOut);
    },
    get(id) {
        const row = sql.prepare('SELECT * FROM mails WHERE id = ?').get(Number(id) || -1);
        return row ? mailOut(row) : null;
    },
    add(to, subject, body) {
        sql.prepare('INSERT INTO mails (recipient, subject, body, created_at) VALUES (?, ?, ?, ?)').run(to, subject, body, now());
    },
};

export const settings = {
    get(key) {
        const row = sql.prepare('SELECT value FROM settings WHERE key = ?').get(key);
        return row ? JSON.parse(row.value) : undefined;
    },
    set(key, value) {
        sql.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(
            key,
            JSON.stringify(value),
        );
    },
};

export const sessions = {
    get(token) {
        return token ? sql.prepare('SELECT email FROM sessions WHERE token = ?').get(String(token))?.email : undefined;
    },
    create(email) {
        const token = crypto.randomUUID();
        sql.prepare('INSERT INTO sessions (token, email, created_at) VALUES (?, ?, ?)').run(token, email, now());
        return token;
    },
    remove(token) {
        if (token) sql.prepare('DELETE FROM sessions WHERE token = ?').run(String(token));
    },
};

// ---------------------------------------------------------------- seed

const ascii = (s) => slugify(s).replace(/-/g, '');

/** Wipes jobs, applications, notes, mails and settings, then writes the seed. Sessions stay: a saved login keeps working. */
export function reset() {
    const today = berlinToday();
    sql.exec('BEGIN');
    try {
        sql.exec('DELETE FROM notes; DELETE FROM applications; DELETE FROM jobs; DELETE FROM mails; DELETE FROM settings;');
        const insertJob = sql.prepare(
            `INSERT INTO jobs (id, slug, title, team, location, remote, salary_min, salary_max, deadline, status, summary, description, requirements, skills, seed_closes_in, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?)`,
        );
        JOBS.forEach((j, i) => {
            const d = describe(j);
            insertJob.run(
                i + 1,
                slugify(j.title),
                j.title,
                j.team,
                j.location,
                j.remote ? 1 : 0,
                j.salary[0],
                j.salary[1],
                addDays(today, j.closesIn),
                d.summary,
                JSON.stringify(d.description),
                JSON.stringify(d.requirements),
                JSON.stringify(j.team === 'QA' ? ['Playwright', 'TypeScript'] : []),
                j.closesIn,
                now(),
            );
        });
        SEED_APPLICANTS.forEach(([firstName, lastName, jobIndex, stage, daysAgo, rating, shortlisted, interviewIn], i) => {
            applications.create({
                id: 101 + i,
                reference: `HG-${String(400100 + i)}`,
                jobId: jobIndex + 1,
                firstName,
                lastName,
                email: `${ascii(firstName)}.${ascii(lastName)}@example.com`,
                cv: { name: `cv-${ascii(lastName)}.pdf`, type: 'application/pdf', size: SAMPLE_PDF.length, data: SAMPLE_PDF },
                stage,
                rating,
                shortlisted,
                interviewAt: interviewIn ? berlinInstant(addDays(today, interviewIn), '10:00') : null,
                createdAt: new Date(Date.now() - daysAgo * 86400000 - i * 60000).toISOString(),
            });
        });
        sql.exec('COMMIT');
    } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
    }
}

// First start: write the seed. Every start: the seed jobs keep their distance to today,
// so "closes today" and "applications closed" stay true next week.
if (sql.prepare('SELECT count(*) AS n FROM jobs').get().n === 0) reset();
else {
    const today = berlinToday();
    for (const row of sql.prepare('SELECT id, seed_closes_in FROM jobs WHERE seed_closes_in IS NOT NULL').all()) {
        sql.prepare('UPDATE jobs SET deadline = ? WHERE id = ?').run(addDays(today, row.seed_closes_in), row.id);
    }
}
