import { REST, Routes } from 'discord.js';
import { CustomCommandRepository } from '../database/repositories/CustomCommandRepository';
import { CreateCustomCommandDTO, CustomCommand, UpdateCustomCommandDTO } from '../types/CustomCommand';

export class CustomCommandService {
  private getRestClient(): { rest: REST; clientId: string } {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { env } = require('../config/env') as { env: { DISCORD_TOKEN: string; DISCORD_CLIENT_ID: string } };
    return { rest: new REST().setToken(env.DISCORD_TOKEN), clientId: env.DISCORD_CLIENT_ID };
  }

  constructor(private readonly repo: CustomCommandRepository) {}

  async create(dto: CreateCustomCommandDTO): Promise<void> {
    const existing = this.repo.findByName(dto.guild_id, dto.name);
    if (existing) throw new Error(`Command '${dto.name}' already exists`);

    this.repo.create(dto);
    await this.registerGuildCommand(dto.guild_id, dto.name);
  }

  update(guildId: string, name: string, dto: UpdateCustomCommandDTO): void {
    const existing = this.repo.findByName(guildId, name);
    if (!existing) throw new Error(`Command '${name}' not found`);
    this.repo.update(guildId, name, dto);
  }

  async delete(guildId: string, name: string): Promise<void> {
    const existing = this.repo.findByName(guildId, name);
    if (!existing) throw new Error(`Command '${name}' not found`);

    this.repo.delete(guildId, name);
    await this.unregisterGuildCommand(guildId, name);
  }

  findByName(guildId: string, name: string): CustomCommand | null {
    return this.repo.findByName(guildId, name);
  }

  findAllByGuild(guildId: string): CustomCommand[] {
    return this.repo.findAllByGuild(guildId);
  }

  executeAndResolve(guildId: string, name: string): string {
    const cmd = this.repo.findByName(guildId, name);
    if (!cmd) throw new Error(`Command '${name}' not found`);
    if (cmd.type === 'counter') this.repo.incrementCounter(guildId, name);
    const updated = this.repo.findByName(guildId, name)!;
    return this.resolveText(updated);
  }

  resolveText(cmd: CustomCommand): string {
    if (cmd.type === 'counter') {
      return cmd.text.replace('{count}', String(cmd.counter));
    }
    return cmd.text;
  }

  private async registerGuildCommand(guildId: string, name: string): Promise<void> {
    const { rest, clientId } = this.getRestClient();
    await rest.post(Routes.applicationGuildCommands(clientId, guildId), {
      body: { name, description: `Custom command: ${name}`, type: 1 },
    });
  }

  private async unregisterGuildCommand(guildId: string, name: string): Promise<void> {
    const { rest, clientId } = this.getRestClient();
    const commands = (await rest.get(
      Routes.applicationGuildCommands(clientId, guildId),
    )) as Array<{ id: string; name: string }>;

    const cmd = commands.find((c) => c.name === name);
    if (cmd) {
      await rest.delete(
        Routes.applicationGuildCommand(clientId, guildId, cmd.id),
      );
    }
  }
}
