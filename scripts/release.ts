import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';

const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8')) as { version: string };
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(packageJson.version))
  throw new Error('package.json has an invalid semantic version');

for (const [command, args] of [
  ['npm', ['run', 'lint']],
  ['npm', ['test']],
  ['npm', ['run', 'build']],
] as const) {
  await new Promise<void>((resolve, reject) => {
    const npmCli = process.env.npm_execpath;
    const executable = npmCli ? process.execPath : command;
    const commandArgs = npmCli ? [npmCli, ...args] : [...args];
    const child = spawn(executable, commandArgs, { stdio: 'inherit' });
    child.once('error', reject);
    child.once('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} failed`)),
    );
  });
}

console.log(`Release ${packageJson.version} is ready.`);
