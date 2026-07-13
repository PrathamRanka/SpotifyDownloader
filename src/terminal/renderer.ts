import type { DownloadSummary } from '../types/common.js';
import type { Playlist } from '../types/playlist.js';
import { formatDuration } from '../utils/formatter.js';

export function renderPlaylist(playlist: Playlist): string {
  return `${playlist.name}\nOwner: ${playlist.owner}\nTracks: ${playlist.tracks.length}`;
}

export function renderSummary(summary: DownloadSummary): string {
  const lines = [
    `Finished in ${formatDuration(summary.durationMs)}`,
    `${summary.completed} downloaded, ${summary.skipped} skipped, ${summary.failed.length} failed`,
  ];
  if (summary.failed.length)
    lines.push(...summary.failed.map(({ title, error }) => `  - ${title}: ${error.message}`));
  return lines.join('\n');
}
