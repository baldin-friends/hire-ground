#!/usr/bin/env node
// Puts Hire Ground back to its seed data: npm run reset
const PORT = Number(process.env.PORT ?? 3000);
const res = await fetch(`http://localhost:${PORT}/api/test/reset`, { method: 'POST' }).catch(() => null);
console.log(res?.ok ? `Hire Ground on port ${PORT} is back to its seed data.` : `No Hire Ground on port ${PORT}. Start it with: npm run app`);
process.exit(res?.ok ? 0 : 1);
