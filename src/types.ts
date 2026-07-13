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
}

export interface Playlist {
  id: string;
  name: string;
  owner: string;
  artworkUrl?: string;
  tracks: Track[];
}

export interface AppConfig {
  outputDirectory: string;
  workers: number;
  quality: number;
  resume: boolean;
  ytDlpPath: string;
  ffmpegPath: string;
}
