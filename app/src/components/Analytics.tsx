import { useEffect } from 'react';
import { useBug } from '../bugs';

const ORIGIN = 'http://127.0.0.1:3999';

// slow-analytics: loads a third-party script that answers after 10 s and then
// sends a beacon every 500 ms. The page works; waitUntil: 'networkidle' never
// gets there. Block or stub the third party and it does.
export function Analytics() {
    const enabled = useBug('slow-analytics');

    useEffect(() => {
        if (!enabled) return;
        const script = document.createElement('script');
        script.src = `${ORIGIN}/analytics.js`;
        script.async = true;
        document.head.appendChild(script);
        return () => script.remove();
    }, [enabled]);

    return null;
}
