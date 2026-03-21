import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { NoteRepository } from '../../database/repositories/NoteRepository';

describe('NoteRepository', () => {
  let db: Database.Database;
  let repo: NoteRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id   TEXT NOT NULL,
        name       TEXT NOT NULL,
        content    TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(guild_id, name)
      );
    `);
    repo = new NoteRepository(db);
  });

  afterEach(() => db.close());

  it('saves and retrieves a note', () => {
    repo.save({ guild_id: 'g1', name: 'deploy', content: 'toda sexta', created_by: 'u1' });
    const note = repo.findByName('g1', 'deploy');
    expect(note).toBeDefined();
    expect(note!.content).toBe('toda sexta');
  });

  it('returns null for unknown note', () => {
    expect(repo.findByName('g1', 'unknown')).toBeNull();
  });

  it('lists only notes for the guild', () => {
    repo.save({ guild_id: 'g1', name: 'a', content: 'A', created_by: 'u1' });
    repo.save({ guild_id: 'g1', name: 'b', content: 'B', created_by: 'u1' });
    repo.save({ guild_id: 'g2', name: 'c', content: 'C', created_by: 'u2' });
    expect(repo.findAllByGuild('g1')).toHaveLength(2);
  });

  it('updates note content', () => {
    repo.save({ guild_id: 'g1', name: 'x', content: 'old', created_by: 'u1' });
    repo.update('g1', 'x', 'new content');
    expect(repo.findByName('g1', 'x')!.content).toBe('new content');
  });

  it('deletes a note', () => {
    repo.save({ guild_id: 'g1', name: 'x', content: 'bye', created_by: 'u1' });
    repo.delete('g1', 'x');
    expect(repo.findByName('g1', 'x')).toBeNull();
  });
});
