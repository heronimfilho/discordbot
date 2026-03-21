import { Client, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { ICommand } from '../types/Command';
import { CustomCommandService } from '../services/CustomCommandService';
import { createCommandCommand } from '../commands/custom/command';

export class CommandHandler {
  readonly commands = new Collection<string, ICommand>();

  constructor(
    private readonly client: Client,
    private readonly customCommandService: CustomCommandService,
  ) {}

  async load(): Promise<void> {
    // Auto-discover utility commands
    const utilityDir = path.join(__dirname, '..', 'commands', 'utility');
    const files = fs
      .readdirSync(utilityDir)
      .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

    for (const file of files) {
      const module = await import(path.join(utilityDir, file)) as Record<string, unknown>;
      for (const exportedValue of Object.values(module)) {
        const command = exportedValue as ICommand;
        if (command?.data && typeof command?.execute === 'function') {
          this.commands.set(command.data.name, command);
        }
      }
    }

    // Register custom command manager
    const commandCommand = createCommandCommand(this.customCommandService);
    this.commands.set(commandCommand.data.name, commandCommand);
  }

  async register(): Promise<void> {
    const { env } = await import('../config/env') as { env: { DISCORD_TOKEN: string; DISCORD_CLIENT_ID: string; GUILD_ID?: string } };
    const rest = new REST().setToken(env.DISCORD_TOKEN);
    const commandData = [...this.commands.values()].map((cmd) => cmd.data.toJSON());

    const route = env.GUILD_ID
      ? Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.GUILD_ID)
      : Routes.applicationCommands(env.DISCORD_CLIENT_ID);

    await rest.put(route, { body: commandData });
    console.log(`Registered ${commandData.length} application commands.`);
  }
}
