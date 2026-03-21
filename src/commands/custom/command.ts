import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { ICommand } from '../../types/Command';
import { CustomCommandService } from '../../services/CustomCommandService';
import { CustomCommandType } from '../../types/CustomCommand';

const TYPE_OPTIONS = [
  {
    label: 'Resposta',
    description: 'Responde com texto fixo',
    value: 'response' as CustomCommandType,
    emoji: '💬',
  },
  {
    label: 'Aviso',
    description: 'Responde com um embed amarelo de aviso',
    value: 'warning' as CustomCommandType,
    emoji: '⚠️',
  },
  {
    label: 'Contador',
    description: 'Incrementa um número a cada chamada — use {{counter}} no texto',
    value: 'counter' as CustomCommandType,
    emoji: '🔢',
  },
];

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

function buildTypeSelectRow(customId: string, defaultValue?: CustomCommandType) {
  const select = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder('Escolha o tipo do comando...')
    .addOptions(
      TYPE_OPTIONS.map((opt) => ({
        label: opt.label,
        description: opt.description,
        value: opt.value,
        emoji: opt.emoji,
        default: opt.value === defaultValue,
      })),
    );
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
}

function buildTextModal(customId: string, title: string, existingText?: string) {
  const isCounter = customId.includes(':counter:');
  const textInput = new TextInputBuilder()
    .setCustomId('text')
    .setLabel('Texto do comando')
    .setPlaceholder(
      isCounter
        ? 'Variáveis disponíveis: {{counter}} — número atual\nEx: Olavo está em silêncio há {{counter}} dias'
        : 'Digite o texto que será exibido quando o comando for chamado.',
    )
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  if (existingText) textInput.setValue(existingText);

  return new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title)
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(textInput));
}

export function createCommandCommand(service: CustomCommandService): ICommand {
  return {
    data: buildCommandSlashData(),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'Este comando só pode ser usado em um servidor.',
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
            content: `Já existe um comando chamado \`/${name}\`.`,
            ephemeral: true,
          });
          return;
        }

        await interaction.reply({
          content: `**Criar comando \`/${name}\`**\nEscolha o tipo:`,
          components: [buildTypeSelectRow(`cc_type:add:${name}`)],
          ephemeral: true,
        });
        return;
      }

      if (sub === 'edit') {
        const name = interaction.options.getString('name', true).toLowerCase();
        const existing = service.findByName(interaction.guildId, name);
        if (!existing) {
          await interaction.reply({
            content: `Nenhum comando chamado \`/${name}\` encontrado.`,
            ephemeral: true,
          });
          return;
        }

        await interaction.reply({
          content: `**Editar comando \`/${name}\`**\nEscolha o novo tipo:`,
          components: [buildTypeSelectRow(`cc_type:edit:${name}`, existing.type)],
          ephemeral: true,
        });
        return;
      }

      if (sub === 'delete') {
        const name = interaction.options.getString('name', true).toLowerCase();
        try {
          await service.delete(interaction.guildId, name);
          await interaction.reply({
            content: `Comando \`/${name}\` deletado com sucesso!`,
            ephemeral: true,
          });
        } catch {
          await interaction.reply({
            content: `Nenhum comando chamado \`/${name}\` encontrado.`,
            ephemeral: true,
          });
        }
        return;
      }

      if (sub === 'list') {
        const commands = service.findAllByGuild(interaction.guildId);
        const typeLabels: Record<CustomCommandType, string> = {
          response: '💬 Resposta',
          warning: '⚠️ Aviso',
          counter: '🔢 Contador',
        };
        const embed = new EmbedBuilder().setTitle('Comandos Personalizados').setColor(0x57f287);

        if (commands.length === 0) {
          embed.setDescription('Nenhum comando ainda. Use `/comando adicionar` para criar um.');
        } else {
          embed.setDescription(
            commands.map((c) => `\`/${c.name}\` — ${typeLabels[c.type]}`).join('\n'),
          );
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    },
  };
}

export async function handleTypeSelect(
  interaction: StringSelectMenuInteraction,
  service: CustomCommandService,
): Promise<void> {
  const parts = interaction.customId.split(':');
  const action = parts[1];
  const name = parts.slice(2).join(':');
  const type = interaction.values[0] as CustomCommandType;

  if (action === 'add') {
    const existing = service.findByName(interaction.guildId!, name);
    if (existing) {
      await interaction.update({
        content: `Já existe um comando chamado \`/${name}\`.`,
        components: [],
      });
      return;
    }
    await interaction.showModal(
      buildTextModal(`cc_modal:add:${type}:${name}`, `Criar /${name}`),
    );
    return;
  }

  if (action === 'edit') {
    const existing = service.findByName(interaction.guildId!, name);
    await interaction.showModal(
      buildTextModal(`cc_modal:edit:${type}:${name}`, `Editar /${name}`, existing?.text),
    );
  }
}

export async function handleCommandModal(
  interaction: ModalSubmitInteraction,
  service: CustomCommandService,
): Promise<void> {
  const parts = interaction.customId.split(':');
  const action = parts[1];
  const type = parts[2] as CustomCommandType;
  const name = parts.slice(3).join(':');

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({
      content: 'Este comando só pode ser usado em um servidor.',
      ephemeral: true,
    });
    return;
  }

  const text = interaction.fields.getTextInputValue('text').trim();

  try {
    if (action === 'add') {
      await service.create({ guild_id: guildId, name, type, text });
      await interaction.reply({
        content: `Comando \`/${name}\` criado com sucesso!`,
        ephemeral: true,
      });
    } else if (action === 'edit') {
      service.update(guildId, name, { type, text });
      await interaction.reply({
        content: `Comando \`/${name}\` atualizado com sucesso!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: 'Ação desconhecida.', ephemeral: true });
    }
  } catch {
    await interaction.reply({
      content: 'Ocorreu um erro ao processar o comando.',
      ephemeral: true,
    });
  }
}
