import type { Track } from './track.js';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  owner: string;
  artworkUrl?: string;
  tracks: Track[];
}
