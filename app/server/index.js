// Hire Ground server: REST API, test endpoints and the built frontend on one port.
//   npm start        build the frontend, serve on http://localhost:3000
//   npm run dev      same port, Vite middleware with hot reload

import express from 'express';
import multer from 'multer';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLAGS, bugsMiddleware } from './bugs.js';
import {
    DB_FILE,
    LOCATIONS,
    PASSWORD,
    STAGES,
    TEAMS,
    USERS,
    applications,
    berlinToday,
    jobs,
    mails,
    reset,
    sessions,
    settings,
    slugify,
} from './store.js';
import { startAnalytics } from './analytics.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT ?? 3000);
const DEV = process.argv.includes('--dev');
const TEST_API = process.env.HG_TEST_API !== 'off';
const MAX_CV = 5 * 1024 * 1024;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const between = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const MSG = {
    firstName: 'Please enter your first name.',
    lastName: 'Please enter your last name.',
    email: 'Please enter a valid email address.',
    cv: 'Please upload your CV.',
    cvType: 'Your CV must be a PDF or Word file.',
    cvSize: 'Your CV must not be larger than 5 MB.',
    consent: 'Please agree to the privacy notice.',
    salary: 'Please enter a positive number.',
};
const CV_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAGE_LABEL = { new: 'New', screening: 'Screening', interview: 'Interview', offer: 'Offer', hired: 'Hired', rejected: 'Rejected' };

// ---------------------------------------------------------------- middleware

function cookies(req, _res, next) {
    req.cookies = Object.fromEntries(
        (req.headers.cookie ?? '')
            .split(';')
            .map((c) => c.trim().split('='))
            .filter(([k]) => k)
            .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]),
    );
    next();
}

function session(req, _res, next) {
    const email = sessions.get(req.cookies.hg_session);
    req.user = USERS.find((u) => u.email === email) ?? null;
    next();
}

function requireRecruiter(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    next();
}

// ---------------------------------------------------------------- helpers

/** Mail leaves through a queue. `delay` in ms, or a [min, max] range. */
function sendMail(to, subject, body, delay = 0) {
    const ms = Array.isArray(delay) ? between(...delay) : delay;
    if (ms > 0) setTimeout(() => mails.add(to, subject, body), ms);
    else mails.add(to, subject, body);
}

function settingsKey(req) {
    return req.bugs.has('global-settings') ? '*' : req.user.email;
}

const berlinDateTime = (iso) =>
    new Intl.DateTimeFormat('de-DE', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Berlin' }).format(new Date(iso));

// ---------------------------------------------------------------- API

const api = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_CV, files: 1 } });

api.get('/health', (_req, res) => res.json({ ok: true }));

api.get('/config', (req, res) => res.json({ bugs: [...req.bugs], flags: FLAGS }));

// ---- jobs: the career page

api.get('/jobs', async (req, res) => {
    if (req.bugs.has('slow-search')) await sleep(between(300, 1500));
    res.json(
        jobs.search({
            q: String(req.query.q ?? ''),
            location: String(req.query.location ?? ''),
            team: String(req.query.team ?? ''),
            remote: req.query.remote === '1' || req.query.remote === 'true',
        }),
    );
});

api.get('/jobs/:slug', (req, res) => {
    const job = jobs.get(req.params.slug);
    // a draft exists for recruiters only
    if (!job || (job.status !== 'published' && !req.user)) return res.status(404).json({ error: 'not-found' });
    res.json(job);
});

// ---- jobs: the recruiter's job administration

api.get('/admin/jobs', requireRecruiter, (_req, res) => res.json(jobs.all()));

