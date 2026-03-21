import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';
import { NoteRepository } from '../../database/repositories/NoteRepository';

export function createNotasCommand(repo: NoteRepository): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('notes')
      .setNameLocalization('pt-BR', 'notas')
      .setDescription('Manage server notes')
      .setDescriptionLocalization('pt-BR', 'Gerenciar notas do servidor')
      .addSubcommand((sub) =>
        sub
          .setName('save')
          .setNameLocalization('pt-BR', 'salvar')
          .setDescription('Save a note')
          .setDescriptionLocalization('pt-BR', 'Salvar uma nota')
          .addStringOption((opt) =>
            opt
              .setName('name')
              .setNameLocalization('pt-BR', 'nome')
              .setDescription('Note name')
              .setDescriptionLocalization('pt-BR', 'Nome da nota')
              .setRequired(true),
          )
          .addStringOption((opt) =>
            opt
              .setName('content')
              .setNameLocalization('pt-BR', 'conteudo')
              .setDescription('Note content')
              .setDescriptionLocalization('pt-BR', 'Conteúdo da nota')
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('view')
          .setNameLocalization('pt-BR', 'ver')
          .setDescription('View a note')
          .setDescriptionLocalization('pt-BR', 'Ver uma nota')
          .addStringOption((opt) =>
            opt
              .setName('name')
              .setNameLocalization('pt-BR', 'nome')
              .setDescription('Note name')
              .setDescriptionLocalization('pt-BR', 'Nome da nota')
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('delete')
          .setNameLocalization('pt-BR', 'deletar')
          .setDescription('Delete a note')
          .setDescriptionLocalization('pt-BR', 'Deletar uma nota')
          .addStringOption((opt) =>
            opt
              .setName('name')
              .setNameLocalization('pt-BR', 'nome')
              .setDescription('Note name')
              .setDescriptionLocalization('pt-BR', 'Nome da nota')
              .setRequired(true),
          ),
      )
      .addSubcommand((sub) =>
        sub
          .setName('list')
          .setNameLocalization('pt-BR', 'listar')
          .setDescription('List all notes')
          .setDescriptionLocalization('pt-BR', 'Listar todas as notas'),
      ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: 'Este comando só pode ser usado em um servidor.',
          ephemeral: true,
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
          await interaction.reply({ content: `📝 Nota \`${name}\` atualizada!`, ephemeral: true });
        } else {
          repo.save({ guild_id: interaction.guildId, name, content, created_by: interaction.user.id });
          await interaction.reply({ content: `📝 Nota \`${name}\` salva!`, ephemeral: true });
        }
        return;
      }

      if (sub === 'view') {
        const name = interaction.options.getString('name', true).toLowerCase();
        const note = repo.findByName(interaction.guildId, name);
        if (!note) {
          await interaction.reply({ content: `Nenhuma nota chamada \`${name}\` encontrada.`, ephemeral: true });
          return;
        }
        const embed = new EmbedBuilder()
          .setTitle(`📝 ${note.name}`)
          .setDescription(note.content)
          .setColor(0xfee75c)
          .setFooter({ text: `Criado em ${note.created_at}` });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (sub === 'delete') {
        const name = interaction.options.getString('name', true).toLowerCase();
        const existing = repo.findByName(interaction.guildId, name);
        if (!existing) {
          await interaction.reply({ content: `Nenhuma nota chamada \`${name}\` encontrada.`, ephemeral: true });
          return;
        }
        repo.delete(interaction.guildId, name);
        await interaction.reply({ content: `🗑️ Nota \`${name}\` deletada.`, ephemeral: true });
        return;
      }

      if (sub === 'list') {
        const notes = repo.findAllByGuild(interaction.guildId);
        const embed = new EmbedBuilder().setTitle('📝 Notas do Servidor').setColor(0xfee75c);
        if (notes.length === 0) {
          embed.setDescription('Nenhuma nota ainda. Use `/notas salvar` para criar uma.');
        } else {
          embed.setDescription(notes.map((n) => `\`${n.name}\``).join(', '));
        }
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    },
  };
}
