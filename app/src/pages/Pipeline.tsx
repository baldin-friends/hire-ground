import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, STAGES, type Application, type Stage } from '../api';
import { useBug } from '../bugs';

const label = (s: Stage) => STAGES.find((x) => x.id === s)?.label ?? s;

export function Pipeline() {
    const animate = useBug('pipeline-animation');
    const [apps, setApps] = useState<Application[] | null>(null);
    const [status, setStatus] = useState('');
    const [over, setOver] = useState<Stage | null>(null);

    useEffect(() => {
        api.applications().then(setApps);
    }, []);

    async function move(id: string, stage: Stage) {
        const before = apps;
        const app = apps?.find((a) => a.id === id);
        if (!app || app.stage === stage) return;
        setApps((list) => list!.map((a) => (a.id === id ? { ...a, stage } : a)));
        try {
            await api.moveApplication(id, stage);
            setStatus(`${app.firstName} ${app.lastName} moved to ${label(stage)}.`);
        } catch {
            setApps(before);
            setStatus('The application could not be moved. Please try again.');
        }
    }

    if (!apps) return <p role="status">Loading pipeline…</p>;

    return (
        <section className="page wide">
            <h1>Pipeline</h1>
            <p role="status" className="status-line">
                {status}
            </p>
            <div className="board">
                {STAGES.map((s) => {
                    const list = apps.filter((a) => a.stage === s.id).sort((x, y) => y.createdAt.localeCompare(x.createdAt)); // newest first
                    return (
                        <section
                            key={s.id}
                            aria-label={s.label}
                            className={`column${over === s.id ? ' over' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setOver(s.id);
                            }}
                            onDragLeave={() => setOver(null)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setOver(null);
                                const id = e.dataTransfer.getData('text/plain');
                                if (id) move(id, s.id);
                            }}
                        >
                            <h2>
                                {s.label} <span className="count">{list.length}</span>
                            </h2>
                            <ul>
                                {list.map((a) => (
                                    // the key includes the stage, so a moved card mounts (and animates) again
                                    <li key={`${a.id}-${a.stage}`}>
                                        <article
                                            className={`card${animate ? ' animate' : ''}`}
                                            draggable
                                            aria-label={`${a.firstName} ${a.lastName}`}
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', a.id);
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                        >
                                            <Link to={`applications/${a.id}`}>
                                                {a.firstName} {a.lastName}
                                            </Link>
                                            <p>{a.jobTitle}</p>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                            {list.length === 0 && <p className="empty">No applications</p>}
                        </section>
                    );
                })}
            </div>
        </section>
    );
}
