import type { SourceCandidate, Track } from '../types/track.js';

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(' ').filter(Boolean));
}
function similarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((value) => b.has(value)).length;
  return intersection / Math.min(a.size, b.size);
}

export function scoreCandidate(track: Track, candidate: Omit<SourceCandidate, 'score'>): number {
  const titleScore = similarity(track.title, candidate.title);
  const artistScore = Math.max(
    ...track.artists.map((artist) => similarity(artist, `${candidate.title} ${candidate.uploader ?? ''}`)),
    0,
  );
  const expected = track.durationMs / 1000;
  const durationDifference = candidate.durationSeconds ? Math.abs(candidate.durationSeconds - expected) : 15;
  const durationScore = Math.max(0, 1 - durationDifference / Math.max(expected, 1));
  const penalty =
    /live|cover|karaoke|nightcore|remix/i.test(candidate.title) &&
    !/live|cover|karaoke|nightcore|remix/i.test(track.title)
      ? 0.2
      : 0;
  return Math.max(0, titleScore * 0.55 + artistScore * 0.3 + durationScore * 0.15 - penalty);
}

export function bestCandidate(
  track: Track,
  candidates: Array<Omit<SourceCandidate, 'score'>>,
): SourceCandidate | undefined {
  return candidates
    .map((candidate) => ({ ...candidate, score: scoreCandidate(track, candidate) }))
    .sort((a, b) => b.score - a.score)[0];
}
