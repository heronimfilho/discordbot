import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { PointsRepository } from '../../database/repositories/PointsRepository';

describe('PointsRepository', () => {
  let db: Database.Database;
  let repo: PointsRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE points (
        user_id  TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        balance  INTEGER NOT NULL DEFAULT 0 CHECK(balance >= 0),
        PRIMARY KEY (user_id, guild_id)
      );
    `);
    repo = new PointsRepository(db);
  });

  afterEach(() => db.close());

  it('returns 0 for unknown user', () => {
    expect(repo.getBalance('g1', 'u1')).toBe(0);
  });

  it('sets and retrieves balance', () => {
    repo.setBalance('g1', 'u1', 1000);
    expect(repo.getBalance('g1', 'u1')).toBe(1000);
  });

  it('upserts balance for existing user', () => {
    repo.setBalance('g1', 'u1', 1000);
    repo.setBalance('g1', 'u1', 500);
    expect(repo.getBalance('g1', 'u1')).toBe(500);
  });

  it('isolates balances by guild', () => {
    repo.setBalance('g1', 'u1', 200);
    repo.setBalance('g2', 'u1', 800);
    expect(repo.getBalance('g1', 'u1')).toBe(200);
    expect(repo.getBalance('g2', 'u1')).toBe(800);
  });

  it('transfers points between users atomically', () => {
    repo.setBalance('g1', 'winner', 100);
    repo.setBalance('g1', 'loser', 200);
    repo.transfer('g1', 'loser', 'winner', 200);
    expect(repo.getBalance('g1', 'winner')).toBe(300);
    expect(repo.getBalance('g1', 'loser')).toBe(0);
  });
});
