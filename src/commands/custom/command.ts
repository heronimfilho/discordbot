import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { ICommand } from '../../types/Command';
import { CustomCommandService } from '../../services/CustomCommandService';
import { CustomCommandType } from '../../types/CustomCommand';

const VALID_TYPES: CustomCommandType[] = ['response', 'warning', 'counter'];

function buildCommandSlashData() {
  return new SlashCommandBuilder()
    .setName('command')
    .setNameLocalization('pt-BR', 'comando')
    .setDescription('Manage custom commands')
    .setDescriptionLocalization('pt-BR', 'Gerenciar comandos personalizados')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setNameLocalization('pt-BR', 'adicionar')
        .setDescription('Add a new custom command')
        .setDescriptionLocalization('pt-BR', 'Adicionar um novo comando personalizado')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setNameLocalization('pt-BR', 'nome')
            .setDescription('Command name')
            .setDescriptionLocalization('pt-BR', 'Nome do comando')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('edit')
        .setNameLocalization('pt-BR', 'editar')
        .setDescription('Edit an existing custom command')
        .setDescriptionLocalization('pt-BR', 'Editar um comando personalizado existente')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setNameLocalization('pt-BR', 'nome')
            .setDescription('Command name to edit')
            .setDescriptionLocalization('pt-BR', 'Nome do comando a editar')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setNameLocalization('pt-BR', 'deletar')
        .setDescription('Delete a custom command')
        .setDescriptionLocalization('pt-BR', 'Deletar um comando personalizado')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setNameLocalization('pt-BR', 'nome')
            .setDescription('Command name to delete')
            .setDescriptionLocalization('pt-BR', 'Nome do comando a deletar')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setNameLocalization('pt-BR', 'listar')
        .setDescription('List all custom commands')
        .setDescriptionLocalization('pt-BR', 'Listar todos os comandos personalizados'),
    );
}

export function createCommandCommand(service: CustomCommandService): ICommand {
  return {
    data: buildCommandSlashData(),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'This command can only be used in a server.',
          ephemeral: true,
        });
        return;
      }

      const sub = interaction.options.getSubcommand();

      if (sub === 'add') {
        const name = interaction.options.getString('name', true).toLowerCase();

        const existing = service.findByName(interaction.guildId, name);
        if (existing) {
          await interaction.reply({
            content: `A command named \`/${name}\` already exists.`,
            ephemeral: true,
          });
          return;
        }

        const modal = new ModalBuilder()
          .setCustomId(`custom_command_add:${name}`)
          .setTitle('Create Custom Command');

        const typeInput = new TextInputBuilder()
          .setCustomId('type')
          .setLabel('Type (response / warning / counter)')
          .setPlaceholder('response')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const textInput = new TextInputBuilder()
          .setCustomId('text')
          .setLabel('Response text')
          .setPlaceholder('For counter type, use {{counter}} as placeholder.')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(textInput),
        );

        await interaction.showModal(modal);
        return;
      }

      if (sub === 'edit') {
        const name = interaction.options.getString('name', true).toLowerCase();
        const existing = service.findByName(interaction.guildId, name);
        if (!existing) {
          await interaction.reply({
            content: `No command named \`/${name}\` found.`,
            ephemeral: true,
          });
          return;
        }

        const modal = new ModalBuilder()
          .setCustomId(`custom_command_edit:${name}`)
          .setTitle('Edit Custom Command');

        const typeInput = new TextInputBuilder()
          .setCustomId('type')
          .setLabel('Type (response / warning / counter)')
          .setValue(existing.type)
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const textInput = new TextInputBuilder()
          .setCustomId('text')
          .setLabel('Response text')
          .setValue(existing.text)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(textInput),
        );

        await interaction.showModal(modal);
        return;
      }

      if (sub === 'delete') {
        const name = interaction.options.getString('name', true).toLowerCase();
        try {
          await service.delete(interaction.guildId, name);
          await interaction.reply({
            content: `Command \`/${name}\` deleted successfully!`,
            ephemeral: true,
          });
        } catch {
          await interaction.reply({
            content: `No command named \`/${name}\` found.`,
            ephemeral: true,
          });
        }
        return;
      }

      if (sub === 'list') {
        const commands = service.findAllByGuild(interaction.guildId);
        const embed = new EmbedBuilder().setTitle('Custom Commands').setColor(0x57f287);

        if (commands.length === 0) {
          embed.setDescription(
            'No custom commands yet. Use `/command add` to create one.',
          );
        } else {
          embed.setDescription(
            commands.map((c) => `\`/${c.name}\` — ${c.type}`).join('\n'),
          );
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    },
  };
}

export async function handleCommandModal(
  interaction: ModalSubmitInteraction,
  service: CustomCommandService,
): Promise<void> {
  const [action, name] = interaction.customId.split(':');
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    return;
  }
  const typeRaw = interaction.fields.getTextInputValue('type').trim().toLowerCase();
  const text = interaction.fields.getTextInputValue('text').trim();

  if (!VALID_TYPES.includes(typeRaw as CustomCommandType)) {
    await interaction.reply({
      content: 'Invalid type. Use: response, warning, or counter.',
      ephemeral: true,
    });
    return;
  }

  const type = typeRaw as CustomCommandType;

  try {
    if (action === 'custom_command_add') {
      await service.create({ guild_id: guildId, name, type, text });
      await interaction.reply({
        content: `Command \`/${name}\` created successfully!`,
        ephemeral: true,
      });
    } else if (action === 'custom_command_edit') {
      service.update(guildId, name, { type, text });
      await interaction.reply({
        content: `Command \`/${name}\` updated successfully!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: 'Unknown action.', ephemeral: true });
    }
  } catch {
    await interaction.reply({ content: 'An error occurred.', ephemeral: true });
  }
}
