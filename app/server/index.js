// Hire Ground server: REST API, test endpoints and the built frontend on one port.
//   npm start        build the frontend, serve on http://localhost:3000
//   npm run dev      same port, Vite middleware with hot reload

import express from 'express';
import multer from 'multer';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLAGS, bugsMiddleware } from './bugs.js';
import { PASSWORD, STAGES, USERS, berlinToday, db, nextId, reference, reset } from './store.js';
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

const sessions = new Map(); // token → email

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

const jobOut = (j) => ({ ...j });
const applicationOut = (a) => {
    const job = db.jobs.find((j) => j.id === a.jobId);
    const { cv, withdrawToken, ...rest } = a;
    return { ...rest, jobTitle: job?.title ?? '', cv: { name: cv.name, type: cv.type, size: cv.size } };
};

function sendMail(req, to, subject, body) {
    const mail = { id: nextId(), to, subject, body, createdAt: new Date().toISOString() };
    const deliver = () => db.mails.unshift({ ...mail, createdAt: new Date().toISOString() });
    if (req.bugs.has('mail-delay')) setTimeout(deliver, between(2000, 8000));
    else deliver();
}

function settingsKey(req) {
    return req.bugs.has('global-settings') ? '*' : req.user.email;
}

// ---------------------------------------------------------------- API

const api = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_CV, files: 1 } });

api.get('/health', (_req, res) => res.json({ ok: true }));

api.get('/config', (req, res) => res.json({ bugs: [...req.bugs], flags: FLAGS }));

api.get('/jobs', async (req, res) => {
    if (req.bugs.has('slow-search')) await sleep(between(300, 1500));
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const { location = '', team = '' } = req.query;
    const remote = req.query.remote === '1' || req.query.remote === 'true';
    const jobs = db.jobs.filter(
        (j) =>
            (!q || `${j.title} ${j.team}`.toLowerCase().includes(q)) &&
            (!location || j.location === location) &&
            (!team || j.team === team) &&
            (!remote || j.remote),
    );
    res.json(jobs.map(jobOut));
});

api.get('/jobs/:slug', (req, res) => {
    const job = db.jobs.find((j) => j.slug === req.params.slug || j.id === req.params.slug);
    if (!job) return res.status(404).json({ error: 'not-found' });
    res.json(jobOut(job));
});

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
    const job = db.jobs.find((j) => j.id === b.jobId || j.slug === b.jobId);
    if (!job) return res.status(422).json({ errors: { jobId: 'Unknown job.' } });

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
    const duplicate = db.applications.find(
        (a) => a.email === email && (req.bugs.has('unique-email') || a.jobId === job.id),
    );
    if (duplicate) {
        return res.status(409).json({ error: 'already-applied', message: 'You have already applied with this email address.' });
    }

    const application = {
        id: nextId(),
        reference: reference(),
        withdrawToken: crypto.randomUUID(),
        jobId: job.id,
        firstName,
        lastName,
        email,
        phone: String(b.phone ?? '').trim(),
        startDate: String(b.startDate ?? ''),
        salaryExpectation: salary,
        coverLetter: String(b.coverLetter ?? ''),
        cv: { name: req.file.originalname, type: req.file.mimetype, size: req.file.size, data: req.file.buffer },
        stage: 'new',
        notes: [],
        createdAt: new Date().toISOString(),
    };
    db.applications.push(application);

    sendMail(
        req,
        email,
        `Your application for ${job.title}`,
        `Dear ${firstName} ${lastName},\n\nthank you for applying for ${job.title}. Your reference is ${application.reference}.\n\nKind regards\nHire Ground`,
    );
    const notify = USERS.filter((u) => u.role === 'recruiter').filter(
        (u) => (db.settings.get(req.bugs.has('global-settings') ? '*' : u.email)?.notifyOnNewApplication ?? true),
    );
    for (const u of notify.slice(0, 1)) {
        sendMail(req, u.email, `New application: ${job.title}`, `${firstName} ${lastName} applied for ${job.title}.`);
    }

    res.status(201).json({ id: application.id, reference: application.reference, withdrawToken: application.withdrawToken });
});

api.get('/applications', requireRecruiter, (req, res) => {
    const list = db.applications.filter((a) => !req.query.jobId || a.jobId === req.query.jobId);
    res.json(list.map(applicationOut));
});

api.get('/applications/:id', requireRecruiter, (req, res) => {
    const a = db.applications.find((x) => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    res.json(applicationOut(a));
});

api.patch('/applications/:id', requireRecruiter, (req, res) => {
    const a = db.applications.find((x) => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    if (!STAGES.includes(req.body?.stage)) return res.status(422).json({ errors: { stage: 'Unknown stage.' } });
    a.stage = req.body.stage;
    res.json(applicationOut(a));
});

api.post('/applications/:id/notes', requireRecruiter, (req, res) => {
    const a = db.applications.find((x) => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    const text = String(req.body?.text ?? '').trim();
    if (!text) return res.status(422).json({ errors: { text: 'Please enter a note.' } });
    a.notes.push({ id: nextId(), text, author: req.user.name, createdAt: new Date().toISOString() });
    res.status(201).json(applicationOut(a));
});

api.get('/applications/:id/cv', requireRecruiter, (req, res) => {
    const a = db.applications.find((x) => x.id === req.params.id);
    if (!a) return res.status(404).json({ error: 'not-found' });
    res.set('Content-Type', a.cv.type || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${a.cv.name.replace(/"/g, '')}"`);
    res.send(a.cv.data);
});

// Withdraw: the applicant (with the token from the create response) or a recruiter.
api.delete('/applications/:id', (req, res) => {
    const i = db.applications.findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'not-found' });
    if (!req.user && req.get('x-withdraw-token') !== db.applications[i].withdrawToken) {
        return res.status(403).json({ error: 'forbidden' });
    }
    db.applications.splice(i, 1);
    res.status(204).end();
});

api.post('/auth/login', (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const user = USERS.find((u) => u.email === email);
    if (!user || req.body?.password !== PASSWORD) {
        return res.status(401).json({ error: 'invalid', message: 'Email or password is wrong.' });
    }
    const token = crypto.randomUUID();
    sessions.set(token, user.email);
    res.append('Set-Cookie', `hg_session=${token}; Path=/; HttpOnly; SameSite=Lax`);
    res.json(user);
});

api.post('/auth/logout', (req, res) => {
    sessions.delete(req.cookies.hg_session);
    res.append('Set-Cookie', 'hg_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.status(204).end();
});

api.get('/auth/me', (req, res) => (req.user ? res.json(req.user) : res.status(401).json({ error: 'unauthenticated' })));

api.get('/settings', requireRecruiter, (req, res) => {
    res.json({ notifyOnNewApplication: true, ...db.settings.get(settingsKey(req)) });
});

api.put('/settings', requireRecruiter, (req, res) => {
    const next = { notifyOnNewApplication: Boolean(req.body?.notifyOnNewApplication) };
    db.settings.set(settingsKey(req), next);
    res.json(next);
});

// Test mailbox: replaces a mail server in the training.
api.get('/mail', (req, res) => {
    const to = String(req.query.to ?? '').toLowerCase();
    res.json(db.mails.filter((m) => !to || m.to === to));
});

api.get('/mail/:id', (req, res) => {
    const mail = db.mails.find((m) => m.id === req.params.id);
    if (!mail) return res.status(404).json({ error: 'not-found' });
    res.json(mail);
});

// Test-only endpoints, disabled with HG_TEST_API=off.
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
});

startAnalytics();
