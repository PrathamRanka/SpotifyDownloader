#!/usr/bin/env node
import 'dotenv/config';
import { Command, InvalidArgumentError } from 'commander';
import { SpotifyClient } from '../spotify/client.js';
import { parsePlaylistId } from '../spotify/parser.js';
import { PlaylistDownloader } from '../downloader.js';
import { parsePositiveInteger } from '../utils.js';

function integer(name: string, max: number) {
  return (value: string): number => {
    try { return parsePositiveInteger(value, name, max); }
    catch (error) { throw new InvalidArgumentError((error as Error).message); }
  };
}

const program = new Command()
  .name('spotifydl')
  .description('Download a Spotify playlist as tagged MP3 files')
  .argument('<playlist>', 'Spotify playlist URL or ID')
  .option('-o, --output <directory>', 'output directory', process.env.OUTPUT_DIRECTORY ?? './downloads')
  .option('-w, --workers <number>', 'concurrent downloads', integer('workers', 32), Number(process.env.CONCURRENT_DOWNLOADS ?? 4))
  .option('-q, --quality <kbps>', 'MP3 bitrate', integer('quality', 320), Number(process.env.AUDIO_QUALITY ?? 320))
  .option('--resume', 'skip files that already exist', false)
  .action(async (playlistInput: string, options: { output: string; workers: number; quality: number; resume: boolean }) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the environment or .env');

    const id = parsePlaylistId(playlistInput);
    console.log('Retrieving playlist metadata...');
    const playlist = await new SpotifyClient({ clientId, clientSecret }).playlist(id);
    console.log(`Found ${playlist.tracks.length} tracks in "${playlist.name}"`);
    const downloader = new PlaylistDownloader({
      outputDirectory: options.output,
      workers: options.workers,
      quality: options.quality,
      resume: options.resume,
      ytDlpPath: process.env.YTDLP_PATH ?? 'yt-dlp',
      ffmpegPath: process.env.FFMPEG_PATH ?? 'ffmpeg',
    });
    const result = await downloader.download(playlist);
    console.log(`Done: ${result.completed} downloaded, ${result.skipped} skipped, ${result.failed.length} failed`);
    if (result.failed.length) process.exitCode = 1;
  });

program.parseAsync().catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
