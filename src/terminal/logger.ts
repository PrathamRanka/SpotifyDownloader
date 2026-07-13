import type { LogLevel } from '../types/common.js';
import { formatError } from '../utils/formatter.js';

const PRIORITY: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

export class Logger {
  constructor(private readonly level: LogLevel = 'info') {}
  debug(message: string, detail?: unknown): void {
    this.write('debug', message, detail);
  }
  info(message: string, detail?: unknown): void {
    this.write('info', message, detail);
  }
  warn(message: string, detail?: unknown): void {
    this.write('warn', message, detail);
  }
  error(message: string, detail?: unknown): void {
    this.write('error', message, detail);
  }

  private write(level: Exclude<LogLevel, 'silent'>, message: string, detail?: unknown): void {
    if (PRIORITY[level] < PRIORITY[this.level]) return;
    const suffix = detail === undefined ? '' : `: ${formatError(detail)}`;
    const line = `[${level.toUpperCase()}] ${message}${suffix}`;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }
}
