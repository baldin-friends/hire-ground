import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type Job } from '../api';
import { randomSuffix, useBug } from '../bugs';
import { Deadline } from '../components/Deadline';
import { LocationFilter } from '../components/LocationFilter';
import { SaveButton } from '../components/SaveButton';
import { formatSalary } from '../format';

const TEAMS = ['Engineering', 'QA', 'Product', 'Sales', 'People'];

export function Jobs() {
    const debounce = useBug('debounce-search');
    const [params, setParams] = useSearchParams();

    // Local state is the source of truth, so controls update synchronously;
    // the URL follows for deep links (/jobs?q=QA&location=Dresden).
    const [filters, setFilters] = useState(() => ({
        q: params.get('q') ?? '',
        location: params.get('location') ?? '',
        team: params.get('team') ?? '',
        remote: params.get('remote') === '1',
    }));
    const { q, location, team, remote } = filters;
    const update = (patch: Partial<typeof filters>) => setFilters((f) => ({ ...f, ...patch }));

    const [draft, setDraft] = useState(q);
    const [jobs, setJobs] = useState<Job[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const latest = useRef(0);

    useEffect(() => {
        const next = new URLSearchParams();
        if (q) next.set('q', q);
        if (location) next.set('location', location);
        if (team) next.set('team', team);
        if (remote) next.set('remote', '1');
        setParams(next, { replace: true });
    }, [q, location, team, remote, setParams]);

    // debounce-search: the query follows the input 400 ms after the last key.
    useEffect(() => {
        if (!debounce || draft.trim() === q) return;
        const t = setTimeout(() => update({ q: draft.trim() }), 400);
        return () => clearTimeout(t);
    }, [debounce, draft, q]);

    // Old results stay on screen until the new ones arrive, like on most sites.
    useEffect(() => {
        const id = ++latest.current;
        const search = new URLSearchParams();
        if (q) search.set('q', q);
        if (location) search.set('location', location);
        if (team) search.set('team', team);
        if (remote) search.set('remote', '1');
        setLoading(true);
        setFailed(false);
        api.jobs(search)
            .then((list) => id === latest.current && setJobs(list))
            .catch(() => {
                if (id !== latest.current) return;
                setFailed(true);
                setJobs([]);
            })
            .finally(() => id === latest.current && setLoading(false));
    }, [q, location, team, remote]);

    const count = jobs === null ? 'Loading jobs…' : loading ? 'Searching…' : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}`;

    return (
        <section className="page">
            <h1>Open positions</h1>
            <p className="lead">Twelve jobs, one application form, no cover letter required.</p>

            <form
                role="search"
                aria-label="Job search"
                className="filters"
                onSubmit={(e) => {
                    e.preventDefault();
                    update({ q: draft.trim() });
                }}
            >
                <div className="field inline grow">
                    <label htmlFor="q">Search jobs</label>
                    <input id="q" type="search" value={draft} placeholder="Job title or team" onChange={(e) => setDraft(e.target.value)} />
                </div>
                {!debounce && (
                    <button type="submit" className="button primary">
                        Search
                    </button>
                )}
                <LocationFilter value={location} onChange={(v) => update({ location: v })} />
                <div className="field inline">
                    <label htmlFor="team">Team</label>
                    <select id="team" value={team} onChange={(e) => update({ team: e.target.value })}>
                        <option value="">All teams</option>
                        {TEAMS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
                <label className="checkbox">
                    <input type="checkbox" checked={remote} onChange={(e) => update({ remote: e.target.checked })} />
                    Remote only
                </label>
            </form>

            <p role="status" className="result-count">
                {count}
            </p>
            {failed && <p role="alert">Jobs could not be loaded. Please try again.</p>}
            {jobs && jobs.length === 0 && !loading && !failed && <p className="empty">No jobs found. Try another search.</p>}

            <ul className="job-list" aria-busy={loading}>
                {jobs?.map((job) => (
                    <li key={job.id}>
                        <JobCard job={job} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

function JobCard({ job }: { job: Job }) {
    const dynamicIds = useBug('dynamic-ids');
    const nbsp = useBug('nbsp-title');
    const suffix = useMemo(() => (dynamicIds ? `-${randomSuffix()}` : ''), [dynamicIds]);
    const title = nbsp ? job.title.replace(/ /g, ' ') : job.title;
    const titleId = `job-title-${job.id}${suffix}`;

    return (
        <article className="job-card" id={`job-${job.id}${suffix}`} aria-labelledby={titleId}>
            <div className="job-card-main">
                <h2 id={titleId}>
                    <Link to={`/jobs/${job.slug}`}>{title}</Link>
                </h2>
                <p className="meta">
                    {job.team} · {job.location}
                    {job.remote ? ' · Remote possible' : ''}
                </p>
                <p className="salary">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                <Deadline deadline={job.deadline} />
            </div>
            <SaveButton jobTitle={job.title} />
        </article>
    );
}
