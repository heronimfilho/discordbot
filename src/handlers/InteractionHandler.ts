import { Client, EmbedBuilder, Events, Interaction } from 'discord.js';
import { CommandHandler } from './CommandHandler';
import { CustomCommandService } from '../services/CustomCommandService';
import { handleCommandModal, handleTypeSelect } from '../commands/custom/command';

export class InteractionHandler {
  constructor(
    private readonly client: Client,
    private readonly commandHandler: CommandHandler,
    private readonly customCommandService: CustomCommandService,
  ) {}

  register(): void {
    this.client.on(Events.InteractionCreate, (interaction: Interaction) => {
      void (async () => {
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
            const msg = {
              content: 'Ocorreu um erro ao executar este comando.',
              ephemeral: true,
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
                ephemeral: true,
              });
            }
          }
        }
      })();
    });
  }
}
