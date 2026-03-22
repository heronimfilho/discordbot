import { Client, EmbedBuilder, Events, Interaction, InteractionReplyOptions, MessageFlags } from 'discord.js';
import { CommandHandler } from './CommandHandler';
import { CustomCommandService } from '../services/CustomCommandService';
import { handleCommandModal, handleTypeSelect } from '../commands/custom/command';
import { PointsService } from '../services/PointsService';
import { PendingDuelRepository } from '../database/repositories/PendingDuelRepository';

export class InteractionHandler {
  constructor(
    private readonly client: Client,
    private readonly commandHandler: CommandHandler,
    private readonly customCommandService: CustomCommandService,
    private readonly pointsService: PointsService,
    private readonly duelRepo: PendingDuelRepository,
  ) {}

  register(): void {
    this.client.on(Events.InteractionCreate, (interaction: Interaction) => {
      void (async () => {
        if (interaction.isButton()) {
          const { customId, user } = interaction;

          if (customId.startsWith('pontos_start:')) {
            const targetUserId = customId.split(':')[1];
            if (user.id !== targetUserId) {
              await interaction.reply({
                content: 'Este botão não é para você.',
                flags: MessageFlags.Ephemeral,
              });
              return;
            }
            const result = this.pointsService.start(interaction.guildId ?? '', user.id);
            if (result.success) {
              await interaction.reply({
                content: '🎉 Você recebeu **1000 pontos** para começar!',
                flags: MessageFlags.Ephemeral,
              });
            } else {
              await interaction.reply({
                content: '❌ Você já possui pontos.',
                flags: MessageFlags.Ephemeral,
              });
            }
            return;
          }

          if (customId.startsWith('duel_accept:') || customId.startsWith('duel_decline:')) {
            const duelId = parseInt(customId.split(':')[1], 10);
            const duel = this.duelRepo.findById(duelId);

            if (!duel) {
              await interaction.reply({
                content: '❌ Este duelo não existe ou já foi encerrado.',
                flags: MessageFlags.Ephemeral,
              });
              return;
            }
            if (user.id !== duel.challenged_id) {
              await interaction.reply({
                content: '❌ Este duelo não é com você.',
                flags: MessageFlags.Ephemeral,
              });
              return;
            }
            if (new Date() > new Date(duel.expires_at)) {
              this.duelRepo.delete(duelId);
              await interaction.reply({
                content: '❌ Este desafio expirou.',
                flags: MessageFlags.Ephemeral,
              });
              return;
            }

            if (customId.startsWith('duel_decline:')) {
              this.pointsService.declineDuel(duelId);
              const declined = new EmbedBuilder()
                .setTitle('⚔️ Duelo Recusado')
                .setDescription(`<@${user.id}> recusou o duelo.`)
                .setColor(0x95a5a6);
              await interaction.update({ embeds: [declined], components: [] });
              return;
            }

            // Accept
            const challengedBalance = this.pointsService.getBalance(duel.guild_id, user.id);
            const requiredAmount = duel.is_all_in ? 50 : duel.amount;
            if (challengedBalance < requiredAmount) {
              await interaction.reply({
                content: `❌ Você não tem pontos suficientes para aceitar. Saldo: **${challengedBalance}**.`,
                flags: MessageFlags.Ephemeral,
              });
              return;
            }

            const winnerId = Math.random() < 0.5 ? duel.challenger_id : duel.challenged_id;
            const result = this.pointsService.resolveDuel(duelId, winnerId);

            const resolved = new EmbedBuilder()
              .setTitle('⚔️ Resultado do Duelo!')
              .setDescription(
                `🏆 <@${result.winnerId}> venceu e ganhou **${result.pot}** pontos!\n` +
                  `😔 <@${result.loserId}> perdeu.\n\n` +
                  `Saldo <@${result.winnerId}>: **${result.winnerNewBalance}** pts\n` +
                  `Saldo <@${result.loserId}>: **${result.loserNewBalance}** pts`,
              )
              .setColor(0x57f287);
            await interaction.update({ embeds: [resolved], components: [] });
            return;
          }

          return;
        }

        // Handle select menus (type selection for custom commands)
        if (interaction.isStringSelectMenu()) {
          if (interaction.customId.startsWith('cc_type:')) {
            await handleTypeSelect(interaction, this.customCommandService);
          }
          return;
        }

        // Handle modals
        if (interaction.isModalSubmit()) {
          if (interaction.customId.startsWith('cc_modal:')) {
            await handleCommandModal(interaction, this.customCommandService);
          }
          return;
        }

        if (!interaction.isChatInputCommand()) return;

        // Try built-in commands first
        const command = this.commandHandler.commands.get(interaction.commandName);
        if (command) {
          try {
            await command.execute(interaction);
          } catch (error) {
            console.error(`Error executing /${interaction.commandName}:`, error);
            const msg: InteractionReplyOptions = {
              content: 'Ocorreu um erro ao executar este comando.',
              flags: MessageFlags.Ephemeral,
            };
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp(msg);
            } else {
              await interaction.reply(msg);
            }
          }
          return;
        }

        // Try custom commands
        if (interaction.guildId) {
          const customCmd = this.customCommandService.findByName(
            interaction.guildId,
            interaction.commandName,
          );
          if (customCmd) {
            try {
              const text = this.customCommandService.executeAndResolve(
                interaction.guildId,
                interaction.commandName,
              );

              if (customCmd.type === 'warning') {
                const embed = new EmbedBuilder().setDescription(text).setColor(0xfee75c);
                await interaction.reply({ embeds: [embed] });
              } else {
                await interaction.reply(text);
              }
            } catch (error) {
              console.error(`Error executing custom command /${interaction.commandName}:`, error);
              await interaction.reply({
                content: 'Ocorreu um erro.',
                flags: MessageFlags.Ephemeral,
              });
            }
          }
        }
      })();
    });
  }
}
