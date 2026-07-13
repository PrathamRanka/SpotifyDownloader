import { describe, expect, it } from 'vitest';
import { assertInside, sanitizePathSegment, trackFilename } from '../../../src/utils/path.js';

describe('path utilities', () => {
  it('creates portable output names', () => {
    expect(sanitizePathSegment('A/B: C?')).toBe('A_B_ C_');
    expect(trackFilename(0, 120, 'Song')).toBe('001 - Song.mp3');
  });
  it('rejects path escapes', () => expect(() => assertInside('/music', '/outside/song.mp3')).toThrow());
});
