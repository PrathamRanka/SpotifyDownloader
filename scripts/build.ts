import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

await fs.rm(path.resolve('dist'), { recursive: true, force: true });

await new Promise<void>((resolve, reject) => {
  const compiler = path.resolve('node_modules/typescript/bin/tsc');
  const child = spawn(process.execPath, [compiler, '-p', 'tsconfig.json'], { stdio: 'inherit' });
  child.once('error', reject);
  child.once('close', (code) =>
    code === 0 ? resolve() : reject(new Error(`TypeScript exited with code ${code}`)),
  );
});

await fs.chmod(path.resolve('dist/cli/index.js'), 0o755).catch(() => undefined);
