import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
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
      const stopped = musicService.stop(interaction.guildId ?? '');
      await interaction.reply(stopped ? '⏹️ Música parada e fila limpa.' : '❌ Não há nada tocando no momento.');
    },
  };
}
