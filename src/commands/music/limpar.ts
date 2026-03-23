import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createLimparCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('limpar')
      .setNameLocalization('en-US', 'clearqueue')
      .setDescription('Limpar a fila sem parar a música atual')
      .setDescriptionLocalization('en-US', 'Clear the queue without stopping the current song'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const cleared = musicService.clearQueue(interaction.guildId ?? '');
      await interaction.reply(cleared ? '🗑️ Fila limpa.' : '❌ Não há fila para limpar.');
    },
  };
}
