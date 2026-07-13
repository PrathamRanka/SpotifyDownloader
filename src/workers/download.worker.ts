import type { SourceCandidate } from '../types/track.js';
import { SourceDownloader } from '../source/downloader.js';

export interface DownloadWorkerMessage {
  candidate: SourceCandidate;
  outputBase: string;
  ytDlpPath: string;
}

export async function runDownloadTask(message: DownloadWorkerMessage): Promise<string> {
  return new SourceDownloader(message.ytDlpPath).download(message.candidate, message.outputBase);
}
