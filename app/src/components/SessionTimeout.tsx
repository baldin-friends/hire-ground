import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const WARN_AFTER = 30 * 60 * 1000;
const EXPIRE_AFTER = 32 * 60 * 1000;

// A feature, not a bug: after 30 minutes without input the recruiter sees a
// warning, after 32 minutes the session ends. Timers are plain setTimeout,
// so page.clock controls them.
export function SessionTimeout() {
    const navigate = useNavigate();
    const [warning, setWarning] = useState(false);
    const timers = useRef<number[]>([]);

    const arm = useCallback(() => {
        timers.current.forEach(clearTimeout);
        setWarning(false);
        timers.current = [
            window.setTimeout(() => setWarning(true), WARN_AFTER),
            window.setTimeout(async () => {
                await api.logout().catch(() => {});
                navigate('/login?expired=1');
            }, EXPIRE_AFTER),
        ];
    }, [navigate]);

    useEffect(() => {
        arm();
        return () => timers.current.forEach(clearTimeout);
    }, [arm]);

    // Any input re-arms the timers, except while the warning is open:
    // then only "Stay signed in" counts.
    useEffect(() => {
        if (warning) return;
        window.addEventListener('keydown', arm);
        window.addEventListener('pointerdown', arm);
        return () => {
            window.removeEventListener('keydown', arm);
            window.removeEventListener('pointerdown', arm);
        };
    }, [arm, warning]);

    if (!warning) return null;
    return (
        <div className="backdrop">
            <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="timeout-title" aria-describedby="timeout-text">
                <h2 id="timeout-title">Still there?</h2>
                <p id="timeout-text">Your session expires in 2 minutes.</p>
                <button type="button" className="button primary" onClick={arm}>
                    Stay signed in
                </button>
            </div>
        </div>
    );
}