api.post('/jobs', requireRecruiter, (req, res) => {
    const b = req.body ?? {};
    const errors = {};
    const title = String(b.title ?? '').trim();
    const salaryMin = Number(b.salaryMin);
    const salaryMax = Number(b.salaryMax);
    const deadline = String(b.deadline ?? '');
    const description = (Array.isArray(b.description) ? b.description : String(b.description ?? '').split(/\n+/))
        .map((p) => String(p).trim())
        .filter(Boolean);
    const skills = Array.isArray(b.skills) ? b.skills.map((s) => String(s).trim()).filter(Boolean) : [];

    if (title.length < 3) errors.title = 'Please enter a title.';
    if (!TEAMS.includes(b.team)) errors.team = 'Please choose a team.';
    if (!LOCATIONS.includes(b.location)) errors.location = 'Please choose a location.';
    if (!(salaryMin > 0) || !(salaryMax > 0)) errors.salary = 'Please enter a salary range.';
    else if (salaryMax < salaryMin) errors.salary = 'The upper limit must not be below the lower limit.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) errors.deadline = 'Please choose a date.';
    else if (deadline < berlinToday()) errors.deadline = 'The deadline must not be in the past.';
    if (!description.length) errors.description = 'Please describe the job.';
    if (Object.keys(errors).length) return res.status(422).json({ errors });

    if (jobs.get(slugify(title))) {
        return res.status(409).json({ error: 'duplicate-title', message: 'A job with this title already exists.' });
    }
    const job = jobs.create({
        title,
        team: b.team,
        location: b.location,
        remote: Boolean(b.remote),
        salaryMin,
        salaryMax,
        deadline,
        description,
        skills,
        status: b.status === 'published' ? 'published' : 'draft',
    });
    res.status(201).json(job);
});

api.patch('/jobs/:id', requireRecruiter, (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'not-found' });
    if (!['draft', 'published'].includes(req.body?.status)) return res.status(422).json({ errors: { status: 'Unknown status.' } });
    res.json(jobs.setStatus(job.id, req.body.status));
});

api.delete('/jobs/:id', requireRecruiter, (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'not-found' });
    if (jobs.applicationCount(job.id) > 0) {
        return res.status(409).json({ error: 'has-applications', message: 'This job has applications and cannot be deleted.' });
    }
    jobs.remove(job.id);
    res.status(204).end();
});

// ---- applications: the candidate's side

