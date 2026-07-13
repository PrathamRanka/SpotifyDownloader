import path from 'node:path';

// eslint-disable-next-line no-control-regex
const RESERVED = /[<>:"/\\|?*\u0000-\u001f]/g;

export function sanitizePathSegment(value: string): string {
  const sanitized = value
    .replace(RESERVED, '_')
    .replace(/[. ]+$/g, '')
    .trim();
  return sanitized || 'untitled';
}

export function trackFilename(index: number, total: number, title: string): string {
  const width = Math.max(2, String(total).length);
  return `${String(index + 1).padStart(width, '0')} - ${sanitizePathSegment(title)}.mp3`;
}

export function assertInside(parent: string, child: string): void {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Unsafe output path: ${child}`);
}
