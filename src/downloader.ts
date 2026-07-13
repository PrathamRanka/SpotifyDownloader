import fs from 'node:fs/promises';
import path from 'node:path';
import NodeID3 from 'node-id3';
import type { AppConfig, Playlist, Track } from './types.js';
import { run } from './process.js';
import { outputFilename, sanitizeFilename } from './utils.js';

export interface DownloadSummary { completed: number; skipped: number; failed: Array<{ track: Track; error: Error }> }

async function mapConcurrent<T>(items: T[], concurrency: number, task: (item: T, index: number) => Promise<void>): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await task(items[index]!, index);
    }
  });
  await Promise.all(workers);
}

export class PlaylistDownloader {
  constructor(private readonly config: AppConfig) {}

  async download(playlist: Playlist): Promise<DownloadSummary> {
    const directory = path.join(path.resolve(this.config.outputDirectory), sanitizeFilename(playlist.name));
    await fs.mkdir(directory, { recursive: true });
    const summary: DownloadSummary = { completed: 0, skipped: 0, failed: [] };

    await mapConcurrent(playlist.tracks, this.config.workers, async (track, index) => {
      const destination = path.join(directory, outputFilename(index, playlist.tracks.length, track.title));
      if (this.config.resume && await this.exists(destination)) {
        summary.skipped++;
        console.log(`[${index + 1}/${playlist.tracks.length}] skipped ${track.title}`);
        return;
      }
      try {
        console.log(`[${index + 1}/${playlist.tracks.length}] downloading ${track.title}`);
        await this.downloadTrack(track, destination);
        summary.completed++;
        console.log(`[${index + 1}/${playlist.tracks.length}] complete ${track.title}`);
      } catch (error) {
        summary.failed.push({ track, error: error instanceof Error ? error : new Error(String(error)) });
        console.error(`[${index + 1}/${playlist.tracks.length}] failed ${track.title}`);
      }
    });
    return summary;
  }

  private async downloadTrack(track: Track, destination: string): Promise<void> {
    const temporary = `${destination}.download`;
    const query = `ytsearch1:${track.artists.join(', ')} - ${track.title} audio`;
    try {
      await run(this.config.ytDlpPath, [
        '--no-playlist', '--no-progress', '--extract-audio', '--audio-format', 'mp3',
        '--audio-quality', `${this.config.quality}K`, '--ffmpeg-location', this.config.ffmpegPath,
        '--output', `${temporary}.%(ext)s`, query,
      ]);
      const produced = await this.findProducedFile(temporary);
      await this.writeTags(produced, track);
      await fs.rename(produced, destination);
    } catch (error) {
      await this.removeTemporaryFiles(temporary);
      throw error;
    }
  }

  private async writeTags(file: string, track: Track): Promise<void> {
    let imageBuffer: Buffer | undefined;
    if (track.artworkUrl) {
      const response = await fetch(track.artworkUrl);
      if (response.ok) imageBuffer = Buffer.from(await response.arrayBuffer());
    }
    const success = NodeID3.write({
      title: track.title,
      artist: track.artists.join(', '),
      album: track.album,
      performerInfo: track.albumArtist,
      trackNumber: String(track.trackNumber),
      partOfSet: String(track.discNumber),
      year: track.releaseDate?.slice(0, 4),
      image: imageBuffer ? { mime: 'image/jpeg', type: { id: 3, name: 'front cover' }, description: 'Cover', imageBuffer } : undefined,
    }, file);
    if (!success) throw new Error('Unable to write ID3 metadata');
  }

  private async findProducedFile(base: string): Promise<string> {
    for (const candidate of [`${base}.mp3`, base]) if (await this.exists(candidate)) return candidate;
    throw new Error('yt-dlp completed without producing an MP3 file');
  }

  private async removeTemporaryFiles(base: string): Promise<void> {
    await Promise.all([base, `${base}.mp3`, `${base}.webm`, `${base}.m4a`, `${base}.opus`].map((file) => fs.rm(file, { force: true }).catch(() => undefined)));
  }

  private async exists(file: string): Promise<boolean> {
    try { await fs.access(file); return true; } catch { return false; }
  }
}
