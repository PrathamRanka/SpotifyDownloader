import fs from 'node:fs/promises';
import path from 'node:path';

await Promise.all(
  ['dist', 'coverage'].map((directory) => fs.rm(path.resolve(directory), { recursive: true, force: true })),
);
