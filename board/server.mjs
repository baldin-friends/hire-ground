#!/usr/bin/env node
// A small sorting board for workshops. No dependencies.
//
//   npm run board                 → http://localhost:4321
//   BOARD_PORT=5000 npm run board
//
// People who are not in your network can join through a tunnel, for example
//   cloudflared tunnel --url http://localhost:4321
// Start the board with the address the tunnel prints, and it shows that address as "Join":
//   BOARD_PUBLIC_URL=https://….trycloudflare.com npm run board
// BOARD_QR=/path/to/code.svg adds a QR code of that address to the host view.
//
// On a public server: BOARD_HOST_KEY=some-word protects the host buttons (reveal, answer, add, reset). The host then
// opens the board with &key=some-word in the address. BOARD_BIND=127.0.0.1 keeps the port behind a reverse proxy.
// The page uses relative addresses, so the board also works under a path such as https://example.org/board/.
//
// The host opens a board on the projector, everybody else opens the "Join" address on their own laptop.
// Boards are the JSON files in board/boards/. State lives in memory: restart the server and the board is empty.

import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.BOARD_PORT ?? 4321);
const publicUrl = (process.env.BOARD_PUBLIC_URL ?? '').replace(/\/+$/, '');
const qrFile = process.env.BOARD_QR && existsSync(process.env.BOARD_QR) ? process.env.BOARD_QR : null;
const hostKey = process.env.BOARD_HOST_KEY ?? '';
const bind = process.env.BOARD_BIND ?? '0.0.0.0';

const boards = new Map();
for (const file of readdirSync(join(dir, 'boards')).filter((f) => f.endsWith('.json')).sort()) {
    const board = JSON.parse(readFileSync(join(dir, 'boards', file), 'utf8'));
    boards.set(board.id, board);
}

// per board: who put which card where, how many cards are revealed, whether the answer shows, cards added by the host
const states = new Map();
const stateOf = (id) => {
    if (!states.has(id)) states.set(id, { placements: {}, revealed: 0, answer: false, extra: [], version: 1 });
    return states.get(id);
};

const lanUrls = () =>
    Object.values(networkInterfaces())
        .flat()
        .filter((n) => n && n.family === 'IPv4' && !n.internal)
        .map((n) => `http://${n.address}:${port}`);

const send = (res, status, body, type = 'application/json') => {
    res.writeHead(status, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' });
    res.end(type === 'application/json' ? JSON.stringify(body) : body);
};

const readJson = (req) =>
    new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
            try {
                resolve(JSON.parse(raw || '{}'));
            } catch {
                resolve({});
            }
        });
    });

const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('b');

    if (req.method === 'GET' && url.pathname === '/') return send(res, 200, readFileSync(join(dir, 'index.html'), 'utf8'), 'text/html');
    if (req.method === 'GET' && url.pathname === '/boards') {
        return send(res, 200, [...boards.values()].map((b) => ({ id: b.id, title: b.title, question: b.question, cards: b.cards.length })));
    }
    if (req.method === 'GET' && url.pathname === '/info') return send(res, 200, { urls: publicUrl ? [publicUrl, ...lanUrls()] : lanUrls(), port, qr: Boolean(qrFile), needsKey: Boolean(hostKey) });
    if (req.method === 'GET' && url.pathname === '/qr.svg' && qrFile) return send(res, 200, readFileSync(qrFile, 'utf8'), 'image/svg+xml');

    if (req.method === 'GET' && url.pathname === '/board') {
        const board = boards.get(id);
        if (!board) return send(res, 404, { error: 'no such board' });
        return send(res, 200, board);
    }
    if (req.method === 'GET' && url.pathname === '/state') {
        if (!boards.has(id)) return send(res, 404, { error: 'no such board' });
        return send(res, 200, stateOf(id));
    }

    if (req.method === 'POST' && url.pathname === '/place') {
        const body = await readJson(req);
        const board = boards.get(body.b);
        if (!board) return send(res, 404, { error: 'no such board' });
        const state = stateOf(board.id);
        const group = clean(body.group, 24);
        const card = clean(body.card, 40);
        const known = [...board.cards, ...state.extra].some((c) => c.id === card);
        const column = board.columns.some((c) => c.id === body.column) ? body.column : null;
        if (!group || !known) return send(res, 400, { error: 'group and card are required' });
        state.placements[group] ??= {};
        if (column) state.placements[group][card] = column;
        else delete state.placements[group][card];
        state.version++;
        return send(res, 200, state);
    }

    if (req.method === 'POST' && url.pathname === '/host') {
        const body = await readJson(req);
        const board = boards.get(body.b);
        if (!board) return send(res, 404, { error: 'no such board' });
        if (hostKey && body.key !== hostKey) return send(res, 403, { error: 'the host key is missing or wrong' });
        const state = stateOf(board.id);
        const total = board.cards.length + state.extra.length;
        if (body.action === 'reveal') state.revealed = Math.min(total, state.revealed + 1);
        if (body.action === 'revealAll') state.revealed = total;
        if (body.action === 'answer') state.answer = !state.answer;
        if (body.action === 'addCard' && clean(body.text, 160)) {
            state.extra.push({ id: `x${state.extra.length + 1}`, text: clean(body.text, 160) });
            state.revealed = total + 1;
        }
        if (body.action === 'reset') states.set(board.id, { placements: {}, revealed: 0, answer: false, extra: [], version: state.version });
        stateOf(board.id).version++;
        return send(res, 200, stateOf(board.id));
    }

    send(res, 404, { error: 'not found' });
});

server.listen(port, bind, () => {
    console.log(`\n  Board is running.\n`);
    console.log(`  You (host, projector):   http://localhost:${port}`);
    if (publicUrl) console.log(`  Everybody else (join):   ${publicUrl}   (from anywhere, also from a phone)`);
    for (const u of lanUrls()) console.log(`  Everybody else (join):   ${u}${publicUrl ? '   (same network only)' : ''}`);
    console.log(`\n  Boards: ${[...boards.keys()].join(', ')}`);
    console.log(`  Nobody can reach your laptop? Each group runs "npm run board" itself and opens http://localhost:${port}\n`);
});
