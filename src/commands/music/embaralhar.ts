import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
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
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const shuffled = musicService.shuffle(interaction.guildId);
      if (shuffled) {
        await interaction.reply('🔀 Fila embaralhada!');
      } else {
        await interaction.reply({ content: '❌ Não há músicas na fila para embaralhar.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
