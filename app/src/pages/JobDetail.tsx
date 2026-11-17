import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Job } from '../api';
import { randomSuffix, useBug } from '../bugs';
import { Deadline } from '../components/Deadline';
import { SaveButton } from '../components/SaveButton';
import { deadlineStatus, formatSalary } from '../format';

export function JobDetail() {
    const { slug = '' } = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [missing, setMissing] = useState(false);
    const dupApply = useBug('dup-apply');
    const dynamicIds = useBug('dynamic-ids');
    const nbsp = useBug('nbsp-title');
    const utc = useBug('deadline-tz');
    const applyId = useMemo(() => (dynamicIds ? `apply-button-${randomSuffix()}` : 'apply-button'), [dynamicIds]);

    useEffect(() => {
        setJob(null);
        api.job(slug)
            .then(setJob)
            .catch(() => setMissing(true));
    }, [slug]);

    if (missing) {
        return (
            <section className="page">
                <h1>Job not found</h1>
                <p>
                    <Link to="/jobs">Back to all jobs</Link>
                </p>
            </section>
        );
    }
    if (!job) return <p className="page" role="status">Loading…</p>;

    const title = nbsp ? job.title.replace(/ /g, ' ') : job.title;
    const closed = deadlineStatus(job.deadline, utc) === 'closed';

    return (
        <article className="page job-detail">
            <p className="back">
                <Link to="/jobs">All jobs</Link>
            </p>
            <div className="title-row">
                <h1>{title}</h1>
                <SaveButton jobTitle={job.title} />
            </div>
            <p className="meta">
                {job.team} · {job.location}
                {job.remote ? ' · Remote possible' : ''}
            </p>
            <p className="salary">{formatSalary(job.salaryMin, job.salaryMax)}</p>
            <Deadline deadline={job.deadline} />
            <p>
                {closed ? (
                    <button type="button" className="button" disabled>
                        Applications closed
                    </button>
                ) : (
                    <Link id={applyId} to="apply" className="button primary">
                        Apply
                    </Link>
                )}
            </p>

            <h2>About the role</h2>
            {job.description.map((p) => (
                <p key={p}>{p}</p>
            ))}
            <h2>What you bring</h2>
            <ul>
                {job.requirements.map((r) => (
                    <li key={r}>{r}</li>
                ))}
            </ul>

            {dupApply && !closed && (
                <div className="sticky-apply">
                    <span>{title}</span>
                    <Link to="apply" className="button primary">
                        Apply
                    </Link>
                </div>
            )}
        </article>
    );
}
