import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { CustomCommandRepository } from '../../database/repositories/CustomCommandRepository';

describe('CustomCommandRepository', () => {
  let db: Database.Database;
  let repo: CustomCommandRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE custom_commands (
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
    `);
    repo = new CustomCommandRepository(db);
  });

  afterEach(() => db.close());

  it('creates a custom command', () => {
    repo.create({ guild_id: 'g1', name: 'cachorro', type: 'counter', text: 'Latidos: {count}' });
    const cmd = repo.findByName('g1', 'cachorro');
    expect(cmd).toBeDefined();
    expect(cmd!.name).toBe('cachorro');
    expect(cmd!.counter).toBe(0);
  });

  it('returns null for unknown command', () => {
    const cmd = repo.findByName('g1', 'unknown');
    expect(cmd).toBeNull();
  });

  it('increments counter', () => {
    repo.create({ guild_id: 'g1', name: 'test', type: 'counter', text: 'Count: {count}' });
    repo.incrementCounter('g1', 'test');
    const cmd = repo.findByName('g1', 'test');
    expect(cmd!.counter).toBe(1);
  });

  it('updates a command', () => {
    repo.create({ guild_id: 'g1', name: 'test', type: 'response', text: 'Hello' });
    repo.update('g1', 'test', { text: 'World' });
    const cmd = repo.findByName('g1', 'test');
    expect(cmd!.text).toBe('World');
  });

  it('deletes a command', () => {
    repo.create({ guild_id: 'g1', name: 'test', type: 'response', text: 'Hello' });
    repo.delete('g1', 'test');
    expect(repo.findByName('g1', 'test')).toBeNull();
  });

  it('lists all commands for a guild', () => {
    repo.create({ guild_id: 'g1', name: 'a', type: 'response', text: 'A' });
    repo.create({ guild_id: 'g1', name: 'b', type: 'counter', text: 'B' });
    repo.create({ guild_id: 'g2', name: 'c', type: 'response', text: 'C' });
    const list = repo.findAllByGuild('g1');
    expect(list).toHaveLength(2);
  });
});
