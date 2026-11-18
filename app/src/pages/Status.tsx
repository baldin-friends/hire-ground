import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type ApplicationStatus, type Stage } from '../api';
import { formatLocalDateTime, localTimeZone } from '../format';

// What the candidate reads. The pipeline has six stages; a candidate sees four words.
const WORDING: Record<Stage, string> = {
    new: 'We have received your application.',
    screening: 'We are reading your application.',
    interview: 'We would like to meet you.',
    offer: 'We have made you an offer.',
    hired: 'Welcome to the team.',
    rejected: 'We have decided to continue with other candidates.',
};

export function Status() {
    const { reference = '' } = useParams();
    const [status, setStatus] = useState<ApplicationStatus | null>(null);
    const [missing, setMissing] = useState(false);

    useEffect(() => {
        api.status(reference)
            .then(setStatus)
            .catch(() => setMissing(true));
    }, [reference]);

    if (missing) {
        return (
            <section className="page narrow">
                <h1>Application not found</h1>
                <p>We know no application with the reference {reference}.</p>
            </section>
        );
    }
    if (!status) return <p role="status">Loading…</p>;

    return (
        <section className="page narrow">
            <h1>Your application</h1>
            <dl className="facts">
                <dt>Reference</dt>
                <dd>{status.reference}</dd>
                <dt>Job</dt>
                <dd>{status.jobTitle}</dd>
                <dt>Status</dt>
                <dd>{WORDING[status.stage]}</dd>
                {status.interviewAt && (
                    <>
                        <dt>Interview</dt>
                        <dd>
                            {/* an instant, shown in the time zone of this browser */}
                            <time dateTime={status.interviewAt}>{formatLocalDateTime(status.interviewAt)}</time>{' '}
                            <span className="hint">({localTimeZone()})</span>
                        </dd>
                    </>
                )}
            </dl>
            <p>
                <Link to="/jobs">Back to all jobs</Link>
            </p>
        </section>
    );
}
