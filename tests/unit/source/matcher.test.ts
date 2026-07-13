import { describe, expect, it } from 'vitest';
import { bestCandidate, scoreCandidate } from '../../../src/source/matcher.js';
import type { Track } from '../../../src/types/track.js';

const track: Track = {
  id: '1',
  title: 'Dream Song',
  artists: ['Sample Artist'],
  album: 'Album',
  albumArtist: 'Sample Artist',
  trackNumber: 1,
  discNumber: 1,
  durationMs: 180_000,
};

describe('source matcher', () => {
  it('prefers matching title, artist, and duration', () => {
    const match = bestCandidate(track, [
      { id: 'bad', url: 'bad', title: 'Dream Song karaoke', durationSeconds: 250 },
      {
        id: 'good',
        url: 'good',
        title: 'Sample Artist - Dream Song (Official Audio)',
        uploader: 'Sample Artist',
        durationSeconds: 181,
      },
    ]);
    expect(match?.id).toBe('good');
    expect(match!.score).toBeGreaterThan(0.6);
  });
  it('penalizes unwanted variants', () => {
    const official = scoreCandidate(track, {
      id: '1',
      url: '1',
      title: 'Sample Artist Dream Song',
      durationSeconds: 180,
    });
    const cover = scoreCandidate(track, {
      id: '2',
      url: '2',
      title: 'Sample Artist Dream Song cover',
      durationSeconds: 180,
    });
    expect(official).toBeGreaterThan(cover);
  });
});
