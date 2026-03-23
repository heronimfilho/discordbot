import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createAgoraCommand(musicService: MusicService): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('agora')
      .setNameLocalization('en-US', 'nowplaying')
      .setDescription('Ver a música tocando agora')
      .setDescriptionLocalization('en-US', 'Show the currently playing song'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const guildId = interaction.guildId;
      const track = musicService.getCurrentTrack(guildId);
      if (!track) {
        await interaction.reply({ content: '❌ Nenhuma música tocando no momento.', flags: MessageFlags.Ephemeral });
        return;
      }
      const loopLabel = { off: 'Desligado', track: 'Música', queue: 'Fila' }[musicService.getLoopMode(guildId)];
      const embed = new EmbedBuilder()
        .setTitle('▶️ Tocando agora')
        .setDescription(`**${track.title}**\nDuração: \`${track.duration}\`\nPedido por: ${track.requestedBy}`)
        .setFooter({ text: `Loop: ${loopLabel} | Volume: ${musicService.getVolume(guildId)}%` })
        .setColor(0x1db954);
      await interaction.reply({ embeds: [embed] });
    },
  };
}
