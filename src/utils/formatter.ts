export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0]!;
  for (let index = 1; value >= 1024 && index < units.length; index++) {
    value /= 1024;
    unit = units[index]!;
  }
  return `${value.toFixed(1)} ${unit}`;
}

export function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
