import { InvalidArgumentError, Option } from 'commander';
import { SUPPORTED_QUALITIES } from '../config/constants.js';
import type { AudioQuality, LogLevel } from '../types/common.js';
import { parseInteger } from '../utils/validator.js';

export interface CliOptions {
  output: string;
  workers: number;
  quality: AudioQuality;
  retries: number;
  resume: boolean;
  logLevel: LogLevel;
}

function integer(name: string, minimum: number, maximum: number) {
  return (value: string): number => {
    try {
      return parseInteger(value, name, minimum, maximum);
    } catch (error) {
      throw new InvalidArgumentError((error as Error).message);
    }
  };
}

function quality(value: string): AudioQuality {
  const parsed = integer('quality', 128, 320)(value) as AudioQuality;
  if (!SUPPORTED_QUALITIES.includes(parsed))
    throw new InvalidArgumentError(`quality must be one of ${SUPPORTED_QUALITIES.join(', ')}`);
  return parsed;
}

export function cliOptions(defaults: CliOptions): Option[] {
  return [
    new Option('-o, --output <directory>', 'output directory').default(defaults.output),
    new Option('-w, --workers <number>', 'concurrent downloads')
      .argParser(integer('workers', 1, 32))
      .default(defaults.workers),
    new Option('-q, --quality <kbps>', `MP3 bitrate (${SUPPORTED_QUALITIES.join(', ')})`)
      .argParser(quality)
      .default(defaults.quality),
    new Option('--retries <number>', 'retries per track')
      .argParser(integer('retries', 0, 10))
      .default(defaults.retries),
    new Option('--resume', 'skip tracks already present').default(defaults.resume),
    new Option('--log-level <level>', 'logging detail')
      .choices(['debug', 'info', 'warn', 'error', 'silent'])
      .default(defaults.logLevel),
  ];
}
