import type { SourceCandidate, Track } from '../types/track.js';
import { runProcess } from '../audio/ffmpeg.js';
import { bestCandidate } from './matcher.js';

interface YtDlpResult {
  id: string;
  webpage_url?: string;
  original_url?: string;
  title: string;
  uploader?: string;
  duration?: number;
}

export class SourceSearch {
  constructor(
    private readonly ytDlpPath: string,
    private readonly limit = 5,
  ) {}

  async search(track: Track): Promise<SourceCandidate> {
    const query = `${track.artists.join(', ')} - ${track.title} official audio`;
    const { stdout } = await runProcess(this.ytDlpPath, [
      '--dump-json',
      '--skip-download',
      '--no-playlist',
      `ytsearch${this.limit}:${query}`,
    ]);
    const candidates = stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const item = JSON.parse(line) as YtDlpResult;
        return {
          id: item.id,
          url: item.webpage_url ?? item.original_url ?? `https://www.youtube.com/watch?v=${item.id}`,
          title: item.title,
          uploader: item.uploader,
          durationSeconds: item.duration,
        };
      });
    const match = bestCandidate(track, candidates);
    if (!match) throw new Error(`No audio source found for ${track.title}`);
    return match;
  }
}
