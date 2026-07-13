import { describe, expect, it } from 'vitest';
import { DownloadQueue } from '../../src/downloader/queue.js';

describe('DownloadQueue', () => {
  it('tracks pending, active, retry, and completion states', () => {
    const queue = new DownloadQueue<string>();
    queue.enqueue('one', 'track');
    const item = queue.dequeue()!;
    expect(queue.activeCount).toBe(1);
    queue.retry(item);
    expect(queue.size).toBe(1);
    const retried = queue.dequeue()!;
    expect(retried.attempts).toBe(1);
    queue.complete(retried.id);
    expect(queue.activeCount).toBe(0);
  });
});
