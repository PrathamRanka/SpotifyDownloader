#!/usr/bin/env node
import { Command } from 'commander';
import { APP_NAME, APP_VERSION } from '../config/constants.js';
import { loadEnvironment } from '../config/env.js';
import { registerCommands } from './commands.js';
import { configureHelp } from './help.js';
import { cliOptions } from './options.js';

async function main(): Promise<void> {
  const environment = loadEnvironment();
  const program = new Command()
    .name(APP_NAME)
    .version(APP_VERSION)
    .description('Download Spotify playlists as tagged MP3 files');
  for (const option of cliOptions({
    output: environment.outputDirectory,
    workers: environment.workers,
    quality: environment.quality,
    retries: environment.retries,
    resume: environment.resume,
    logLevel: environment.logLevel,
  }))
    program.addOption(option);
  configureHelp(program);
  registerCommands(program, environment);
  await program.parseAsync();
}

main().catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
