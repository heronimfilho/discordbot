import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { PendingDuelRepository } from '../../database/repositories/PendingDuelRepository';

describe('PendingDuelRepository', () => {
  let db: Database.Database;
  let repo: PendingDuelRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE pending_duels (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id       TEXT    NOT NULL,
        challenger_id  TEXT    NOT NULL,
        challenged_id  TEXT    NOT NULL,
        amount         INTEGER NOT NULL,
        is_all_in      INTEGER NOT NULL DEFAULT 0,
        channel_id     TEXT    NOT NULL,
        message_id     TEXT    NOT NULL,
        expires_at     TEXT    NOT NULL
      );
    `);
    repo = new PendingDuelRepository(db);
  });

  afterEach(() => db.close());

  const future = new Date(Date.now() + 60_000).toISOString();

  it('creates and retrieves a duel by id', () => {
    const id = repo.create({ guild_id: 'g1', challenger_id: 'a', challenged_id: 'b', amount: 100, is_all_in: false, channel_id: 'ch', message_id: 'msg', expires_at: future });
    const duel = repo.findById(id);
    expect(duel).toBeDefined();
    expect(duel!.challenger_id).toBe('a');
    expect(duel!.amount).toBe(100);
    expect(duel!.is_all_in).toBe(false);
  });

  it('finds pending duel involving a user as challenger', () => {
    repo.create({ guild_id: 'g1', challenger_id: 'a', challenged_id: 'b', amount: 50, is_all_in: false, channel_id: 'ch', message_id: 'msg', expires_at: future });
    expect(repo.findByUser('g1', 'a')).toBeDefined();
  });

  it('finds pending duel involving a user as challenged', () => {
    repo.create({ guild_id: 'g1', challenger_id: 'a', challenged_id: 'b', amount: 50, is_all_in: false, channel_id: 'ch', message_id: 'msg', expires_at: future });
    expect(repo.findByUser('g1', 'b')).toBeDefined();
  });

  it('returns null when user has no pending duel', () => {
    expect(repo.findByUser('g1', 'x')).toBeNull();
  });

  it('deletes a duel', () => {
    const id = repo.create({ guild_id: 'g1', challenger_id: 'a', challenged_id: 'b', amount: 50, is_all_in: false, channel_id: 'ch', message_id: 'msg', expires_at: future });
    repo.delete(id);
    expect(repo.findById(id)).toBeNull();
  });
});
