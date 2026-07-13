export interface SpotifyImage {
  url: string;
  width?: number;
  height?: number;
}
export interface SpotifyArtist {
  id?: string;
  name: string;
}
export interface SpotifyAlbum {
  name: string;
  release_date?: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
}
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
  track_number: number;
  disc_number: number;
  external_ids?: { isrc?: string };
  album: SpotifyAlbum;
  is_local: boolean;
}
export interface SpotifyPlaylistItem {
  track: SpotifyTrack | null;
}
export interface SpotifyPage<T> {
  items: T[];
  next: string | null;
  total: number;
}
export interface SpotifyPlaylistResponse {
  id: string;
  name: string;
  description?: string;
  owner: { display_name?: string; id: string };
  images: SpotifyImage[];
  tracks: SpotifyPage<SpotifyPlaylistItem>;
}
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
