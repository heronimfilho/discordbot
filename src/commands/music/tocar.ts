import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService, Track } from '../../services/MusicService';
import { getTrackInfo } from '../../services/YtDlpService';

export function createTocarCommand(musicService: MusicService): ICommand {
  return {
    category: 'música',
    data: new SlashCommandBuilder()
      .setName('tocar')
      .setNameLocalization('en-US', 'play')
      .setDescription('Tocar uma música ou adicionar à fila')
      .setDescriptionLocalization('en-US', 'Play a song or add to queue')
      .addStringOption((opt) =>
        opt
          .setName('busca')
          .setNameLocalization('en-US', 'query')
          .setDescription('Nome da música ou URL do YouTube')
          .setDescriptionLocalization('en-US', 'Song name or YouTube URL')
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

      const voiceChannel = interaction.guild?.voiceStates.cache.get(interaction.user.id)?.channel;
      if (!voiceChannel) {
        await interaction.reply({
          content: '❌ Você precisa estar em um canal de voz para tocar músicas.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferReply();

      const query = interaction.options.getString('busca', true);

      const info = await getTrackInfo(query);
      if (!info) {
        await interaction.editReply('❌ Não foi possível encontrar a música.');
        return;
      }

      const track: Track = {
        title: info.title,
        url: info.webpageUrl,
        duration: info.duration,
        requestedBy: interaction.user.globalName ?? interaction.user.username,
      };

      let result: 'playing' | 'queued';
      try {
        result = await musicService.playOrEnqueue(voiceChannel, track);
      } catch (err) {
        console.error('[/tocar] Failed to join voice channel or start playback:', err);
        await interaction.editReply('❌ Não foi possível entrar no canal de voz ou iniciar a reprodução.');
        return;
      }

      const embed = new EmbedBuilder().setColor(0x1db954);
      if (result === 'playing') {
        embed
          .setTitle('▶️ Tocando agora')
          .setDescription(
            `**${track.title}**\nDuração: \`${track.duration}\`\nPedido por: ${track.requestedBy}`,
          );
      } else {
        const queue = musicService.getQueue(interaction.guildId);
        embed
          .setTitle('📋 Adicionado à fila')
          .setDescription(
            `**${track.title}**\nDuração: \`${track.duration}\`\nPosição na fila: **${queue.length}**`,
          );
      }

      await interaction.editReply({ embeds: [embed] });
    },
  };
}
