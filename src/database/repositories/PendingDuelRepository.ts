import Database from 'better-sqlite3';

export interface PendingDuel {
  id: number;
  guild_id: string;
  challenger_id: string;
  challenged_id: string;
  amount: number;
  is_all_in: boolean;
  channel_id: string;
  message_id: string;
  expires_at: string;
}

export interface CreateDuelDTO {
  guild_id: string;
  challenger_id: string;
  challenged_id: string;
  amount: number;
  is_all_in: boolean;
  channel_id: string;
  message_id: string;
  expires_at: string;
}

export class PendingDuelRepository {
  constructor(private readonly db: Database.Database) {}

  create(dto: CreateDuelDTO): number {
    const result = this.db
      .prepare(
        `INSERT INTO pending_duels (guild_id, challenger_id, challenged_id, amount, is_all_in, channel_id, message_id, expires_at)
         VALUES (@guild_id, @challenger_id, @challenged_id, @amount, @is_all_in, @channel_id, @message_id, @expires_at)`,
      )
      .run({ ...dto, is_all_in: dto.is_all_in ? 1 : 0 });
    return result.lastInsertRowid as number;
  }

  findById(id: number): PendingDuel | null {
    const row = this.db
      .prepare(`SELECT * FROM pending_duels WHERE id = ?`)
      .get(id) as (Omit<PendingDuel, 'is_all_in'> & { is_all_in: number }) | undefined;
    if (!row) return null;
    return { ...row, is_all_in: row.is_all_in === 1 };
  }

  findByUser(guildId: string, userId: string): PendingDuel | null {
    const row = this.db
      .prepare(
        `SELECT * FROM pending_duels WHERE guild_id = ? AND (challenger_id = ? OR challenged_id = ?) AND expires_at > datetime('now') LIMIT 1`,
      )
      .get(guildId, userId, userId) as (Omit<PendingDuel, 'is_all_in'> & { is_all_in: number }) | undefined;
    if (!row) return null;
    return { ...row, is_all_in: row.is_all_in === 1 };
  }

  delete(id: number): void {
    this.db.prepare(`DELETE FROM pending_duels WHERE id = ?`).run(id);
  }

  deleteExpired(): void {
    this.db.prepare(`DELETE FROM pending_duels WHERE expires_at <= datetime('now')`).run();
  }
}
