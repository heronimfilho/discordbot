import Database from 'better-sqlite3';

export class PointsRepository {
  constructor(private readonly db: Database.Database) {}

  getBalance(guildId: string, userId: string): number {
    const row = this.db
      .prepare(`SELECT balance FROM points WHERE guild_id = ? AND user_id = ?`)
      .get(guildId, userId) as { balance: number } | undefined;
    return row?.balance ?? 0;
  }

  setBalance(guildId: string, userId: string, balance: number): void {
    this.db
      .prepare(
        `INSERT INTO points (guild_id, user_id, balance) VALUES (?, ?, ?)
         ON CONFLICT(user_id, guild_id) DO UPDATE SET balance = excluded.balance`,
      )
      .run(guildId, userId, balance);
  }

  transfer(guildId: string, fromUserId: string, toUserId: string, amount: number): void {
    const xfer = this.db.transaction(() => {
      const from = this.getBalance(guildId, fromUserId);
      const to = this.getBalance(guildId, toUserId);
      this.setBalance(guildId, fromUserId, from - amount);
      this.setBalance(guildId, toUserId, to + amount);
    });
    xfer();
  }

  findRankingByGuild(guildId: string): { user_id: string; balance: number }[] {
    return this.db
      .prepare(
        `SELECT user_id, balance FROM points WHERE guild_id = ? AND balance > 0 ORDER BY balance DESC LIMIT 10`,
      )
      .all(guildId) as { user_id: string; balance: number }[];
  }
}
