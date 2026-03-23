import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createPausarCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('pausar')
      .setNameLocalization('en-US', 'pause')
      .setDescription('Pausar a reprodução')
      .setDescriptionLocalization('en-US', 'Pause playback'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const paused = musicService.pause(interaction.guildId ?? '');
      await interaction.reply(paused ? '⏸️ Música pausada.' : '❌ Não há nada tocando ou já está pausado.');
    },
  };
}
