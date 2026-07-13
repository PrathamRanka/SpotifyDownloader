import path from 'node:path';

// Control characters are invalid in Windows filenames.
// eslint-disable-next-line no-control-regex
const WINDOWS_RESERVED = /[<>:"/\\|?*\u0000-\u001f]/g;

export function sanitizeFilename(value: string): string {
  const sanitized = value.replace(WINDOWS_RESERVED, '_').replace(/[. ]+$/g, '').trim();
  return sanitized || 'untitled';
}

export function outputFilename(index: number, total: number, title: string): string {
  const width = Math.max(2, String(total).length);
  return `${String(index + 1).padStart(width, '0')} - ${sanitizeFilename(title)}.mp3`;
}

export function isWithinDirectory(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function parsePositiveInteger(value: string, name: string, max = Number.MAX_SAFE_INTEGER): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new Error(`${name} must be an integer between 1 and ${max}`);
  }
  return parsed;
}
