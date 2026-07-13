import { sleep } from './sleep.js';

export interface RetryOptions {
  retries: number;
  delayMs: number;
  factor?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= options.retries || options.shouldRetry?.(error) === false) throw error;
      attempt++;
      options.onRetry?.(error, attempt);
      await sleep(options.delayMs * Math.pow(options.factor ?? 2, attempt - 1));
    }
  }
}
