import { describe, expect, it, vi } from 'vitest';
import { withRetry } from '../../../src/utils/retry.js';

describe('withRetry', () => {
  it('returns after a transient failure', async () => {
    const operation = vi.fn().mockRejectedValueOnce(new Error('temporary')).mockResolvedValue('ok');
    await expect(withRetry(operation, { retries: 1, delayMs: 0 })).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
