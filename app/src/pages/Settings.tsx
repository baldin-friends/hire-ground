import { useEffect, useState } from 'react';
import { api } from '../api';

export function Settings() {
    const [notify, setNotify] = useState<boolean | null>(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        api.settings().then((s) => setNotify(s.notifyOnNewApplication));
    }, []);

    if (notify === null) return <p role="status">Loading settings…</p>;

    return (
        <section className="page narrow">
            <h1>Settings</h1>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const saved = await api.saveSettings({ notifyOnNewApplication: notify });
                    setNotify(saved.notifyOnNewApplication);
                    setStatus('Settings saved.');
                }}
            >
                <div className="field">
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={notify}
                            onChange={(e) => {
                                setNotify(e.target.checked);
                                setStatus('');
                            }}
                        />
                        Email me when a new application arrives
                    </label>
                </div>
                <button type="submit" className="button primary">
                    Save settings
                </button>
            </form>
            <p role="status" className="status-line">
                {status}
            </p>
        </section>
    );
}
