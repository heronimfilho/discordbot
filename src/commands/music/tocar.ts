import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import play from 'play-dl';
import { ICommand } from '../../types/Command';
import { MusicService, Track } from '../../services/MusicService';

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function createTocarCommand(musicService: MusicService): ICommand {
  return {
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
      let trackUrl: string;
      let trackTitle: string;
      let trackDuration: string;

      try {
        if (play.yt_validate(query) === 'video') {
          const info = await play.video_info(query);
          trackUrl = info.video_details.url;
          trackTitle = info.video_details.title ?? 'Título desconhecido';
          trackDuration = formatDuration(info.video_details.durationInSec ?? 0);
        } else {
          const results = await play.search(query, { source: { youtube: 'video' }, limit: 1 });
          if (results.length === 0) {
            await interaction.editReply('❌ Nenhum resultado encontrado para essa busca.');
            return;
          }
          const video = results[0];
          trackUrl = video.url;
          trackTitle = video.title ?? 'Título desconhecido';
          trackDuration = formatDuration(video.durationInSec ?? 0);
        }
      } catch (err) {
        console.error('[/tocar] Error:', err);
        await interaction.editReply('❌ Erro ao buscar a música. Tente uma URL direta ou outro nome.');
        return;
      }

      const track: Track = {
        title: trackTitle,
        url: trackUrl,
        duration: trackDuration,
        requestedBy: interaction.user.globalName ?? interaction.user.username,
      };

      const result = await musicService.playOrEnqueue(voiceChannel, track);

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
