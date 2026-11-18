import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, HttpError, type Job } from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IconButton } from '../components/IconButton';
import { useToast } from '../components/Toasts';
import { formatDate } from '../format';

export function JobsAdmin() {
    const notify = useToast();
    const [jobs, setJobs] = useState<Job[] | null>(null);
    const [confirm, setConfirm] = useState<Job | null>(null);

    const load = () => api.adminJobs().then(setJobs);
    useEffect(() => {
        load();
    }, []);

    async function setStatus(job: Job, status: Job['status']) {
        await api.setJobStatus(job.id, status);
        notify(status === 'published' ? `${job.title} is published.` : `${job.title} is a draft again.`);
        load();
    }

    async function remove(job: Job) {
        setConfirm(null);
        try {
            await api.deleteJob(job.id);
            notify(`${job.title} deleted.`);
        } catch (e) {
            notify(e instanceof HttpError && e.body?.message ? e.body.message : 'The job could not be deleted.', 'error');
        }
        load();
    }

    if (!jobs) return <p role="status">Loading jobs…</p>;

    return (
        <section className="page wide">
            <div className="title-row">
                <h1>Jobs</h1>
                <Link className="button primary" to="/recruiter/jobs/new">
                    New job
                </Link>
            </div>
            <p className="result-count" role="status">
                {jobs.length} job{jobs.length === 1 ? '' : 's'}
            </p>
            <table className="candidates">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Team</th>
                        <th>Location</th>
                        <th>Deadline</th>
                        <th>Status</th>
                        <th>Applications</th>
                        <th>
                            <span className="visually-hidden">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job.id} data-qa="job-row">
                            <td>
                                {/* the career page opens in a new tab */}
                                <a href={`/jobs/${job.slug}`} target="_blank" rel="noreferrer">
                                    {job.title}
                                </a>
                            </td>
                            <td>{job.team}</td>
                            <td>{job.location}</td>
                            <td>{formatDate(job.deadline)}</td>
                            <td>
                                <span className={`badge ${job.status}`}>{job.status === 'published' ? 'Published' : 'Draft'}</span>
                            </td>
                            <td>{job.applications}</td>
                            <td className="row-actions">
                                {job.status === 'draft' ? (
                                    <button type="button" className="button" onClick={() => setStatus(job, 'published')}>
                                        Publish
                                    </button>
                                ) : (
                                    <button type="button" className="button" onClick={() => setStatus(job, 'draft')}>
                                        Unpublish
                                    </button>
                                )}
                                <IconButton icon="trash" onClick={() => setConfirm(job)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {confirm && (
                <ConfirmDialog title={`Delete ${confirm.title}?`} confirmLabel="Delete" onConfirm={() => remove(confirm)} onCancel={() => setConfirm(null)}>
                    <p>A job with applications cannot be deleted.</p>
                </ConfirmDialog>
            )}
        </section>
    );
}
