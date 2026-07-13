import path from 'node:path';
import { CACHE_VERSION } from '../config/constants.js';
import { sha256 } from '../utils/hash.js';
import { atomicWrite } from '../utils/file.js';
import { FileSystem } from './filesystem.js';

interface CacheEnvelope<T> {
  version: number;
  expiresAt: number;
  value: T;
}

export class FileCache {
  constructor(
    private readonly directory: string,
    private readonly fs = new FileSystem(),
  ) {}

  private file(key: string): string {
    return path.join(this.directory, `${sha256(key)}.json`);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const file = this.file(key);
    if (!(await this.fs.exists(file))) return undefined;
    try {
      const data = JSON.parse(await this.fs.readText(file)) as CacheEnvelope<T>;
      if (data.version !== CACHE_VERSION || data.expiresAt < Date.now()) {
        await this.fs.remove(file);
        return undefined;
      }
      return data.value;
    } catch {
      await this.fs.remove(file);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.fs.ensureDirectory(this.directory);
    await atomicWrite(
      this.file(key),
      JSON.stringify({ version: CACHE_VERSION, expiresAt: Date.now() + ttlMs, value }),
    );
  }
}
