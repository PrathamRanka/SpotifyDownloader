import { describe, expect, it } from 'vitest';
import { parsePlaylistId } from '../src/spotify/parser.js';

const id = '37i9dQZF1DXcBWIGoYBM5M';

describe('parsePlaylistId', () => {
  it('accepts an ID', () => expect(parsePlaylistId(id)).toBe(id));
  it('accepts a Spotify URL', () => expect(parsePlaylistId(`https://open.spotify.com/playlist/${id}?si=abc`)).toBe(id));
  it('rejects non-Spotify URLs', () => expect(() => parsePlaylistId(`https://example.com/playlist/${id}`)).toThrow());
});
