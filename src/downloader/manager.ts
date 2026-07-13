import type { AppConfig, DownloadProgress, DownloadSummary } from '../types/common.js';
import type { Playlist } from '../types/playlist.js';
import { DownloadDatabase, playlistDatabaseFile } from '../storage/database.js';
import { FileSystem } from '../storage/filesystem.js';
import { OutputStorage } from '../storage/output.js';
import { retryDownload } from './retry.js';
import { schedule } from './scheduler.js';
import { DownloadWorker } from './worker.js';
import type { Logger } from '../terminal/logger.js';
import { ArtworkService } from '../audio/artwork.js';

export class DownloadManager {
  constructor(
    private readonly config: AppConfig,
    private readonly worker: DownloadWorker,
    private readonly logger: Logger,
    private readonly onProgress: (progress: DownloadProgress) => void,
    private readonly artwork: ArtworkService,
    private readonly filesystem = new FileSystem(),
  ) {}

  async download(playlist: Playlist): Promise<DownloadSummary> {
    const started = Date.now();
    const output = new OutputStorage(this.config.outputDirectory, playlist, this.filesystem);
    await output.initialize();
    if (playlist.artworkUrl && !(await this.filesystem.exists(output.coverFile()))) {
      const cover = await this.artwork.download(playlist.artworkUrl).catch((error) => {
        this.logger.warn('Could not download playlist cover', error);
        return undefined;
      });
      if (cover) await this.filesystem.writeBuffer(output.coverFile(), cover);
    }
    const database = new DownloadDatabase(playlistDatabaseFile(output.playlistDirectory), this.filesystem);
    await database.load();
    const summary: DownloadSummary = { completed: 0, skipped: 0, failed: [], durationMs: 0 };

    await schedule(playlist.tracks, this.config.workers, async (track, index) => {
      const destination = output.trackFile(track, index, playlist.tracks.length);
      if (this.config.resume && (await this.filesystem.exists(destination))) {
        summary.skipped++;
        this.onProgress({
          trackId: track.id,
          title: track.title,
          index,
          total: playlist.tracks.length,
          status: 'skipped',
        });
        return;
      }
      try {
        const file = await retryDownload(
          () => this.worker.execute(track, index, playlist.tracks.length, output),
          this.config.retries,
          this.config.retryDelayMs,
          this.logger,
        );
        await database.complete(track.id, file);
        summary.completed++;
      } catch (error) {
        const failure = error instanceof Error ? error : new Error(String(error));
        summary.failed.push({ trackId: track.id, title: track.title, error: failure });
        this.onProgress({
          trackId: track.id,
          title: track.title,
          index,
          total: playlist.tracks.length,
          status: 'failed',
          message: failure.message,
        });
      }
    });
    summary.durationMs = Date.now() - started;
    return summary;
  }
}
