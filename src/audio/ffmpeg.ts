import { spawn } from 'node:child_process';

export interface ProcessResult {
  stdout: string;
  stderr: string;
}

export function runProcess(
  command: string,
  args: string[],
  options: { cwd?: string } = {},
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr = (stderr + chunk).slice(-8_000);
    });
    child.once('error', (error) => reject(new Error(`Could not start ${command}: ${error.message}`)));
    child.once('close', (code) =>
      code === 0
        ? resolve({ stdout, stderr })
        : reject(new Error(`${command} exited with code ${code}: ${stderr.trim()}`)),
    );
  });
}

export async function verifyFfmpeg(command: string): Promise<void> {
  await runProcess(command, ['-version']);
}
