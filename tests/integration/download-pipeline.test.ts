import fs from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DownloadManager } from '../../src/downloader/manager.js';
import { DownloadWorker, type WorkerDependencies } from '../../src/downloader/worker.js';
import { FileSystem } from '../../src/storage/filesystem.js';
import type { AppConfig, DownloadProgress } from '../../src/types/common.js';
import type { Playlist } from '../../src/types/playlist.js';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe('complete download pipeline', () => {
  it('downloads, converts, tags, records, and resumes a playlist', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'spotifydl-'));
    temporaryDirectories.push(root);
    const filesystem = new FileSystem();
    const events: DownloadProgress[] = [];
    const config: AppConfig = {
      outputDirectory: root,
      workers: 2,
      quality: 320,
      resume: false,
      retries: 0,
      retryDelayMs: 0,
      requestTimeoutMs: 1_000,
      logLevel: 'silent',
      ytDlpPath: 'fake-yt-dlp',
      ffmpegPath: 'fake-ffmpeg',
      spotifyClientId: 'test',
      spotifyClientSecret: 'test',
    };
    const playlist: Playlist = {
      id: 'playlist',
      name: 'Integration Playlist',
      owner: 'Tests',
      artworkUrl: 'https://example.test/cover.jpg',
      tracks: [
        {
          id: 'one',
          title: 'First / Song',
          artists: ['Artist'],
          album: 'Album',
          albumArtist: 'Artist',
          trackNumber: 1,
          discNumber: 1,
          durationMs: 180_000,
        },
        {
          id: 'two',
          title: 'Second Song',
          artists: ['Artist'],
          album: 'Album',
          albumArtist: 'Artist',
          trackNumber: 2,
          discNumber: 1,
          durationMs: 200_000,
        },
      ],
    };
    const artwork = { download: async () => Buffer.from('image') };
    const dependencies: WorkerDependencies = {
      search: {
        search: async (track) => ({ id: track.id, url: `fake:${track.id}`, title: track.title, score: 1 }),
      },
      sourceDownloader: {
        download: async (_candidate, outputBase) => {
          const file = `${outputBase}.webm`;
          await fs.writeFile(file, 'source audio');
          return file;
        },
      },
      converter: { toMp3: async (input, output) => fs.copyFile(input, output).then(() => undefined) },
      artwork,
      id3: { write: (file, metadata) => appendFileSync(file, `\n${metadata.title}`) },
      filesystem,
    };
    const worker = new DownloadWorker(config, dependencies, (event) => events.push(event));
    const manager = new DownloadManager(
      config,
      worker,
      { warn: () => undefined },
      (event) => events.push(event),
      artwork,
      filesystem,
    );

    const first = await manager.download(playlist);
    expect(first).toMatchObject({ completed: 2, skipped: 0, failed: [] });
    const output = path.join(root, 'Integration Playlist');
    await expect(fs.readFile(path.join(output, '01 - First _ Song.mp3'), 'utf8')).resolves.toContain(
      'First / Song',
    );
    await expect(fs.readFile(path.join(output, '02 - Second Song.mp3'), 'utf8')).resolves.toContain(
      'Second Song',
    );
    await expect(fs.readFile(path.join(output, 'cover.jpg'), 'utf8')).resolves.toBe('image');
    const history = JSON.parse(await fs.readFile(path.join(output, '.spotifydl.json'), 'utf8')) as {
      downloads: Record<string, unknown>;
    };
    expect(Object.keys(history.downloads).sort()).toEqual(['one', 'two']);
    expect(events.some(({ status }) => status === 'completed')).toBe(true);

    config.resume = true;
    const resumed = await manager.download(playlist);
    expect(resumed).toMatchObject({ completed: 0, skipped: 2, failed: [] });
  });
});
