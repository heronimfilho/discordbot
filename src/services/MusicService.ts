import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import play from 'play-dl';

export type LoopMode = 'off' | 'track' | 'queue';

export interface Track {
  title: string;
  url: string;
  duration: string;
  requestedBy: string;
}

interface GuildMusicState {
  connection: VoiceConnection;
  player: AudioPlayer;
  queue: Track[];
  currentTrack: Track | null;
  volume: number;
  loopMode: LoopMode;
}

export class MusicService {
  private readonly states = new Map<string, GuildMusicState>();

  getCurrentTrack(guildId: string): Track | null {
    return this.states.get(guildId)?.currentTrack ?? null;
  }

  getQueue(guildId: string): Track[] {
    return [...(this.states.get(guildId)?.queue ?? [])];
  }

  getVolume(guildId: string): number {
    return this.states.get(guildId)?.volume ?? 50;
  }

  getLoopMode(guildId: string): LoopMode {
    return this.states.get(guildId)?.loopMode ?? 'off';
  }

  async playOrEnqueue(channel: VoiceBasedChannel, track: Track): Promise<'playing' | 'queued'> {
    const guildId = channel.guild.id;
    const existing = this.states.get(guildId);

    if (existing?.currentTrack) {
      existing.queue.push(track);
      return 'queued';
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    const state: GuildMusicState = {
      connection,
      player,
      queue: [],
      currentTrack: null,
      volume: existing?.volume ?? 50,
      loopMode: existing?.loopMode ?? 'off',
    };
    this.states.set(guildId, state);

    player.on(AudioPlayerStatus.Idle, () => {
      void this.playNext(guildId);
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      this.cleanup(guildId);
    });

    state.queue.push(track);
    await this.playNext(guildId);
    return 'playing';
  }

  skip(guildId: string): Promise<boolean> {
    const state = this.states.get(guildId);
    if (!state?.currentTrack) return Promise.resolve(false);
    state.player.stop();
    return Promise.resolve(true);
  }

  stop(guildId: string): boolean {
    const state = this.states.get(guildId);
    if (!state) return false;
    state.queue = [];
    state.loopMode = 'off';
    state.player.stop();
    this.cleanup(guildId);
    return true;
  }

  pause(guildId: string): boolean {
    const state = this.states.get(guildId);
    if (!state) return false;
    return state.player.pause();
  }

  resume(guildId: string): boolean {
    const state = this.states.get(guildId);
    if (!state) return false;
    return state.player.unpause();
  }

  setVolume(guildId: string, volume: number): boolean {
    const state = this.states.get(guildId);
    if (!state) return false;
    state.volume = Math.max(0, Math.min(100, volume));
    if (state.player.state.status === AudioPlayerStatus.Playing) {
      const resource = state.player.state.resource;
      resource.volume?.setVolumeLogarithmic(state.volume / 100);
    }
    return true;
  }

  cycleLoopMode(guildId: string): LoopMode | null {
    const state = this.states.get(guildId);
    if (!state) return null;
    const modes: LoopMode[] = ['off', 'track', 'queue'];
    state.loopMode = modes[(modes.indexOf(state.loopMode) + 1) % modes.length]!;
    return state.loopMode;
  }

  shuffle(guildId: string): boolean {
    const state = this.states.get(guildId);
    if (!state || state.queue.length === 0) return false;
    for (let i = state.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]];
    }
    return true;
  }

  removeFromQueue(guildId: string, position: number): Track | null {
    const state = this.states.get(guildId);
    if (!state || position < 1 || position > state.queue.length) return null;
    return state.queue.splice(position - 1, 1)[0] ?? null;
  }

  clearQueue(guildId: string): boolean {
    const state = this.states.get(guildId);
    if (!state) return false;
    state.queue = [];
    return true;
  }

  private async playNext(guildId: string): Promise<void> {
    const state = this.states.get(guildId);
    if (!state) return;

    if (state.loopMode === 'track' && state.currentTrack) {
      state.queue.unshift(state.currentTrack);
    } else if (state.loopMode === 'queue' && state.currentTrack) {
      state.queue.push(state.currentTrack);
    }

    if (state.queue.length === 0) {
      state.currentTrack = null;
      this.cleanup(guildId);
      return;
    }

    const next = state.queue.shift()!;
    state.currentTrack = next;

    try {
      const stream = await play.stream(next.url, { quality: 1 });
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true,
      });
      resource.volume?.setVolumeLogarithmic(state.volume / 100);
      state.player.play(resource);
    } catch (err) {
      console.error('[MusicService] Failed to stream track, skipping:', err);
      void this.playNext(guildId);
    }
  }

  private cleanup(guildId: string): void {
    const state = this.states.get(guildId);
    if (state) {
      try { state.connection.destroy(); } catch { /* already destroyed */ }
    }
    this.states.delete(guildId);
  }
}
