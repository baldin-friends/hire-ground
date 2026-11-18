import type { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

// A test runs in Node.js. Whatever Node.js can reach, a fixture can reach: a database, a queue, an internal service.
// Hire Ground keeps its data in one SQLite file, and node:sqlite ships with Node.js. In your project this file
// holds the client of your database (pg, oracledb, mysql2) and reads the connection string from the environment.

export type Database = DatabaseSync;

const DEFAULT_FILE = fileURLToPath(new URL('../app/data/hire-ground.db', import.meta.url));

export async function openDatabase(): Promise<Database> {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(process.env.HG_DB ?? DEFAULT_FILE);
    db.exec('PRAGMA busy_timeout = 3000'); // the application writes to the same file
    return db;
}
