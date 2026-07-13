import cliProgress from 'cli-progress';
import type { DownloadProgress } from '../types/common.js';

export class ProgressDisplay {
  private bar?: cliProgress.SingleBar;
  private completed = 0;

  start(total: number): void {
    if (!process.stdout.isTTY) return;
    this.completed = 0;
    this.bar = new cliProgress.SingleBar(
      { format: '{bar} {value}/{total} | {status} | {track}', hideCursor: true },
      cliProgress.Presets.shades_classic,
    );
    this.bar.start(total, 0, { status: 'starting', track: '' });
  }

  update(progress: DownloadProgress): void {
    if (this.bar) {
      const complete = ['completed', 'skipped', 'failed'].includes(progress.status);
      if (complete) this.completed++;
      this.bar.update(this.completed, { status: progress.status, track: progress.title.slice(0, 40) });
    } else {
      console.log(
        `[${progress.index + 1}/${progress.total}] ${progress.status}: ${progress.title}${progress.message ? ` (${progress.message})` : ''}`,
      );
    }
  }

  stop(): void {
    this.bar?.stop();
    this.bar = undefined;
  }
}
