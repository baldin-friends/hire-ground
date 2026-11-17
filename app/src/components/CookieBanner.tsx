import { useEffect, useState } from 'react';
import { useBug } from '../bugs';

// cookie-banner: appears on about 30 % of page loads, after 0–800 ms, and
// blocks the page until someone answers. Nothing is remembered, so the next
// load rolls the dice again.
export function CookieBanner() {
    const enabled = useBug('cookie-banner');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!enabled || Math.random() >= 0.3) return;
        const t = setTimeout(() => setOpen(true), Math.floor(Math.random() * 800));
        return () => clearTimeout(t);
    }, [enabled]);

    if (!open) return null;
    return (
        <div className="backdrop">
            <div className="cookie-banner" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
                <h2 id="cookie-title">We use cookies</h2>
                <p>Some are necessary for the site to work. Others help us understand which job ads people read.</p>
                <div className="row">
                    <button type="button" className="button primary" onClick={() => setOpen(false)}>
                        Accept all
                    </button>
                    <button type="button" className="button" onClick={() => setOpen(false)}>
                        Only necessary
                    </button>
                </div>
            </div>
        </div>
    );
}
