export interface QueueItem<T> {
  id: string;
  value: T;
  attempts: number;
}

export class DownloadQueue<T> {
  private readonly pending: QueueItem<T>[] = [];
  private readonly active = new Set<string>();

  enqueue(id: string, value: T): void {
    this.pending.push({ id, value, attempts: 0 });
  }
  dequeue(): QueueItem<T> | undefined {
    const item = this.pending.shift();
    if (item) this.active.add(item.id);
    return item;
  }
  complete(id: string): void {
    this.active.delete(id);
  }
  retry(item: QueueItem<T>): void {
    this.active.delete(item.id);
    this.pending.push({ ...item, attempts: item.attempts + 1 });
  }
  get size(): number {
    return this.pending.length;
  }
  get activeCount(): number {
    return this.active.size;
  }
}
