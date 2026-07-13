import { spawn } from 'node:child_process';

export function run(command: string, args: string[], options: { cwd?: string } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: options.cwd, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => { stderr = (stderr + chunk).slice(-4000); });
    child.once('error', (error) => reject(new Error(`Could not start ${command}: ${error.message}`)));
    child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}: ${stderr.trim()}`)));
  });
}
