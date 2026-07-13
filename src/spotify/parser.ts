const ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function parsePlaylistId(input: string): string {
  const value = input.trim();
  if (ID_PATTERN.test(value)) return value;

  try {
    const url = new URL(value);
    if (!['open.spotify.com', 'www.open.spotify.com'].includes(url.hostname)) throw new Error();
    const parts = url.pathname.split('/').filter(Boolean);
    const playlistIndex = parts.indexOf('playlist');
    const id = playlistIndex >= 0 ? parts[playlistIndex + 1] : undefined;
    if (id && ID_PATTERN.test(id)) return id;
  } catch {
    // The common error below is clearer than a URL parser error.
  }

  throw new Error('Expected a Spotify playlist URL or 22-character playlist ID');
}

export function isSpotifyPlaylist(input: string): boolean {
  try {
    parsePlaylistId(input);
    return true;
  } catch {
    return false;
  }
}