function uploadCv(req, res, next) {
    upload.single('cv')(req, res, (err) => {
        if (err?.code === 'LIMIT_FILE_SIZE') return res.status(422).json({ errors: { cv: MSG.cvSize } });
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}

api.post('/applications', uploadCv, (req, res) => {
    if (req.bugs.has('flaky-503') && Math.random() < 0.05) {
        return res.status(503).json({ error: 'service-unavailable' });
    }
    const b = req.body ?? {};
    const job = jobs.get(b.jobId);
    if (!job || job.status !== 'published') return res.status(422).json({ errors: { jobId: 'Unknown job.' } });

    const errors = {};
    const firstName = String(b.firstName ?? '').trim();
    const lastName = String(b.lastName ?? '').trim();
    const email = String(b.email ?? '').trim().toLowerCase();
    if (!firstName) errors.firstName = MSG.firstName;
    if (!lastName) errors.lastName = MSG.lastName;
    if (!EMAIL.test(email)) errors.email = MSG.email;
    if (!req.file) errors.cv = MSG.cv;
    else if (!CV_TYPES.includes(req.file.mimetype) && !/\.(pdf|docx)$/i.test(req.file.originalname)) errors.cv = MSG.cvType;
    if (!['on', 'true', '1', 'yes'].includes(String(b.consent))) errors.consent = MSG.consent;
    const salary = b.salaryExpectation === undefined || b.salaryExpectation === '' ? null : Number(b.salaryExpectation);
    if (salary !== null && !(salary >= 0)) errors.salaryExpectation = MSG.salary;
    if (Object.keys(errors).length) return res.status(422).json({ errors });

    if (job.deadline < berlinToday()) {
        return res.status(409).json({ error: 'closed', message: 'Applications for this job are closed.' });
    }
    if (applications.findByEmail(email, req.bugs.has('unique-email') ? null : job.id)) {
        return res.status(409).json({ error: 'already-applied', message: 'You have already applied with this email address.' });
    }

    const application = applications.create({
        jobId: job.id,
        firstName,
        lastName,
        email,
        phone: String(b.phone ?? '').trim(),
        startDate: String(b.startDate ?? ''),
        salaryExpectation: salary,
        coverLetter: String(b.coverLetter ?? ''),
        cv: { name: req.file.originalname, type: req.file.mimetype, size: req.file.size, data: req.file.buffer },
    });

    const delay = req.bugs.has('mail-delay') ? [2000, 8000] : 0;
    sendMail(
        email,
        `Your application for ${job.title}`,
        `Dear ${firstName} ${lastName},\n\nthank you for applying for ${job.title}. Your reference is ${application.reference}.\n\nKind regards\nHire Ground`,
        delay,
    );
    const notify = USERS.filter((u) => u.role === 'recruiter').filter(
        (u) => settings.get(req.bugs.has('global-settings') ? '*' : u.email)?.notifyOnNewApplication ?? true,
    );
    for (const u of notify.slice(0, 1)) {
        sendMail(u.email, `New application: ${job.title}`, `${firstName} ${lastName} applied for ${job.title}.`, delay);
    }

    res.status(201).json({ id: application.id, reference: application.reference, withdrawToken: application.withdrawToken });
});

// What a candidate may see with the reference from the confirmation.
api.get('/status/:reference', (req, res) => {
    const a = applications.byReference(req.params.reference);
    if (!a) return res.status(404).json({ error: 'not-found' });
    res.json({ reference: a.reference, firstName: a.firstName, jobTitle: a.jobTitle, stage: a.stage, interviewAt: a.interviewAt });
});

// Withdraw: the applicant (with the token from the create response) or a recruiter.
api.delete('/applications/:id', (req, res) => {
    const a = applications.secrets(req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    if (!req.user && req.get('x-withdraw-token') !== a.withdraw_token) {
        return res.status(403).json({ error: 'forbidden' });
    }
    applications.remove(a.id);
    res.status(204).end();
});

// ---- applications: the recruiter's side

api.get('/applications', requireRecruiter, (req, res) => {
    res.json(applications.list({ jobId: req.query.jobId }));
});

const candidateQuery = (req) => ({
    q: String(req.query.q ?? ''),
    stage: STAGES.includes(req.query.stage) ? req.query.stage : '',
    shortlisted: req.query.shortlisted === '1' || req.query.shortlisted === 'true',
    sort: String(req.query.sort ?? 'applied'),
    dir: req.query.dir === 'asc' ? 'asc' : 'desc',
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
});

// The candidates table: filtered, sorted, one page at a time. It takes a moment, like a real query.
api.get('/candidates', requireRecruiter, async (req, res) => {
    await sleep(150);
    const { all, ...page } = applications.search(candidateQuery(req));
    res.json(page);
});

api.get('/candidates/export.csv', requireRecruiter, (req, res) => {
    const { all } = applications.search(candidateQuery(req));
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
        ['Reference', 'First name', 'Last name', 'Email', 'Job', 'Stage', 'Rating', 'Applied'],
        ...all.map((a) => [a.reference, a.firstName, a.lastName, a.email, a.jobTitle, STAGE_LABEL[a.stage], a.rating, a.createdAt.slice(0, 10)]),
    ];
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="candidates.csv"');
    res.send(rows.map((r) => r.map(cell).join(',')).join('\n') + '\n');
});

api.get('/applications/:id', requireRecruiter, (req, res) => {
    const a = applications.get(req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    res.json(a);
});

// Saving takes a moment, like every write that goes through a real backend.
api.patch('/applications/:id', requireRecruiter, async (req, res) => {
    await sleep(150);
    const a = applications.get(req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    const b = req.body ?? {};
    const patch = {};
    const errors = {};
    if ('stage' in b) {
        if (STAGES.includes(b.stage)) patch.stage = b.stage;
        else errors.stage = 'Unknown stage.';
    }
    if ('rating' in b) {
        if (Number.isInteger(b.rating) && b.rating >= 0 && b.rating <= 5) patch.rating = b.rating;
        else errors.rating = 'A rating is a whole number from 0 to 5.';
    }
    if ('shortlisted' in b) patch.shortlisted = Boolean(b.shortlisted);
    if (Object.keys(errors).length) return res.status(422).json({ errors });
    if (!Object.keys(patch).length) return res.status(422).json({ errors: { stage: 'Unknown stage.' } });

    const updated = applications.update(a.id, patch);
    // The candidate hears about a decision by mail. The mail leaves through a queue: one to two seconds later.
    if (patch.stage && patch.stage !== a.stage && ['interview', 'offer', 'rejected'].includes(patch.stage)) {
        sendMail(
            a.email,
            `Status update: ${a.jobTitle}`,
            `Dear ${a.firstName} ${a.lastName},\n\nyour application for ${a.jobTitle} has a new status: ${STAGE_LABEL[patch.stage]}.\n\nKind regards\nHire Ground`,
            [1000, 2000],
        );
    }
    res.json(updated);
});

api.put('/applications/:id/interview', requireRecruiter, async (req, res) => {
    await sleep(150);
    const a = applications.get(req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    const at = new Date(String(req.body?.startsAt ?? ''));
    if (Number.isNaN(at.getTime())) return res.status(422).json({ errors: { startsAt: 'Please choose a date and a time.' } });
    const interviewAt = at.toISOString();
    const patch = { interviewAt };
    if (['new', 'screening'].includes(a.stage)) patch.stage = 'interview';
    const updated = applications.update(a.id, patch);
    sendMail(
        a.email,
        `Invitation to an interview: ${a.jobTitle}`,
        `Dear ${a.firstName} ${a.lastName},\n\nwe would like to meet you. Your interview for ${a.jobTitle}: ${berlinDateTime(interviewAt)} (Berlin time).\n\nKind regards\nHire Ground`,
        [1000, 2000],
    );
    res.json(updated);
});

api.post('/applications/:id/notes', requireRecruiter, (req, res) => {
    const a = applications.get(req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    const text = String(req.body?.text ?? '').trim();
    if (!text) return res.status(422).json({ errors: { text: 'Please enter a note.' } });
    res.status(201).json(applications.addNote(a.id, text, req.user.name));
});

api.get('/applications/:id/cv', requireRecruiter, (req, res) => {
    const cv = applications.cv(req.params.id);
    if (!cv) return res.status(404).json({ error: 'not-found' });
    res.set('Content-Type', cv.cv_type || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${cv.cv_name.replace(/"/g, '')}"`);
    res.send(Buffer.from(cv.cv_data));
});

// ---- sign-in, settings, mailbox

api.post('/auth/login', (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const user = USERS.find((u) => u.email === email);
    if (!user || req.body?.password !== PASSWORD) {
        return res.status(401).json({ error: 'invalid', message: 'Email or password is wrong.' });
    }
    const token = sessions.create(user.email);
    res.append('Set-Cookie', `hg_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
    res.json(user);
});

api.post('/auth/logout', (req, res) => {
    sessions.remove(req.cookies.hg_session);
    res.append('Set-Cookie', 'hg_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.status(204).end();
});

api.get('/auth/me', (req, res) => (req.user ? res.json(req.user) : res.status(401).json({ error: 'unauthenticated' })));

api.get('/settings', requireRecruiter, (req, res) => {
    res.json({ notifyOnNewApplication: true, ...settings.get(settingsKey(req)) });
});

api.put('/settings', requireRecruiter, (req, res) => {
    const next = { notifyOnNewApplication: Boolean(req.body?.notifyOnNewApplication) };
    settings.set(settingsKey(req), next);
    res.json(next);
});

// Test mailbox: replaces a mail server in the training.
api.get('/mail', (req, res) => res.json(mails.list(String(req.query.to ?? '').toLowerCase())));

api.get('/mail/:id', (req, res) => {
    const mail = mails.get(req.params.id);
    if (!mail) return res.status(404).json({ error: 'not-found' });
    res.json(mail);
});

// Test-only endpoint, disabled with HG_TEST_API=off. A staging system has no such button.
api.post('/test/reset', (_req, res) => {
    if (!TEST_API) return res.status(404).end();
    reset();
    res.status(204).end();
});

api.use((_req, res) => res.status(404).json({ error: 'not-found' }));

// ---------------------------------------------------------------- app

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cookies);
app.use(bugsMiddleware);
app.use(session);
app.use('/api', api);

if (DEV) {
    const { createServer } = await import('vite');
    const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
} else {
    const dist = join(root, 'dist');
    if (!existsSync(join(dist, 'index.html'))) {
        console.error('dist/ is missing. Run "npm run build" or use "npm start".');
        process.exit(1);
    }
    app.use(express.static(dist, { index: false }));
    app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(join(dist, 'index.html')) : next()));
}

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'internal' });
});

app.listen(PORT, () => {
    const on = [...new Set((process.env.BUGS ?? '').split(',').filter(Boolean))];
    console.log(`Hire Ground on http://localhost:${PORT}${on.length ? `  · BUGS=${on.join(',')}` : ''}`);
    console.log(`Database: ${DB_FILE}`);
});

startAnalytics();
