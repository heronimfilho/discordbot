import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createFilaCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('fila')
      .setNameLocalization('en-US', 'queue')
      .setDescription('Ver a fila de músicas')
      .setDescriptionLocalization('en-US', 'View the music queue'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const guildId = interaction.guildId;
      const current = musicService.getCurrentTrack(guildId);
      if (!current) {
        await interaction.reply({ content: '❌ Nenhuma música tocando no momento.', flags: MessageFlags.Ephemeral });
        return;
      }
      const queue = musicService.getQueue(guildId);
      const loopLabel = { off: 'Desligado', track: 'Música', queue: 'Fila' }[musicService.getLoopMode(guildId)];
      const embed = new EmbedBuilder()
        .setTitle('📋 Fila de Músicas')
        .setColor(0x5865f2)
        .addFields({ name: '▶️ Tocando agora', value: `**${current.title}** \`${current.duration}\`` });
      if (queue.length > 0) {
        const lines = queue.slice(0, 10).map((t, i) => `**${i + 1}.** ${t.title} \`${t.duration}\``);
        if (queue.length > 10) lines.push(`_... e mais ${queue.length - 10} música(s)_`);
        embed.addFields({ name: `📋 A seguir (${queue.length})`, value: lines.join('\n') });
      } else {
        embed.addFields({ name: '📋 A seguir', value: '_Fila vazia_' });
      }
      embed.setFooter({ text: `Loop: ${loopLabel} | Volume: ${musicService.getVolume(guildId)}%` });
      await interaction.reply({ embeds: [embed] });
    },
  };
}
