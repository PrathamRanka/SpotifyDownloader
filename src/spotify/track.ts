import type { Track } from '../types/track.js';
import type { SpotifyTrack } from './types.js';

export function mapSpotifyTrack(track: SpotifyTrack): Track {
  return {
    id: track.id,
    title: track.name,
    artists: track.artists.map(({ name }) => name),
    album: track.album.name,
    albumArtist: track.album.artists[0]?.name ?? track.artists[0]?.name ?? '',
    releaseDate: track.album.release_date,
    artworkUrl: track.album.images[0]?.url,
    trackNumber: track.track_number,
    discNumber: track.disc_number,
    durationMs: track.duration_ms,
    isrc: track.external_ids?.isrc,
  };
}
