/**
 * db.ts - SQLite connection layer for Hydra database
 * Uses better-sqlite3 for synchronous, reliable local reads.
 * Only runs on the server (Node.js); safe to import from API routes.
 */

// Detect if we're in a server-side environment
const isServer = typeof window === 'undefined';

// Lazy-loaded DB instance (module-level singleton)
let _db: import('better-sqlite3').Database | null = null;

const DB_PATH = 'C:\\Users\\Matt\\clawd\\db\\hydra.db';

export function getDb(): import('better-sqlite3').Database | null {
  if (!isServer) return null;

  if (_db) return _db;

  try {
    // Dynamic require to avoid bundler issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    // Enable WAL mode for concurrent access
    (_db as import('better-sqlite3').Database).pragma('journal_mode = WAL');
    return _db;
  } catch (err) {
    console.warn('[db] Could not open Hydra DB:', (err as Error).message);
    return null;
  }
}

export function isDbAvailable(): boolean {
  return getDb() !== null;
}

/**
 * Execute a query and return all rows. Returns [] on error.
 */
export function dbAll<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T[] {
  try {
    const db = getDb();
    if (!db) return [];
    const stmt = db.prepare(sql);
    return stmt.all(...params) as T[];
  } catch (err) {
    console.warn('[db] Query error:', (err as Error).message, '\nSQL:', sql);
    return [];
  }
}

/**
 * Execute a query and return one row. Returns null on error.
 */
export function dbGet<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T | null {
  try {
    const db = getDb();
    if (!db) return null;
    const stmt = db.prepare(sql);
    return (stmt.get(...params) as T) ?? null;
  } catch (err) {
    console.warn('[db] Query error:', (err as Error).message, '\nSQL:', sql);
    return null;
  }
}
