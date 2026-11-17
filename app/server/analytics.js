// A stand-in third-party analytics service on its own origin (default
// http://127.0.0.1:3999). The frontend only loads it with the slow-analytics
// flag: the script answers after 10 s, then beacons every 500 ms, so
// waitUntil: 'networkidle' never settles unless the third party is blocked.

import { createServer } from 'node:http';

const PORT = Number(process.env.HG_ANALYTICS_PORT ?? 3999);

export function startAnalytics() {
    const server = createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.url?.startsWith('/analytics.js')) {
            setTimeout(() => {
                res.setHeader('Content-Type', 'text/javascript');
                res.end(
                    'window.__hgAnalytics = { loadedAt: Date.now() };\n' +
                    `setInterval(() => fetch('http://127.0.0.1:${PORT}/beacon?t=' + Date.now(), { mode: 'no-cors' }).catch(() => {}), 500);\n`,
                );
            }, 10_000);
        } else if (req.url?.startsWith('/beacon')) {
            setTimeout(() => {
                res.statusCode = 204;
                res.end();
            }, 300);
        } else {
            res.statusCode = 404;
            res.end();
        }
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') console.warn(`analytics stand-in: port ${PORT} in use, skipped`);
        else console.warn('analytics stand-in:', err.message);
    });
    server.listen(PORT, '127.0.0.1');
}
