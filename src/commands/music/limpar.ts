import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createLimparCommand(musicService: MusicService): ICommand {
  return {
    category: 'música',
    data: new SlashCommandBuilder()
      .setName('limpar')
      .setNameLocalization('en-US', 'clearqueue')
      .setDescription('Limpar a fila sem parar a música atual')
      .setDescriptionLocalization('en-US', 'Clear the queue without stopping the current song'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const cleared = musicService.clearQueue(interaction.guildId);
      if (cleared) {
        await interaction.reply('🗑️ Fila limpa.');
      } else {
        await interaction.reply({ content: '❌ Não há fila para limpar.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
