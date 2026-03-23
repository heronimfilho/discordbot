import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createPararCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('parar')
      .setNameLocalization('en-US', 'stop')
      .setDescription('Parar a música e limpar a fila')
      .setDescriptionLocalization('en-US', 'Stop music and clear the queue'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const stopped = musicService.stop(interaction.guildId);
      if (stopped) {
        await interaction.reply('⏹️ Música parada e fila limpa.');
      } else {
        await interaction.reply({ content: '❌ Não há nada tocando no momento.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
