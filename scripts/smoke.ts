import { spawn } from 'node:child_process';
import path from 'node:path';

async function runResult(
  args: string[],
  environment: NodeJS.ProcessEnv = process.env,
): Promise<{ code: number; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve('dist/cli/index.js'), ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: environment,
    });
    let output = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      output += chunk;
    });
    child.once('error', reject);
    child.once('close', (code) => resolve({ code: code ?? 1, output }));
  });
}

async function run(args: string[]): Promise<string> {
  const result = await runResult(args);
  if (result.code !== 0) throw new Error(`CLI exited with ${result.code}: ${result.output}`);
  return result.output;
}

const help = await run(['--help']);
if (!help.includes('Download Spotify playlists') || !help.includes('--workers'))
  throw new Error('CLI help smoke check failed');

const version = (await run(['--version'])).trim();
if (!/^\d+\.\d+\.\d+/.test(version)) throw new Error(`Unexpected CLI version: ${version}`);

const library = await import('../dist/index.js');
if (typeof library.parsePlaylistId !== 'function' || typeof library.DownloadManager !== 'function')
  throw new Error('Public package exports are incomplete');

const missingCredentials = await runResult(['37i9dQZF1DXcBWIGoYBM5M'], {
  ...process.env,
  SPOTIFY_CLIENT_ID: '',
  SPOTIFY_CLIENT_SECRET: '',
});
if (missingCredentials.code !== 1 || !missingCredentials.output.includes('SPOTIFY_CLIENT_ID'))
  throw new Error('Missing-credentials CLI check failed');

console.log(`CLI and package smoke checks passed (${version}).`);
