export type Job = {
    id: string;
    slug: string;
    title: string;
    team: string;
    location: string;
    remote: boolean;
    salaryMin: number;
    salaryMax: number;
    deadline: string;
    summary: string;
    description: string[];
    requirements: string[];
};

export type Stage = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export const STAGES: { id: Stage; label: string }[] = [
    { id: 'new', label: 'New' },
    { id: 'screening', label: 'Screening' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'hired', label: 'Hired' },
    { id: 'rejected', label: 'Rejected' },
];

export type Application = {
    id: string;
    reference: string;
    jobId: string;
    jobTitle: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    startDate: string;
    salaryExpectation: number | null;
    coverLetter: string;
    cv: { name: string; type: string; size: number };
    stage: Stage;
    notes: { id: string; text: string; author: string; createdAt: string }[];
    createdAt: string;
};

export type User = { email: string; name: string; role: 'recruiter' | 'admin' };

export type Mail = { id: string; to: string; subject: string; body: string; createdAt: string };

export class HttpError extends Error {
    constructor(
        public status: number,
        public body: any,
    ) {
        super(`HTTP ${status}`);
    }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) throw new HttpError(res.status, body);
    return body as T;
}

const json = (method: string, data: unknown): RequestInit => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
});

export const api = {
    jobs: (params: URLSearchParams) => request<Job[]>(`/api/jobs?${params}`),
    job: (slug: string) => request<Job>(`/api/jobs/${encodeURIComponent(slug)}`),
    apply: (form: FormData) =>
        request<{ id: string; reference: string; withdrawToken: string }>('/api/applications', { method: 'POST', body: form }),
    applications: () => request<Application[]>('/api/applications'),
    application: (id: string) => request<Application>(`/api/applications/${id}`),
    moveApplication: (id: string, stage: Stage) => request<Application>(`/api/applications/${id}`, json('PATCH', { stage })),
    addNote: (id: string, text: string) => request<Application>(`/api/applications/${id}/notes`, json('POST', { text })),
    login: (email: string, password: string) => request<User>('/api/auth/login', json('POST', { email, password })),
    logout: () => request<null>('/api/auth/logout', { method: 'POST' }),
    me: () => request<User>('/api/auth/me'),
    settings: () => request<{ notifyOnNewApplication: boolean }>('/api/settings'),
    saveSettings: (s: { notifyOnNewApplication: boolean }) => request<typeof s>('/api/settings', json('PUT', s)),
    mail: () => request<Mail[]>('/api/mail'),
};
