import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
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
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const skipped = await musicService.skip(interaction.guildId);
      if (skipped) {
        await interaction.reply('⏭️ Pulando para a próxima música.');
      } else {
        await interaction.reply({ content: '❌ Não há nada tocando no momento.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
