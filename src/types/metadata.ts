import type { Track } from './track.js';

export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  trackNumber: string;
  discNumber: string;
  year?: string;
  isrc?: string;
}

export interface MetadataTask {
  file: string;
  track: Track;
  artwork?: Buffer;
}
