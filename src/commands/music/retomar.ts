import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createRetomarCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('retomar')
      .setNameLocalization('en-US', 'resume')
      .setDescription('Retomar a reprodução pausada')
      .setDescriptionLocalization('en-US', 'Resume paused playback'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const resumed = musicService.resume(interaction.guildId ?? '');
      await interaction.reply(resumed ? '▶️ Reprodução retomada.' : '❌ A música não está pausada.');
    },
  };
}
