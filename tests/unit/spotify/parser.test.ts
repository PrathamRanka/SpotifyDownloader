import { describe, expect, it } from 'vitest';
import { isSpotifyPlaylist, parsePlaylistId } from '../../../src/spotify/parser.js';

const id = '37i9dQZF1DXcBWIGoYBM5M';

describe('parsePlaylistId', () => {
  it('accepts IDs and Spotify URLs', () => {
    expect(parsePlaylistId(id)).toBe(id);
    expect(parsePlaylistId(`https://open.spotify.com/playlist/${id}?si=test`)).toBe(id);
  });
  it('rejects unrelated input', () => expect(isSpotifyPlaylist('https://example.com')).toBe(false));
});
