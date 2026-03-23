import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';
import { PointsService } from '../../services/PointsService';

export function createRankCommand(service: PointsService): ICommand {
  return {
    category: 'pontos',
    data: new SlashCommandBuilder()
      .setName('rank')
      .setDescription('Ver o ranking de pontos do servidor')
      .setDescriptionLocalization('en-US', 'View the server points ranking'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'Este comando só pode ser usado em um servidor.',
        });
        return;
      }

      const ranking = service.getRanking(interaction.guildId);

      const embed = new EmbedBuilder()
        .setTitle('Ranking de Pontos')
        .setColor(0xfee75c);

      if (ranking.length === 0) {
        embed.setDescription('Nenhum usuário com pontos ainda.');
      } else {
        const lines = ranking.map(
          (entry, i) => `**${i + 1}.** <@${entry.user_id}> — ${entry.balance} pts`,
        );
        embed.setDescription(lines.join('\n'));
      }

      await interaction.reply({ embeds: [embed] });
    },
  };
}
