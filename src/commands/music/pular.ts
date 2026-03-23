import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createPularCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('pular')
      .setNameLocalization('en-US', 'skip')
      .setDescription('Pular para a próxima música da fila')
      .setDescriptionLocalization('en-US', 'Skip to the next song'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const skipped = await musicService.skip(interaction.guildId ?? '');
      await interaction.reply(skipped ? '⏭️ Pulando para a próxima música.' : '❌ Não há nada tocando no momento.');
    },
  };
}
