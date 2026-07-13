import path from 'node:path';
import type { Playlist } from '../types/playlist.js';
import type { Track } from '../types/track.js';
import { assertInside, sanitizePathSegment, trackFilename } from '../utils/path.js';
import { FileSystem } from './filesystem.js';

export class OutputStorage {
  readonly playlistDirectory: string;

  constructor(
    root: string,
    playlist: Playlist,
    private readonly fs = new FileSystem(),
  ) {
    const resolvedRoot = path.resolve(root);
    this.playlistDirectory = path.join(resolvedRoot, sanitizePathSegment(playlist.name));
    assertInside(resolvedRoot, this.playlistDirectory);
  }

  async initialize(): Promise<void> {
    await this.fs.ensureDirectory(this.playlistDirectory);
  }
  trackFile(track: Track, index: number, total: number): string {
    return path.join(this.playlistDirectory, trackFilename(index, total, track.title));
  }
  temporaryFile(track: Track): string {
    return path.join(this.playlistDirectory, `.${sanitizePathSegment(track.id)}.source`);
  }
  coverFile(): string {
    return path.join(this.playlistDirectory, 'cover.jpg');
  }
}
