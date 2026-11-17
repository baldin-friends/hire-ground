// Static server for the prebuilt scaffold apps. Node built-ins only.
//
//   node serve.mjs react 4301      serves react/dist on http://localhost:4301
//
// A path without a file extension falls back to index.html, so deep links
// like /apply/senior-qa-engineer reach the app's router.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const apps = ['react', 'angular', 'vue'];
const [app, portArg] = process.argv.slice(2);
const port = Number(portArg);

if (!apps.includes(app) || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Usage: node serve.mjs <${apps.join('|')}> <port>`);
    process.exit(1);
}

const root = resolve(import.meta.dirname, app, 'dist');
const index = join(root, 'index.html');

if (!existsSync(index)) {
    console.error(`${index} is missing. Rebuild it: see ${app}/README.md`);
    process.exit(1);
}

const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
};

function isFile(path) {
    return statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;
}

function send(res, status, type, body) {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(body);
}

function handle(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return send(res, 405, types['.txt'], 'Method not allowed');
    }

    let pathname;
    try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
        return send(res, 400, types['.txt'], 'Bad request');
    }

    if (pathname === '/health') {
        return send(res, 200, types['.json'], JSON.stringify({ status: 'ok', app }));
    }

    // Never leave the dist folder.
    let file = join(root, pathname);
    if (file !== root && !file.startsWith(root + sep)) {
        return send(res, 403, types['.txt'], 'Forbidden');
    }

    if (!isFile(file)) {
        if (extname(pathname) !== '') {
            return send(res, 404, types['.txt'], 'Not found');
        }
        file = index;
    }

    res.writeHead(200, {
        'Content-Type': types[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') {
        return res.end();
    }
    createReadStream(file).pipe(res);
}

// Listen on both loopback addresses: "localhost" may resolve to either one,
// and a loopback-only server does not trigger the macOS firewall dialog.
for (const host of ['127.0.0.1', '::1']) {
    createServer(handle)
        .on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use. Stop the other process or pick another port.`);
                process.exit(1);
            }
            if (host === '::1') {
                return; // no IPv6 on this machine: IPv4 is enough
            }
            throw error;
        })
        .listen(port, host, () => {
            if (host === '127.0.0.1') {
                console.log(`${app}: http://localhost:${port}`);
            }
        });
}
