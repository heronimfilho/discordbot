import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { PendingDuelRepository } from '../../database/repositories/PendingDuelRepository';
import { PointsService } from '../../services/PointsService';
import { ICommand } from '../../types/Command';

export function createDueloCommand(
  service: PointsService,
  duelRepo: PendingDuelRepository,
): ICommand {
  return {
    category: 'pontos',
    data: new SlashCommandBuilder()
      .setName('duelo')
      .setDescription('Desafiar um usuário para um duelo de pontos')
      .setDescriptionLocalization('en-US', 'Challenge a user to a points duel')
      .addUserOption((opt) =>
        opt
          .setName('usuario')
          .setNameLocalization('en-US', 'user')
          .setDescription('O usuário a desafiar')
          .setDescriptionLocalization('en-US', 'The user to challenge')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('valor')
          .setNameLocalization('en-US', 'amount')
          .setDescription('Quantidade de pontos a apostar, ou "tudo" para all-in')
          .setDescriptionLocalization('en-US', 'Points to bet, or "tudo" for all-in')
          .setRequired(true),
      ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const challenged = interaction.options.getUser('usuario', true);
      const valorStr = interaction.options.getString('valor', true).toLowerCase().trim();
      const isAllIn = valorStr === 'tudo';

      const challengerBalance = service.getBalance(interaction.guildId, interaction.user.id);
      const amount = isAllIn ? challengerBalance : parseInt(valorStr, 10);

      if (!isAllIn && (isNaN(amount) || amount <= 0)) {
        await interaction.reply({
          content: '❌ Valor inválido. Use um número positivo ou "tudo".',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const validation = service.validateDuel(
        interaction.guildId,
        interaction.user.id,
        challenged.id,
        amount,
      );

      if (!validation.valid) {
        const messages: Record<string, string> = {
          self_duel: '❌ Você não pode duelar contra si mesmo.',
          insufficient_points: `❌ Você não tem pontos suficientes. Saldo atual: **${challengerBalance}**. Mínimo para duelar: **50**.`,
          pending_duel_exists: '❌ Um dos usuários já tem um duelo pendente.',
        };
        await interaction.reply({
          content: messages[validation.reason ?? ''] ?? '❌ Não foi possível criar o duelo.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const challengerName = interaction.user.globalName ?? interaction.user.username;
      const challengedName = challenged.globalName ?? challenged.username;
      const betDescription = isAllIn
        ? 'all-in (saldo total de ambos)'
        : `**${amount}** pontos cada`;

      const embed = new EmbedBuilder()
        .setTitle('⚔️ Duelo!')
        .setDescription(
          `**${challengerName}** desafiou **${challengedName}** para um duelo!\n\n` +
            `Aposta: ${betDescription}\n` +
            `<@${challenged.id}>, você aceita o desafio?`,
        )
        .setColor(0xe67e22)
        .setFooter({ text: 'Este desafio expira em 5 minutos.' });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('duel_accept:0')
          .setLabel('Aceitar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('duel_decline:0')
          .setLabel('Recusar')
          .setStyle(ButtonStyle.Danger),
      );

      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      });

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const duelId = duelRepo.create({
        guild_id: interaction.guildId,
        challenger_id: interaction.user.id,
        challenged_id: challenged.id,
        amount,
        is_all_in: isAllIn,
        channel_id: message.channelId,
        message_id: message.id,
        expires_at: expiresAt,
      });

      const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`duel_accept:${duelId}`)
          .setLabel('Aceitar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`duel_decline:${duelId}`)
          .setLabel('Recusar')
          .setStyle(ButtonStyle.Danger),
      );
      await interaction.editReply({ components: [updatedRow] });
    },
  };
}
