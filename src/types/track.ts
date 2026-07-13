export interface Track {
  id: string;
  title: string;
  artists: string[];
  album: string;
  albumArtist: string;
  releaseDate?: string;
  artworkUrl?: string;
  trackNumber: number;
  discNumber: number;
  durationMs: number;
  isrc?: string;
}

export interface SourceCandidate {
  id: string;
  url: string;
  title: string;
  uploader?: string;
  durationSeconds?: number;
  score: number;
}
