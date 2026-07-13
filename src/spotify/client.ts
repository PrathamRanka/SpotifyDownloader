import type { Playlist, Track } from '../types.js';

interface SpotifyClientOptions { clientId: string; clientSecret: string }
interface TokenResponse { access_token: string; expires_in: number }
interface SpotifyImage { url: string }
interface SpotifyArtist { name: string }
interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
  track_number: number;
  disc_number: number;
  album: { name: string; release_date?: string; images: SpotifyImage[]; artists: SpotifyArtist[] };
  is_local: boolean;
}
interface PlaylistPage { items: Array<{ track: SpotifyTrack | null }>; next: string | null }
interface SpotifyPlaylist {
  id: string;
  name: string;
  owner: { display_name?: string; id: string };
  images: SpotifyImage[];
  tracks: PlaylistPage;
}

export class SpotifyClient {
  private token?: { value: string; expiresAt: number };
  constructor(private readonly options: SpotifyClientOptions) {}

  private async accessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) return this.token.value;
    const credentials = Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { authorization: `Basic ${credentials}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    if (!response.ok) throw new Error(`Spotify authentication failed (${response.status})`);
    const data = await response.json() as TokenResponse;
    this.token = { value: data.access_token, expiresAt: Date.now() + Math.max(0, data.expires_in - 60) * 1000 };
    return this.token.value;
  }

  private async get<T>(url: string): Promise<T> {
    const response = await fetch(url, { headers: { authorization: `Bearer ${await this.accessToken()}` } });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Spotify request failed (${response.status}): ${detail.slice(0, 200)}`);
    }
    return response.json() as Promise<T>;
  }

  async playlist(id: string): Promise<Playlist> {
    const fields = 'id,name,owner(display_name,id),images(url),tracks(items(track(id,name,artists(name),duration_ms,track_number,disc_number,is_local,album(name,release_date,images(url),artists(name)))),next)';
    const data = await this.get<SpotifyPlaylist>(`https://api.spotify.com/v1/playlists/${id}?fields=${encodeURIComponent(fields)}`);
    const items = [...data.tracks.items];
    let next = data.tracks.next;
    while (next) {
      const page = await this.get<PlaylistPage>(next);
      items.push(...page.items);
      next = page.next;
    }
    const tracks = items.flatMap(({ track }) => track && !track.is_local ? [this.mapTrack(track)] : []);
    return { id: data.id, name: data.name, owner: data.owner.display_name ?? data.owner.id, artworkUrl: data.images[0]?.url, tracks };
  }

  private mapTrack(track: SpotifyTrack): Track {
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
    };
  }
}
