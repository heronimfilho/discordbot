import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
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
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const paused = musicService.pause(interaction.guildId);
      if (paused) {
        await interaction.reply('⏸️ Música pausada.');
      } else {
        await interaction.reply({ content: '❌ Não há nada tocando ou já está pausado.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
