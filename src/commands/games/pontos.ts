import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';
import { PointsService } from '../../services/PointsService';

export function createPontosCommand(service: PointsService): ICommand {
  return {
    category: 'pontos',
    data: new SlashCommandBuilder()
      .setName('pontos')
      .setDescription('Ver seu saldo de pontos')
      .setDescriptionLocalization('en-US', 'Check your points balance'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const balance = service.getBalance(interaction.guildId, interaction.user.id);
      const embed = new EmbedBuilder()
        .setTitle('Seus Pontos')
        .setDescription(`Você tem **${balance}** pontos.`)
        .setColor(0xfee75c);

      if (balance === 0) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`pontos_start:${interaction.user.id}`)
            .setLabel('Iniciar com 1000 pontos')
            .setStyle(ButtonStyle.Success),
        );
        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    },
  };
}
