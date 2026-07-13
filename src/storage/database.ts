import path from 'node:path';
import { atomicWrite } from '../utils/file.js';
import { FileSystem } from './filesystem.js';

export interface DownloadRecord {
  trackId: string;
  file: string;
  completedAt: string;
}
interface DatabaseShape {
  version: 1;
  downloads: Record<string, DownloadRecord>;
}

export class DownloadDatabase {
  private data: DatabaseShape = { version: 1, downloads: {} };
  private writeChain: Promise<void> = Promise.resolve();
  constructor(
    private readonly file: string,
    private readonly fs = new FileSystem(),
  ) {}

  async load(): Promise<void> {
    if (!(await this.fs.exists(this.file))) return;
    try {
      this.data = JSON.parse(await this.fs.readText(this.file)) as DatabaseShape;
    } catch {
      this.data = { version: 1, downloads: {} };
    }
  }

  get(trackId: string): DownloadRecord | undefined {
    return this.data.downloads[trackId];
  }

  async complete(trackId: string, file: string): Promise<void> {
    this.data.downloads[trackId] = { trackId, file, completedAt: new Date().toISOString() };
    this.writeChain = this.writeChain.then(() => atomicWrite(this.file, JSON.stringify(this.data, null, 2)));
    await this.writeChain;
  }
}

export function playlistDatabaseFile(directory: string): string {
  return path.join(directory, '.spotifydl.json');
}
