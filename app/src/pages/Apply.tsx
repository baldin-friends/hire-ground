import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, HttpError, type Job } from '../api';
import { useBug } from '../bugs';
import { formatBytes } from '../format';

type Field = 'firstName' | 'lastName' | 'email' | 'cv' | 'consent' | 'salaryExpectation';
type Errors = Partial<Record<Field, string>>;

const MAX_CV = 5 * 1024 * 1024;
const CV_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', startDate: '', salaryExpectation: '', coverLetter: '' };

export function Apply() {
    const { slug = '' } = useParams();
    const navigate = useNavigate();
    const toastOverlay = useBug('toast-overlay');

    const [job, setJob] = useState<Job | null>(null);
    const [values, setValues] = useState(EMPTY);
    const [consent, setConsent] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(false);

    useEffect(() => {
        api.job(slug)
            .then(setJob)
            .catch(() => navigate('/jobs', { replace: true }));
    }, [slug, navigate]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(false), 800);
        return () => clearTimeout(t);
    }, [toast]);

    if (!job) return <p className="page" role="status">Loading…</p>;

    const set = (k: keyof typeof EMPTY) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [k]: e.target.value }));

    const describe = (k: Field) => ({
        'aria-invalid': errors[k] ? true : undefined,
        'aria-describedby': errors[k] ? `${k}-error` : undefined,
    });

    const error = (k: Field) =>
        errors[k] ? (
            <p id={`${k}-error`} className="field-error">
                {errors[k]}
            </p>
        ) : null;

    function validate(): Errors {
        const e: Errors = {};
        if (!values.firstName.trim()) e.firstName = 'Please enter your first name.';
        if (!values.lastName.trim()) e.lastName = 'Please enter your last name.';
        if (!EMAIL.test(values.email.trim())) e.email = 'Please enter a valid email address.';
        if (!file) e.cv = 'Please upload your CV.';
        else if (!CV_TYPES.includes(file.type) && !/\.(pdf|docx)$/i.test(file.name)) e.cv = 'Your CV must be a PDF or Word file.';
        else if (file.size > MAX_CV) e.cv = 'Your CV must not be larger than 5 MB.';
        if (values.salaryExpectation && !(Number(values.salaryExpectation) >= 0)) e.salaryExpectation = 'Please enter a positive number.';
        if (!consent) e.consent = 'Please agree to the privacy notice.';
        return e;
    }

    async function submit(e: FormEvent) {
        e.preventDefault();
        if (!job) return;
        setFormError('');
        const found = validate();
        setErrors(found);
        const first = Object.keys(found)[0];
        if (first) {
            document.getElementById(first)?.focus();
            return;
        }
        const form = new FormData();
        for (const [k, v] of Object.entries(values)) form.set(k, v.trim());
        form.set('jobId', job.id);
        form.set('consent', 'true');
        form.set('cv', file!);
        setSubmitting(true);
        try {
            const res = await api.apply(form);
            navigate(`/applied/${res.reference}`, { state: { email: values.email.trim(), title: job.title } });
        } catch (err) {
            if (err instanceof HttpError && err.status === 422) setErrors(err.body?.errors ?? {});
            else if (err instanceof HttpError && err.status === 409) setFormError(err.body?.message ?? 'You have already applied.');
            else setFormError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const pickFile = (f: File | null | undefined) => {
        setFile(f ?? null);
        setErrors(({ cv, ...rest }) => rest);
    };

    return (
        <section className="page narrow">
            <p className="back">
                <Link to={`/jobs/${job.slug}`}>{job.title}</Link>
            </p>
            <h1>Apply for {job.title}</h1>
            <p className="lead">Fields marked optional can stay empty. Everything else we need.</p>

            <form onSubmit={submit} noValidate className="apply-form">
                <div className="row two">
                    <div className="field">
                        <label htmlFor="firstName">First name</label>
                        <input id="firstName" autoComplete="given-name" value={values.firstName} onChange={set('firstName')} {...describe('firstName')} />
                        {error('firstName')}
                    </div>
                    <div className="field">
                        <label htmlFor="lastName">Last name</label>
                        <input id="lastName" autoComplete="family-name" value={values.lastName} onChange={set('lastName')} {...describe('lastName')} />
                        {error('lastName')}
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} {...describe('email')} />
                    {error('email')}
                </div>

                <div className="field">
                    <label htmlFor="phone">Phone (optional)</label>
                    <input id="phone" type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} />
                </div>

                <div className="field">
                    <label htmlFor="cv">CV (PDF or Word, max. 5 MB)</label>
                    <div
                        className={`dropzone${dragOver ? ' over' : ''}`}
                        data-testid="cv-dropzone"
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            pickFile(e.dataTransfer.files[0]);
                        }}
                    >
                        <input
                            id="cv"
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => pickFile(e.target.files?.[0])}
                            {...describe('cv')}
                        />
                        <span className="hint">or drop the file here</span>
                    </div>
                    {file && (
                        <p className="hint" data-testid="cv-selected">
                            Selected: {file.name} ({formatBytes(file.size)})
                        </p>
                    )}
                    {error('cv')}
                </div>

                <div className="row two">
                    <div className="field">
                        <label htmlFor="startDate">Earliest start date (optional)</label>
                        <input id="startDate" type="date" value={values.startDate} onChange={set('startDate')} />
                    </div>
                    <div className="field">
                        <label htmlFor="salaryExpectation">Salary expectation in € per year (optional)</label>
                        <input
                            id="salaryExpectation"
                            type="number"
                            min={0}
                            step={1000}
                            value={values.salaryExpectation}
                            onChange={set('salaryExpectation')}
                            {...describe('salaryExpectation')}
                        />
                        {error('salaryExpectation')}
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="coverLetter">Cover letter (optional)</label>
                    <textarea id="coverLetter" rows={5} value={values.coverLetter} onChange={set('coverLetter')} />
                </div>

                <div className="field">
                    <label className="checkbox">
                        <input
                            id="consent"
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => {
                                setConsent(e.target.checked);
                                if (e.target.checked) setToast(true);
                                setErrors(({ consent: _c, ...rest }) => rest);
                            }}
                            {...describe('consent')}
                        />
                        I agree that Hire Ground stores my data for this application.
                    </label>
                    {error('consent')}
                </div>

                {formError && (
                    <p role="alert" className="form-error">
                        {formError}
                    </p>
                )}

                <div className="actions">
                    <button type="submit" className="button primary" disabled={submitting}>
                        {submitting ? 'Sending…' : 'Submit application'}
                    </button>
                    {toast && (
                        <div role="status" className={toastOverlay ? 'toast overlay' : 'toast'} onClick={() => setToast(false)}>
                            Draft saved
                        </div>
                    )}
                </div>
            </form>
        </section>
    );
}
