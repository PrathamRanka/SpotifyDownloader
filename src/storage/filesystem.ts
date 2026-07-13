import fs from 'node:fs/promises';
import path from 'node:path';
import { exists, removeIfExists } from '../utils/file.js';

export class FileSystem {
  async ensureDirectory(directory: string): Promise<void> {
    await fs.mkdir(directory, { recursive: true });
  }
  async exists(file: string): Promise<boolean> {
    return exists(file);
  }
  async remove(file: string): Promise<void> {
    await removeIfExists(file);
  }
  async rename(source: string, destination: string): Promise<void> {
    await fs.rename(source, destination);
  }
  async copy(source: string, destination: string): Promise<void> {
    await fs.copyFile(source, destination);
  }
  async readText(file: string): Promise<string> {
    return fs.readFile(file, 'utf8');
  }
  async writeText(file: string, content: string): Promise<void> {
    await this.ensureDirectory(path.dirname(file));
    await fs.writeFile(file, content);
  }
  async writeBuffer(file: string, content: Buffer): Promise<void> {
    await this.ensureDirectory(path.dirname(file));
    await fs.writeFile(file, content);
  }
  async list(directory: string): Promise<string[]> {
    return fs.readdir(directory);
  }
}
