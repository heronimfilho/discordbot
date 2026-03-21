import Database from 'better-sqlite3';
import { CustomCommand, CreateCustomCommandDTO, UpdateCustomCommandDTO } from '../../types/CustomCommand';

export class CustomCommandRepository {
  constructor(private readonly db: Database.Database) {}

  create(dto: CreateCustomCommandDTO): void {
    this.db
      .prepare(
        `INSERT INTO custom_commands (guild_id, name, type, text)
         VALUES (@guild_id, @name, @type, @text)`,
      )
      .run(dto);
  }

  findByName(guildId: string, name: string): CustomCommand | null {
    return (
      (this.db
        .prepare(`SELECT * FROM custom_commands WHERE guild_id = ? AND name = ?`)
        .get(guildId, name) as CustomCommand | undefined) ?? null
    );
  }

  findAllByGuild(guildId: string): CustomCommand[] {
    return this.db
      .prepare(`SELECT * FROM custom_commands WHERE guild_id = ? ORDER BY name ASC`)
      .all(guildId) as CustomCommand[];
  }

  update(guildId: string, name: string, dto: UpdateCustomCommandDTO): void {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (dto.type !== undefined) { fields.push('type = ?'); values.push(dto.type); }
    if (dto.text !== undefined) { fields.push('text = ?'); values.push(dto.text); }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(guildId, name);

    this.db
      .prepare(`UPDATE custom_commands SET ${fields.join(', ')} WHERE guild_id = ? AND name = ?`)
      .run(...values);
  }

  incrementCounter(guildId: string, name: string): void {
    this.db
      .prepare(
        `UPDATE custom_commands SET counter = counter + 1, updated_at = datetime('now')
         WHERE guild_id = ? AND name = ?`,
      )
      .run(guildId, name);
  }

  delete(guildId: string, name: string): void {
    this.db
      .prepare(`DELETE FROM custom_commands WHERE guild_id = ? AND name = ?`)
      .run(guildId, name);
  }
}
