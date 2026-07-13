import type { AppConfig } from '../types/common.js';

export const DEFAULT_CONFIG: Omit<AppConfig, 'spotifyClientId' | 'spotifyClientSecret'> = {
  outputDirectory: './downloads',
  workers: 4,
  quality: 320,
  resume: false,
  retries: 2,
  retryDelayMs: 1_000,
  requestTimeoutMs: 30_000,
  logLevel: 'info',
  ytDlpPath: 'yt-dlp',
  ffmpegPath: 'ffmpeg',
};
