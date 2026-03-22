import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { PointsRepository } from '../../database/repositories/PointsRepository';
import { PendingDuelRepository } from '../../database/repositories/PendingDuelRepository';
import { PointsService } from '../../services/PointsService';

describe('PointsService', () => {
  let db: Database.Database;
  let service: PointsService;
  let pointsRepo: PointsRepository;
  let duelRepo: PendingDuelRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE points (
        user_id  TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        balance  INTEGER NOT NULL DEFAULT 0 CHECK(balance >= 0),
        PRIMARY KEY (user_id, guild_id)
      );
      CREATE TABLE pending_duels (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id       TEXT NOT NULL,
        challenger_id  TEXT NOT NULL,
        challenged_id  TEXT NOT NULL,
        amount         INTEGER NOT NULL,
        is_all_in      INTEGER NOT NULL DEFAULT 0,
        channel_id     TEXT NOT NULL,
        message_id     TEXT NOT NULL,
        expires_at     TEXT NOT NULL
      );
    `);
    pointsRepo = new PointsRepository(db);
    duelRepo = new PendingDuelRepository(db);
    service = new PointsService(pointsRepo, duelRepo);
  });

  afterEach(() => db.close());

  // --- start ---
  it('start gives 1000 points to a new user', () => {
    const result = service.start('g1', 'u1');
    expect(result.success).toBe(true);
    expect(service.getBalance('g1', 'u1')).toBe(1000);
  });

  it('start fails if user already has points', () => {
    service.start('g1', 'u1');
    const result = service.start('g1', 'u1');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('already_started');
  });

  it('start succeeds again after reaching 0 points', () => {
    service.start('g1', 'u1');
    pointsRepo.setBalance('g1', 'u1', 0);
    const result = service.start('g1', 'u1');
    expect(result.success).toBe(true);
    expect(service.getBalance('g1', 'u1')).toBe(1000);
  });

  // --- validateDuel ---
  it('rejects duel against self', () => {
    pointsRepo.setBalance('g1', 'u1', 500);
    const result = service.validateDuel('g1', 'u1', 'u1', 100);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('self_duel');
  });

  it('rejects duel when challenger has fewer than 50 points', () => {
    pointsRepo.setBalance('g1', 'u1', 30);
    const result = service.validateDuel('g1', 'u1', 'u2', 30);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('insufficient_points');
  });

  it('rejects duel when amount exceeds challenger balance', () => {
    pointsRepo.setBalance('g1', 'u1', 200);
    const result = service.validateDuel('g1', 'u1', 'u2', 300);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('insufficient_points');
  });

  it('accepts valid duel parameters', () => {
    pointsRepo.setBalance('g1', 'u1', 500);
    const result = service.validateDuel('g1', 'u1', 'u2', 100);
    expect(result.valid).toBe(true);
  });

  // --- resolveDuel ---
  it('winner receives the full pot (fixed amount)', () => {
    pointsRepo.setBalance('g1', 'challenger', 500);
    pointsRepo.setBalance('g1', 'challenged', 300);
    const expires = new Date(Date.now() + 60_000).toISOString();
    const id = duelRepo.create({ guild_id: 'g1', challenger_id: 'challenger', challenged_id: 'challenged', amount: 100, is_all_in: false, channel_id: 'ch', message_id: 'msg', expires_at: expires });

    const result = service.resolveDuel(id, 'challenger');
    expect(result.pot).toBe(200);
    expect(service.getBalance('g1', 'challenger')).toBe(600); // 500 - 100 + 200
    expect(service.getBalance('g1', 'challenged')).toBe(200); // 300 - 100
  });

  it('all-in: winner takes combined balances', () => {
    pointsRepo.setBalance('g1', 'challenger', 400);
    pointsRepo.setBalance('g1', 'challenged', 600);
    const expires = new Date(Date.now() + 60_000).toISOString();
    const id = duelRepo.create({ guild_id: 'g1', challenger_id: 'challenger', challenged_id: 'challenged', amount: 0, is_all_in: true, channel_id: 'ch', message_id: 'msg', expires_at: expires });

    const result = service.resolveDuel(id, 'challenged');
    expect(result.pot).toBe(1000);
    expect(service.getBalance('g1', 'challenged')).toBe(1000);
    expect(service.getBalance('g1', 'challenger')).toBe(0);
  });
});
