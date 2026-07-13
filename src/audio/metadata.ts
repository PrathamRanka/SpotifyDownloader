import type { AudioMetadata } from '../types/metadata.js';
import type { Track } from '../types/track.js';

export function metadataFromTrack(track: Track): AudioMetadata {
  return {
    title: track.title,
    artist: track.artists.join(', '),
    album: track.album,
    albumArtist: track.albumArtist,
    trackNumber: String(track.trackNumber),
    discNumber: String(track.discNumber),
    year: track.releaseDate?.slice(0, 4),
    isrc: track.isrc,
  };
}
