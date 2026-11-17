import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, STAGES, type Application, type Stage } from '../api';
import { formatBytes, formatDate, formatDateTime } from '../format';

export function Candidate() {
    const { id = '' } = useParams();
    const [a, setA] = useState<Application | null>(null);
    const [missing, setMissing] = useState(false);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        api.application(id)
            .then(setA)
            .catch(() => setMissing(true));
    }, [id]);

    if (missing) {
        return (
            <section className="page">
                <h1>Application not found</h1>
                <p>
                    <Link to="/recruiter">Back to the pipeline</Link>
                </p>
            </section>
        );
    }
    if (!a) return <p role="status">Loading…</p>;

    return (
        <section className="page">
            <p className="back">
                <Link to="/recruiter">Pipeline</Link>
            </p>
            <h1>
                {a.firstName} {a.lastName}
            </h1>
            <dl className="facts">
                <dt>Job</dt>
                <dd>{a.jobTitle}</dd>
                <dt>Reference</dt>
                <dd>{a.reference}</dd>
                <dt>Email</dt>
                <dd>{a.email}</dd>
                <dt>Phone</dt>
                <dd>{a.phone || '–'}</dd>
                <dt>Applied</dt>
                <dd>{formatDateTime(a.createdAt)}</dd>
                <dt>Earliest start</dt>
                <dd>{a.startDate ? formatDate(a.startDate) : '–'}</dd>
                <dt>Salary expectation</dt>
                <dd>{a.salaryExpectation != null ? `${new Intl.NumberFormat('de-DE').format(a.salaryExpectation)} €` : '–'}</dd>
            </dl>

            <div className="field inline">
                <label htmlFor="stage">Stage</label>
                <select
                    id="stage"
                    value={a.stage}
                    onChange={async (e) => {
                        const updated = await api.moveApplication(a.id, e.target.value as Stage);
                        setA(updated);
                        setStatus(`Stage changed to ${STAGES.find((s) => s.id === updated.stage)?.label}.`);
                    }}
                >
                    {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            <p>
                <a href={`/api/applications/${a.id}/cv`} download={a.cv.name}>
                    Download CV
                </a>{' '}
                <span className="hint">
                    {a.cv.name}, {formatBytes(a.cv.size)}
                </span>
            </p>

            {a.coverLetter && (
                <>
                    <h2>Cover letter</h2>
                    <p className="pre">{a.coverLetter}</p>
                </>
            )}

            <h2>Notes</h2>
            {a.notes.length ? (
                <ul className="notes">
                    {a.notes.map((n) => (
                        <li key={n.id}>
                            <p>{n.text}</p>
                            <p className="meta">
                                {n.author} · {formatDateTime(n.createdAt)}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty">No notes yet.</p>
            )}
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!note.trim()) return;
                    setA(await api.addNote(a.id, note));
                    setNote('');
                    setStatus('Note added.');
                }}
            >
                <div className="field">
                    <label htmlFor="note">Note</label>
                    <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <button type="submit" className="button">
                    Add note
                </button>
            </form>
            <p role="status" className="status-line">
                {status}
            </p>
        </section>
    );
}
