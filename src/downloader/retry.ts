import { withRetry } from '../utils/retry.js';
interface RetryLogger {
  warn(message: string, detail?: unknown): void;
}

export function retryDownload<T>(
  operation: () => Promise<T>,
  retries: number,
  delayMs: number,
  logger?: RetryLogger,
): Promise<T> {
  return withRetry(operation, {
    retries,
    delayMs,
    onRetry: (error, attempt) => logger?.warn(`Download attempt ${attempt} failed; retrying`, error),
  });
}
