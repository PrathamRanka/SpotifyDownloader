import type { Command } from 'commander';
import type { AppConfig } from '../types/common.js';
import { HttpClient } from '../network/client.js';
import { NetworkSession } from '../network/session.js';
import { SpotifyAuth } from '../spotify/auth.js';
import { SpotifyClient } from '../spotify/client.js';
import { SpotifyPlaylistService } from '../spotify/playlist.js';
import { parsePlaylistId } from '../spotify/parser.js';
import { ArtworkService } from '../audio/artwork.js';
import { AudioConverter } from '../audio/converter.js';
import { Id3Writer } from '../audio/id3.js';
import { SourceDownloader } from '../source/downloader.js';
import { SourceSearch } from '../source/search.js';
import { FileSystem } from '../storage/filesystem.js';
import { DownloadWorker } from '../downloader/worker.js';
import { DownloadManager } from '../downloader/manager.js';
import { Logger } from '../terminal/logger.js';
import { ProgressDisplay } from '../terminal/progress.js';
import { Spinner } from '../terminal/spinner.js';
import { renderPlaylist, renderSummary } from '../terminal/renderer.js';
import type { CliOptions } from './options.js';

export async function downloadCommand(
  playlistInput: string,
  options: CliOptions,
  environment: AppConfig,
): Promise<void> {
  const config: AppConfig = {
    ...environment,
    outputDirectory: options.output,
    workers: options.workers,
    quality: options.quality,
    retries: options.retries,
    resume: options.resume,
    logLevel: options.logLevel,
  };
  const logger = new Logger(config.logLevel);
  const session = new NetworkSession(config.proxyUrl);
  const http = new HttpClient({
    dispatcher: session.dispatcher,
    timeoutMs: config.requestTimeoutMs,
    retries: config.retries,
  });
  const spinner = new Spinner();
  const progress = new ProgressDisplay();
  try {
    const auth = new SpotifyAuth(config.spotifyClientId, config.spotifyClientSecret, http);
    const spotify = new SpotifyPlaylistService(new SpotifyClient(auth, http));
    spinner.start('Retrieving playlist metadata...');
    const playlist = await spotify.get(parsePlaylistId(playlistInput));
    spinner.stop(renderPlaylist(playlist));

    const filesystem = new FileSystem();
    const artwork = new ArtworkService(http);
    const worker = new DownloadWorker(
      config,
      {
        search: new SourceSearch(config.ytDlpPath),
        sourceDownloader: new SourceDownloader(config.ytDlpPath),
        converter: new AudioConverter(config.ffmpegPath),
        artwork,
        id3: new Id3Writer(),
        filesystem,
      },
      (event) => progress.update(event),
    );
    const manager = new DownloadManager(
      config,
      worker,
      logger,
      (event) => progress.update(event),
      artwork,
      filesystem,
    );
    progress.start(playlist.tracks.length);
    const summary = await manager.download(playlist);
    progress.stop();
    console.log(renderSummary(summary));
    if (summary.failed.length) process.exitCode = 1;
  } finally {
    spinner.stop();
    progress.stop();
    await session.close();
  }
}

export function registerCommands(program: Command, environment: AppConfig): void {
  program
    .argument('<playlist>', 'Spotify playlist URL or 22-character ID')
    .action((playlist: string, options: CliOptions) => downloadCommand(playlist, options, environment));
}
