import { useEffect, useState } from 'react';
import { api, type Mail } from '../api';
import { formatDateTime } from '../format';

// Not part of the product: it stands in for a mail server during the training.
export function Mailbox() {
    const [mails, setMails] = useState<Mail[] | null>(null);
    const load = () => api.mail().then(setMails);

    useEffect(() => {
        load();
    }, []);

    return (
        <section className="page">
            <h1>Test mailbox</h1>
            <p className="lead">
                Every email the app sends lands here and in <code>GET /api/mail</code>. In production this would be a mail server.
            </p>
            <p>
                <button type="button" className="button" onClick={load}>
                    Refresh
                </button>
            </p>
            {mails === null ? (
                <p role="status">Loading…</p>
            ) : mails.length === 0 ? (
                <p className="empty">No messages yet.</p>
            ) : (
                <ul className="mails">
                    {mails.map((m) => (
                        <li key={m.id}>
                            <details>
                                <summary>
                                    <span className="subject">{m.subject}</span>
                                    <span className="meta">
                                        to {m.to} · {formatDateTime(m.createdAt)}
                                    </span>
                                </summary>
                                <pre>{m.body}</pre>
                            </details>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
