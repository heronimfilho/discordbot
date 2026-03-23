import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createRetomarCommand(musicService: MusicService): ICommand {
  return {
    category: 'música',
    data: new SlashCommandBuilder()
      .setName('retomar')
      .setNameLocalization('en-US', 'resume')
      .setDescription('Retomar a reprodução pausada')
      .setDescriptionLocalization('en-US', 'Resume paused playback'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const resumed = musicService.resume(interaction.guildId);
      if (resumed) {
        await interaction.reply('▶️ Reprodução retomada.');
      } else {
        await interaction.reply({ content: '❌ A música não está pausada.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
