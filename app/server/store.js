// In-memory data. POST /api/test/reset restores the seed; nothing survives a restart.

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

const slugify = (s) =>
    s.toLowerCase().replace(/ü/g, 'ue').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Today's date in Europe/Berlin as YYYY-MM-DD. */
export function berlinToday(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(now);
}

function addDays(isoDate, days) {
    const d = new Date(`${isoDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

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

// A valid one-page PDF, small enough to seed applications with.
export const SAMPLE_PDF = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
        '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);

const SEED_APPLICANTS = [
    ['Erika', 'Mustermann', 0, 'screening'],
    ['Max', 'Mustermann', 0, 'new'],
    ['Lena', 'Schmidt', 3, 'interview'],
    ['Jonas', 'Weber', 3, 'offer'],
    ['Aylin', 'Demir', 4, 'new'],
    ['Tobias', 'Fischer', 4, 'rejected'],
];

export const db = { jobs: [], applications: [], mails: [], settings: new Map(), seq: 0 };

export const nextId = () => String(++db.seq);
export const reference = () => `HG-${String(Math.floor(100000 + Math.random() * 900000))}`;

export function reset() {
    const today = berlinToday();
    db.seq = 0;
    db.jobs = JOBS.map((j) => ({
        id: nextId(),
        slug: slugify(j.title),
        title: j.title,
        team: j.team,
        location: j.location,
        remote: j.remote,
        salaryMin: j.salary[0],
        salaryMax: j.salary[1],
        deadline: addDays(today, j.closesIn),
        ...describe(j),
    }));
    db.seq = 100;
    db.applications = SEED_APPLICANTS.map(([firstName, lastName, jobIndex, stage], i) => ({
        id: nextId(),
        reference: `HG-${String(400100 + i)}`,
        withdrawToken: crypto.randomUUID(),
        jobId: db.jobs[jobIndex].id,
        firstName,
        lastName,
        email: `${firstName}.${lastName}@example.com`.toLowerCase(),
        phone: '',
        startDate: '',
        salaryExpectation: null,
        coverLetter: '',
        cv: { name: `cv-${lastName.toLowerCase()}.pdf`, type: 'application/pdf', size: SAMPLE_PDF.length, data: SAMPLE_PDF },
        stage,
        notes: [],
        createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    }));
    db.mails = [];
    db.settings = new Map();
}

reset();
