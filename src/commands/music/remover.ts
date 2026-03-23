import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createRemoverCommand(musicService: MusicService): ICommand {
  return {
    category: 'música',
    data: new SlashCommandBuilder()
      .setName('remover')
      .setNameLocalization('en-US', 'remove')
      .setDescription('Remover uma música da fila pela posição')
      .setDescriptionLocalization('en-US', 'Remove a song from the queue by position')
      .addIntegerOption((opt) =>
        opt
          .setName('posicao')
          .setNameLocalization('en-US', 'position')
          .setDescription('Posição na fila (use /fila para ver a lista)')
          .setDescriptionLocalization('en-US', 'Position in queue (use /fila to see the list)')
          .setMinValue(1)
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
      const position = interaction.options.getInteger('posicao', true);
      const removed = musicService.removeFromQueue(interaction.guildId, position);
      if (removed) {
        await interaction.reply(`🗑️ Removido da fila: **${removed.title}**`);
      } else {
        await interaction.reply({ content: '❌ Posição inválida. Use `/fila` para ver a lista atual.', flags: MessageFlags.Ephemeral });
      }
    },
  };
}
