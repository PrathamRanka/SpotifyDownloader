import type { Playlist } from '../types/playlist.js';
import { SpotifyClient } from './client.js';
import { mapSpotifyTrack } from './track.js';
import type { SpotifyPage, SpotifyPlaylistItem, SpotifyPlaylistResponse } from './types.js';

const FIELDS =
  'id,name,description,owner(display_name,id),images(url,width,height),tracks(items(track(id,name,artists(id,name),duration_ms,track_number,disc_number,is_local,external_ids,album(name,release_date,images(url,width,height),artists(id,name)))),next,total)';

export class SpotifyPlaylistService {
  constructor(private readonly client: SpotifyClient) {}

  async get(id: string): Promise<Playlist> {
    const data = await this.client.get<SpotifyPlaylistResponse>(
      `/playlists/${id}?fields=${encodeURIComponent(FIELDS)}`,
    );
    const items = [...data.tracks.items];
    let next = data.tracks.next;
    while (next) {
      const page = await this.client.get<SpotifyPage<SpotifyPlaylistItem>>(next);
      items.push(...page.items);
      next = page.next;
    }
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      owner: data.owner.display_name ?? data.owner.id,
      artworkUrl: data.images[0]?.url,
      tracks: items.flatMap(({ track }) => (track && !track.is_local ? [mapSpotifyTrack(track)] : [])),
    };
  }
}
