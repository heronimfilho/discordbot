import { Client, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { ICommand } from '../types/Command';
import { CustomCommandService } from '../services/CustomCommandService';
import { createCommandCommand } from '../commands/custom/command';
import { NoteRepository } from '../database/repositories/NoteRepository';
import { createNotasCommand } from '../commands/utility/notas';
import { createHelpCommand } from '../commands/utility/help';
import { PointsService } from '../services/PointsService';
import { PendingDuelRepository } from '../database/repositories/PendingDuelRepository';
import { createPontosCommand } from '../commands/games/pontos';
import { createDueloCommand } from '../commands/games/duelo';
import { createRankCommand } from '../commands/games/rank';
import { MusicService } from '../services/MusicService';
import { createAllMusicCommands } from '../commands/music';

export class CommandHandler {
  readonly commands = new Collection<string, ICommand>();

  constructor(
    private readonly client: Client,
    private readonly customCommandService: CustomCommandService,
    private readonly noteRepository: NoteRepository,
    private readonly pointsService: PointsService,
    private readonly duelRepository: PendingDuelRepository,
    private readonly musicService: MusicService,
  ) {}

  async load(): Promise<void> {
    // Auto-discover utility and games commands
    const commandDirs = [
      path.join(__dirname, '..', 'commands', 'utility'),
      path.join(__dirname, '..', 'commands', 'games'),
    ];

    for (const dir of commandDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        if (file === 'help.ts' || file === 'help.js') continue; // registered manually below
        const module = await import(path.join(dir, file)) as Record<string, unknown>;
        for (const exportedValue of Object.values(module)) {
          const command = exportedValue as ICommand;
          if (command?.data && typeof command?.execute === 'function') {
            this.commands.set(command.data.name, command);
          }
        }
      }
    }

    // Register factory commands
    const commandCommand = createCommandCommand(this.customCommandService);
    this.commands.set(commandCommand.data.name, commandCommand);

    const notasCommand = createNotasCommand(this.noteRepository);
    this.commands.set(notasCommand.data.name, notasCommand);

    const pontosCommand = createPontosCommand(this.pointsService);
    this.commands.set(pontosCommand.data.name, pontosCommand);

    const dueloCommand = createDueloCommand(this.pointsService, this.duelRepository);
    this.commands.set(dueloCommand.data.name, dueloCommand);

    const rankCommand = createRankCommand(this.pointsService);
    this.commands.set(rankCommand.data.name, rankCommand);

    // Music commands
    for (const cmd of createAllMusicCommands(this.musicService)) {
      this.commands.set(cmd.data.name, cmd);
    }

    // Help must be last so it captures all built-in commands
    const helpCommand = createHelpCommand(this.commands, this.customCommandService);
    this.commands.set(helpCommand.data.name, helpCommand);
  }

  async register(): Promise<void> {
    const { env } = await import('../config/env') as { env: { DISCORD_TOKEN: string; DISCORD_CLIENT_ID: string; GUILD_ID?: string } };
    const rest = new REST().setToken(env.DISCORD_TOKEN);
    const commandData = [...this.commands.values()].map((cmd) => cmd.data.toJSON());

    if (env.GUILD_ID) {
      // Explicit guild override (e.g. for local dev)
      await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.GUILD_ID), { body: commandData });
      console.log(`Registered ${commandData.length} application commands in guild ${env.GUILD_ID}.`);
      return;
    }

    // Register to every guild the bot is currently in (instant propagation, no GUILD_ID needed)
    const guilds = [...this.client.guilds.cache.values()];
    if (guilds.length === 0) {
      // Fallback: global registration
      await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: commandData });
      console.log(`Registered ${commandData.length} application commands globally.`);
      return;
    }

    // Clear any stale global commands so they don't duplicate guild-specific ones
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: [] });

    await Promise.all(
      guilds.map((guild) =>
        rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guild.id), { body: commandData }),
      ),
    );
    console.log(`Registered ${commandData.length} application commands in ${guilds.length} guild(s).`);
  }
}
