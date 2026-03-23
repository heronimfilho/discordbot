import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createVolumeCommand(musicService: MusicService): ICommand {
  return {
    category: 'música',
    data: new SlashCommandBuilder()
      .setName('volume')
      .setDescription('Ajustar o volume da música (0–100)')
      .setDescriptionLocalization('en-US', 'Adjust music volume (0–100)')
      .addIntegerOption((opt) =>
        opt
          .setName('nivel')
          .setNameLocalization('en-US', 'level')
          .setDescription('Volume de 0 a 100')
          .setDescriptionLocalization('en-US', 'Volume from 0 to 100')
          .setMinValue(0)
          .setMaxValue(100)
          .setRequired(true),
      ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const level = interaction.options.getInteger('nivel', true);
      const set = musicService.setVolume(interaction.guildId, level);
      if (set) {
        await interaction.reply(`🔊 Volume ajustado para **${level}%**.`);
      } else {
        await interaction.reply({ content: '❌ Não há nada tocando no momento.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
