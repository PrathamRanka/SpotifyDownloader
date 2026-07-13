export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export type AudioQuality = 128 | 192 | 256 | 320;
export type DownloadStatus =
  'pending' | 'searching' | 'downloading' | 'converting' | 'tagging' | 'completed' | 'failed' | 'skipped';

export interface AppConfig {
  outputDirectory: string;
  workers: number;
  quality: AudioQuality;
  resume: boolean;
  retries: number;
  retryDelayMs: number;
  requestTimeoutMs: number;
  logLevel: LogLevel;
  ytDlpPath: string;
  ffmpegPath: string;
  proxyUrl?: string;
  spotifyClientId: string;
  spotifyClientSecret: string;
}

export interface DownloadProgress {
  trackId: string;
  title: string;
  index: number;
  total: number;
  status: DownloadStatus;
  message?: string;
}

export interface DownloadFailure {
  trackId: string;
  title: string;
  error: Error;
}

export interface DownloadSummary {
  completed: number;
  skipped: number;
  failed: DownloadFailure[];
  durationMs: number;
}
