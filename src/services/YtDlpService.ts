import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const COMMON_ARGS = [
  '--no-playlist',
  '--extractor-args', 'youtube:player_client=android,web',
];

export interface TrackInfo {
  title: string;
  duration: string;
  webpageUrl: string;
}

export async function getTrackInfo(query: string): Promise<TrackInfo | null> {
  const isUrl = /^https?:\/\//.test(query);
  const target = isUrl ? query : `ytsearch1:${query}`;
  try {
    const { stdout } = await execFileAsync('yt-dlp', [
      ...COMMON_ARGS,
      '--print', '%(title)s',
      '--print', '%(duration_string)s',
      '--print', '%(webpage_url)s',
      '--skip-download',
      target,
    ], { timeout: 20_000 });

    const [title, duration, webpageUrl] = stdout.trim().split('\n');
    if (!title || !webpageUrl) return null;
    return { title, duration: duration ?? 'N/A', webpageUrl };
  } catch (err) {
    console.error('[YtDlpService] getTrackInfo failed:', err);
    return null;
  }
}

export async function getStreamUrl(webpageUrl: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('yt-dlp', [
      ...COMMON_ARGS,
      '-f', 'bestaudio[ext=webm]/bestaudio',
      '--get-url',
      webpageUrl,
    ], { timeout: 30_000 });

    return stdout.trim().split('\n')[0] ?? null;
  } catch (err) {
    console.error('[YtDlpService] getStreamUrl failed:', err);
    return null;
  }
}
