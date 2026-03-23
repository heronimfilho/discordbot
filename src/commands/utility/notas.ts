import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';
import { NoteRepository } from '../../database/repositories/NoteRepository';

export function createNotasCommand(repo: NoteRepository): ICommand {
  return {
    category: 'utilidade',
    data: new SlashCommandBuilder()
      .setName('notes')
      .setNameLocalization('pt-BR', 'notas')
      .setDescription('Gerenciar notas do servidor')
      .setDescriptionLocalization('en-US', 'Manage server notes')
      .addSubcommand((sub) =>
        sub
          .setName('save')
          .setNameLocalization('pt-BR', 'salvar')
          .setDescription('Salvar uma nota')
          .setDescriptionLocalization('en-US', 'Save a note')
          .addStringOption((opt) =>
            opt
              .setName('name')
              .setNameLocalization('pt-BR', 'nome')
              .setDescription('Nome da nota')
              .setDescriptionLocalization('en-US', 'Note name')
              .setRequired(true),
          )
          .addStringOption((opt) =>
            opt
              .setName('content')
              .setNameLocalization('pt-BR', 'conteudo')
              .setDescription('Conteúdo da nota')
              .setDescriptionLocalization('en-US', 'Note content')
              .setMaxLength(1000)
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('view')
          .setNameLocalization('pt-BR', 'ver')
          .setDescription('Ver uma nota')
          .setDescriptionLocalization('en-US', 'View a note')
          .addStringOption((opt) =>
            opt
              .setName('name')
              .setNameLocalization('pt-BR', 'nome')
              .setDescription('Nome da nota')
              .setDescriptionLocalization('en-US', 'Note name')
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('delete')
          .setNameLocalization('pt-BR', 'deletar')
          .setDescription('Deletar uma nota')
          .setDescriptionLocalization('en-US', 'Delete a note')
          .addStringOption((opt) =>
            opt
              .setName('name')
              .setNameLocalization('pt-BR', 'nome')
              .setDescription('Nome da nota')
              .setDescriptionLocalization('en-US', 'Note name')
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('list')
          .setNameLocalization('pt-BR', 'listar')
          .setDescription('Listar todas as notas')
          .setDescriptionLocalization('en-US', 'List all notes'),
      ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const sub = interaction.options.getSubcommand();

      if (sub === 'save') {
        const name = interaction.options.getString('name', true).toLowerCase();
        const content = interaction.options.getString('content', true);
        const existing = repo.findByName(interaction.guildId, name);

        if (existing) {
          repo.update(interaction.guildId, name, content);
          await interaction.reply({
            content: `📝 Nota \`${name}\` atualizada!`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          repo.save({ guild_id: interaction.guildId, name, content, created_by: interaction.user.id });
          await interaction.reply({
            content: `📝 Nota \`${name}\` salva!`,
            flags: MessageFlags.Ephemeral,
          });
        }
        return;
      }

      if (sub === 'view') {
        const name = interaction.options.getString('name', true).toLowerCase();
        const note = repo.findByName(interaction.guildId, name);
        if (!note) {
          await interaction.reply({
            content: `Nenhuma nota chamada \`${name}\` encontrada.`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const embed = new EmbedBuilder()
          .setTitle(`📝 ${note.name}`)
          .setDescription(note.content)
          .setColor(0xfee75c)
          .setFooter({ text: `Criado em ${note.created_at}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
      }

      if (sub === 'delete') {
        const name = interaction.options.getString('name', true).toLowerCase();
        const existing = repo.findByName(interaction.guildId, name);
        if (!existing) {
          await interaction.reply({
            content: `Nenhuma nota chamada \`${name}\` encontrada.`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        repo.delete(interaction.guildId, name);
        await interaction.reply({
          content: `🗑️ Nota \`${name}\` deletada.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (sub === 'list') {
        const notes = repo.findAllByGuild(interaction.guildId);
        const embed = new EmbedBuilder().setTitle('📝 Notas do Servidor').setColor(0xfee75c);
        if (notes.length === 0) {
          embed.setDescription('Nenhuma nota ainda. Use `/notas salvar` para criar uma.');
        } else {
          const rawList = notes.map((n) => `\`${n.name}\``).join(', ');
          embed.setDescription(rawList.length > 4000 ? rawList.slice(0, 4000) + '…' : rawList);
        }
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    },
  };
}
