import { withRetry } from '../utils/retry.js';
import type { Logger } from '../terminal/logger.js';

export function retryDownload<T>(
  operation: () => Promise<T>,
  retries: number,
  delayMs: number,
  logger?: Logger,
): Promise<T> {
  return withRetry(operation, {
    retries,
    delayMs,
    onRetry: (error, attempt) => logger?.warn(`Download attempt ${attempt} failed; retrying`, error),
  });
}
