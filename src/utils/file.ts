import fs from 'node:fs/promises';

export async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function removeIfExists(file: string): Promise<void> {
  await fs.rm(file, { force: true }).catch(() => undefined);
}

export async function atomicWrite(file: string, content: string | Buffer): Promise<void> {
  const temporary = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temporary, content);
  await fs.rename(temporary, file);
}
