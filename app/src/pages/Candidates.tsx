import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, STAGES, type Application, type CandidatePage, type Stage } from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IconButton } from '../components/IconButton';
import { Rating } from '../components/Rating';
import { StageSelect } from '../components/StageSelect';
import { useToast } from '../components/Toasts';
import { daysSince, formatDate, formatInterviewDay } from '../format';

const label = (s: Stage) => STAGES.find((x) => x.id === s)?.label ?? s;
const fullName = (a: Application) => `${a.firstName} ${a.lastName}`;
const OVERDUE_AFTER_DAYS = 14;
const SEARCH_DELAY = 300;

type SortKey = 'name' | 'applied' | 'rating';

export function Candidates() {
    const notify = useToast();
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState<CandidatePage | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(params.get('q') ?? '');
    // the checkbox keeps its own state: the address changes a moment later, and a controlled checkbox would jump back until then
    const [shortlistedOnly, setShortlistedOnly] = useState(params.get('shortlisted') === '1');
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
    const [confirm, setConfirm] = useState<Application[] | null>(null);

    const query = params.toString();
    const stage = (params.get('stage') ?? '') as Stage | '';
    const sort = (params.get('sort') ?? 'applied') as SortKey;
    const dir = params.get('dir') === 'asc' ? 'asc' : 'desc';

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setData(await api.candidates(new URLSearchParams(query)));
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        load();
    }, [load]);

    const change = (patch: Record<string, string>) => {
        const next = new URLSearchParams(params);
        for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value);
            else next.delete(key);
        }
        if (!('page' in patch)) next.delete('page'); // a new filter starts on page 1
        setParams(next, { replace: true });
    };

    // The search runs 300 ms after the last key, not on every key.
    useEffect(() => {
        if (search === (params.get('q') ?? '')) return;
        const timer = setTimeout(() => change({ q: search }), SEARCH_DELAY);
        return () => clearTimeout(timer);
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    const patchRow = (id: string, patch: Partial<Application>) =>
        setData((d) => d && { ...d, items: d.items.map((a) => (a.id === id ? { ...a, ...patch } : a)) });

    async function move(a: Application, next: Stage) {
        patchRow(a.id, { stage: next }); // show it at once, save it afterwards
        try {
            await api.updateApplication(a.id, { stage: next });
            notify(`${fullName(a)} moved to ${label(next)}.`);
            if (stage) load();
        } catch {
            patchRow(a.id, { stage: a.stage });
            notify('The stage could not be saved. The change was undone.', 'error');
        }
    }

    async function shortlist(a: Application) {
        const next = !a.shortlisted;
        patchRow(a.id, { shortlisted: next });
        try {
            await api.updateApplication(a.id, { shortlisted: next });
            notify(`${fullName(a)} ${next ? 'added to' : 'removed from'} the shortlist.`);
        } catch {
            patchRow(a.id, { shortlisted: a.shortlisted });
            notify('The shortlist could not be saved.', 'error');
        }
    }

    // A rating is saved without a message.
    async function rate(a: Application, rating: number) {
        patchRow(a.id, { rating });
        await api.updateApplication(a.id, { rating }).catch(() => patchRow(a.id, { rating: a.rating }));
    }

    async function reject(list: Application[]) {
        setConfirm(null);
        try {
            for (const a of list) await api.updateApplication(a.id, { stage: 'rejected' });
            notify(list.length === 1 ? `${fullName(list[0])} rejected.` : `${list.length} candidates rejected.`);
        } catch {
            notify('Not every candidate could be rejected.', 'error');
        }
        setSelected(new Set());
        load();
    }

    const toggle = (id: string) =>
        setSelected((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const items = data?.items ?? [];
    const chosen = items.filter((a) => selected.has(a.id));
    const allChosen = items.length > 0 && chosen.length === items.length;

    const sortHeader = (key: SortKey, text: string) => (
        <th aria-sort={sort === key ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <button
                type="button"
                className="sort"
                onClick={() => change({ sort: key, dir: sort === key && dir === 'asc' ? 'desc' : 'asc' })}
            >
                {text}
            </button>
        </th>
    );

    return (
        <section className="page wide">
            <h1>Candidates</h1>

            <div className="filters">
                <div className="field grow">
                    <label htmlFor="candidate-search">Search</label>
                    <input
                        id="candidate-search"
                        type="search"
                        placeholder="Name, email or job"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="field inline">
                    <span className="label">Stage</span>
                    <StageSelect value={stage} allowAll qa="stage-filter" onChange={(value) => change({ stage: value })} />
                </div>
                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={shortlistedOnly}
                        onChange={(e) => {
                            setShortlistedOnly(e.target.checked);
                            change({ shortlisted: e.target.checked ? '1' : '' });
                        }}
                    />
                    Shortlisted only
                </label>
                <a className="button" href={`/api/candidates/export.csv?${query}`} download="candidates.csv">
                    Export CSV
                </a>
            </div>

            <div className="table-bar">
                <p className="result-count" role="status">
                    {data ? `${data.total} candidate${data.total === 1 ? '' : 's'}` : 'Loading candidates…'}
                </p>
                {chosen.length > 0 && (
                    <div className="bulk">
                        <span>{chosen.length} selected</span>
                        <button type="button" className="button danger" onClick={() => setConfirm(chosen)}>
                            Reject selected
                        </button>
                    </div>
                )}
            </div>

            <table className="candidates" aria-busy={loading}>
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                aria-label="Select all on this page"
                                checked={allChosen}
                                onChange={() => setSelected(allChosen ? new Set() : new Set(items.map((a) => a.id)))}
                            />
                        </th>
                        {sortHeader('name', 'Name')}
                        <th>Job</th>
                        {sortHeader('applied', 'Applied')}
                        <th>Stage</th>
                        <th>Interview</th>
                        {sortHeader('rating', 'Rating')}
                        <th>
                            <span className="visually-hidden">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((a) => {
                        const waiting = daysSince(a.createdAt);
                        return (
                            <tr key={a.id} data-qa="candidate-row" className={a.shortlisted ? 'is-shortlisted' : undefined}>
                                <td>
                                    <input
                                        type="checkbox"
                                        aria-label={`Select ${fullName(a)}`}
                                        checked={selected.has(a.id)}
                                        onChange={() => toggle(a.id)}
                                    />
                                </td>
                                <td>
                                    <Link to={`/recruiter/applications/${a.id}`}>{fullName(a)}</Link>
                                    {a.stage === 'new' && waiting > OVERDUE_AFTER_DAYS && (
                                        <span className="badge warn">Waiting {waiting} days</span>
                                    )}
                                </td>
                                <td>{a.jobTitle}</td>
                                <td>{formatDate(a.createdAt.slice(0, 10))}</td>
                                <td>
                                    <StageSelect value={a.stage} qa="stage-select" onChange={(value) => move(a, value as Stage)} />
                                </td>
                                <td data-qa="interview-day">{a.interviewAt ? formatInterviewDay(a.interviewAt) : '–'}</td>
                                <td>
                                    <Rating value={a.rating} onChange={(value) => rate(a, value)} />
                                </td>
                                <td className="row-actions">
                                    <IconButton icon="star" pressed={a.shortlisted} onClick={() => shortlist(a)} />
                                    <IconButton icon="download" href={`/api/applications/${a.id}/cv`} />
                                    <IconButton icon="reject" onClick={() => setConfirm([a])} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {data && data.total === 0 && <p className="empty">No candidates match these filters.</p>}

            {data && (
                <nav className="pagination" aria-label="Pages">
                    <button type="button" className="button" disabled={data.page <= 1} onClick={() => change({ page: String(data.page - 1) })}>
                        Previous
                    </button>
                    <span>
                        Page {data.page} of {data.pages}
                    </span>
                    <button
                        type="button"
                        className="button"
                        disabled={data.page >= data.pages}
                        onClick={() => change({ page: String(data.page + 1) })}
                    >
                        Next
                    </button>
                </nav>
            )}

            {confirm && (
                <ConfirmDialog
                    title={confirm.length === 1 ? `Reject ${fullName(confirm[0])}?` : `Reject ${confirm.length} candidates?`}
                    confirmLabel="Reject"
                    onConfirm={() => reject(confirm)}
                    onCancel={() => setConfirm(null)}
                >
                    <p>{confirm.length === 1 ? 'The candidate gets a mail.' : 'Each candidate gets a mail.'}</p>
                </ConfirmDialog>
            )}
        </section>
    );
}
