import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createEmbaralharCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('embaralhar')
      .setNameLocalization('en-US', 'shuffle')
      .setDescription('Embaralhar a fila de músicas')
      .setDescriptionLocalization('en-US', 'Shuffle the music queue'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const shuffled = musicService.shuffle(interaction.guildId ?? '');
      await interaction.reply(shuffled ? '🔀 Fila embaralhada!' : '❌ Não há músicas na fila para embaralhar.');
    },
  };
}
