import 'dotenv/config';
import { DEFAULT_CONFIG } from './defaults.js';
import { SUPPORTED_QUALITIES } from './constants.js';
import type { AppConfig, AudioQuality, LogLevel } from '../types/common.js';
import { parseInteger } from '../utils/validator.js';

const LOG_LEVELS = new Set<LogLevel>(['debug', 'info', 'warn', 'error', 'silent']);

function quality(value: string | undefined): AudioQuality {
  const parsed = parseInteger(value ?? String(DEFAULT_CONFIG.quality), 'AUDIO_QUALITY', 128, 320);
  if (!SUPPORTED_QUALITIES.includes(parsed as AudioQuality)) {
    throw new Error(`AUDIO_QUALITY must be one of ${SUPPORTED_QUALITIES.join(', ')}`);
  }
  return parsed as AudioQuality;
}

function logLevel(value: string | undefined): LogLevel {
  const parsed = (value ?? DEFAULT_CONFIG.logLevel) as LogLevel;
  if (!LOG_LEVELS.has(parsed)) throw new Error('LOG_LEVEL must be debug, info, warn, error, or silent');
  return parsed;
}

export function loadEnvironment(): AppConfig {
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID?.trim() ?? '';
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim() ?? '';
  return {
    ...DEFAULT_CONFIG,
    outputDirectory: process.env.OUTPUT_DIRECTORY ?? DEFAULT_CONFIG.outputDirectory,
    workers: parseInteger(
      process.env.CONCURRENT_DOWNLOADS ?? String(DEFAULT_CONFIG.workers),
      'CONCURRENT_DOWNLOADS',
      1,
      32,
    ),
    quality: quality(process.env.AUDIO_QUALITY),
    retries: parseInteger(
      process.env.DOWNLOAD_RETRIES ?? String(DEFAULT_CONFIG.retries),
      'DOWNLOAD_RETRIES',
      0,
      10,
    ),
    retryDelayMs: parseInteger(
      process.env.RETRY_DELAY_MS ?? String(DEFAULT_CONFIG.retryDelayMs),
      'RETRY_DELAY_MS',
      0,
      60_000,
    ),
    requestTimeoutMs: parseInteger(
      process.env.REQUEST_TIMEOUT_MS ?? String(DEFAULT_CONFIG.requestTimeoutMs),
      'REQUEST_TIMEOUT_MS',
      1_000,
      300_000,
    ),
    logLevel: logLevel(process.env.LOG_LEVEL),
    ytDlpPath: process.env.YTDLP_PATH ?? DEFAULT_CONFIG.ytDlpPath,
    ffmpegPath: process.env.FFMPEG_PATH ?? DEFAULT_CONFIG.ffmpegPath,
    proxyUrl: process.env.PROXY_URL,
    spotifyClientId,
    spotifyClientSecret,
  };
}
