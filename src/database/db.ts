import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'bot.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_commands (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id   TEXT    NOT NULL,
      name       TEXT    NOT NULL,
      type       TEXT    NOT NULL CHECK(type IN ('response', 'warning', 'counter')),
      text       TEXT    NOT NULL,
      counter    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(guild_id, name)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id   TEXT    NOT NULL,
      name       TEXT    NOT NULL,
      content    TEXT    NOT NULL,
      created_by TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(guild_id, name)
    );
  `);
} catch (error) {
  throw new Error(`Failed to initialize database schema: ${error instanceof Error ? error.message : String(error)}`);
}
