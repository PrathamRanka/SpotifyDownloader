import path from 'node:path';
import type { AppConfig, DownloadProgress } from '../types/common.js';
import type { Track } from '../types/track.js';
import type { AudioMetadata } from '../types/metadata.js';
import type { SourceCandidate } from '../types/track.js';
import { metadataFromTrack } from '../audio/metadata.js';
import { FileSystem } from '../storage/filesystem.js';
import { OutputStorage } from '../storage/output.js';

export interface WorkerDependencies {
  search: { search(track: Track): Promise<SourceCandidate> };
  sourceDownloader: { download(candidate: SourceCandidate, outputBase: string): Promise<string> };
  converter: { toMp3(input: string, output: string, quality: number): Promise<void> };
  artwork: { download(url?: string): Promise<Buffer | undefined> };
  id3: { write(file: string, metadata: AudioMetadata, artwork?: Buffer): void };
  filesystem: FileSystem;
}

export class DownloadWorker {
  constructor(
    private readonly config: AppConfig,
    private readonly dependencies: WorkerDependencies,
    private readonly onProgress: (progress: DownloadProgress) => void,
  ) {}

  async execute(track: Track, index: number, total: number, output: OutputStorage): Promise<string> {
    const destination = output.trackFile(track, index, total);
    const base = output.temporaryFile(track);
    const report = (status: DownloadProgress['status'], message?: string) =>
      this.onProgress({ trackId: track.id, title: track.title, index, total, status, message });
    let sourceFile: string | undefined;
    const encodedFile = `${base}.encoded.mp3`;
    try {
      report('searching');
      const candidate = await this.dependencies.search.search(track);
      report('downloading', `match ${Math.round(candidate.score * 100)}%`);
      sourceFile = await this.dependencies.sourceDownloader.download(candidate, base);
      report('converting');
      await this.dependencies.converter.toMp3(sourceFile, encodedFile, this.config.quality);
      report('tagging');
      const cover = await this.dependencies.artwork.download(track.artworkUrl);
      this.dependencies.id3.write(encodedFile, metadataFromTrack(track), cover);
      await this.dependencies.filesystem.rename(encodedFile, destination);
      report('completed');
      return destination;
    } finally {
      const candidates = [
        sourceFile,
        encodedFile,
        ...['webm', 'm4a', 'opus', 'ogg'].map((extension) => `${base}.${extension}`),
      ].filter((file): file is string => Boolean(file));
      await Promise.all(
        candidates
          .filter((file) => path.resolve(file) !== path.resolve(destination))
          .map((file) => this.dependencies.filesystem.remove(file)),
      );
    }
  }
}
