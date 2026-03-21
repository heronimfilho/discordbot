import Database from 'better-sqlite3';

export interface Note {
  id: number;
  guild_id: string;
  name: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDTO {
  guild_id: string;
  name: string;
  content: string;
  created_by: string;
}

export class NoteRepository {
  constructor(private readonly db: Database.Database) {}

  save(dto: CreateNoteDTO): void {
    this.db
      .prepare(
        `INSERT INTO notes (guild_id, name, content, created_by)
         VALUES (@guild_id, @name, @content, @created_by)`,
      )
      .run(dto);
  }

  findByName(guildId: string, name: string): Note | null {
    return (
      (this.db
        .prepare(`SELECT * FROM notes WHERE guild_id = ? AND name = ?`)
        .get(guildId, name) as Note | undefined) ?? null
    );
  }

  findAllByGuild(guildId: string): Note[] {
    return this.db
      .prepare(`SELECT * FROM notes WHERE guild_id = ? ORDER BY name ASC`)
      .all(guildId) as Note[];
  }

  update(guildId: string, name: string, content: string): void {
    this.db
      .prepare(
        `UPDATE notes SET content = ?, updated_at = datetime('now')
         WHERE guild_id = ? AND name = ?`,
      )
      .run(content, guildId, name);
  }

  delete(guildId: string, name: string): void {
    this.db
      .prepare(`DELETE FROM notes WHERE guild_id = ? AND name = ?`)
      .run(guildId, name);
  }
}
