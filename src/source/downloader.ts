import { runProcess } from '../audio/ffmpeg.js';
import type { SourceCandidate } from '../types/track.js';
import { exists } from '../utils/file.js';

export class SourceDownloader {
  constructor(private readonly ytDlpPath: string) {}

  async download(candidate: SourceCandidate, outputBase: string): Promise<string> {
    await runProcess(this.ytDlpPath, [
      '--no-playlist',
      '--no-progress',
      '--format',
      'bestaudio/best',
      '--output',
      `${outputBase}.%(ext)s`,
      candidate.url,
    ]);
    for (const extension of ['webm', 'm4a', 'opus', 'mp3', 'ogg']) {
      const file = `${outputBase}.${extension}`;
      if (await exists(file)) return file;
    }
    throw new Error('Source download completed without producing an audio file');
  }
}
