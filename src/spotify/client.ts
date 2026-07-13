import { SPOTIFY_API_BASE } from '../config/constants.js';
import { HttpClient, HttpError } from '../network/client.js';
import { SpotifyAuth } from './auth.js';

export class SpotifyClient {
  constructor(
    private readonly auth: SpotifyAuth,
    private readonly http: HttpClient,
  ) {}

  async get<T>(pathOrUrl: string): Promise<T> {
    const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${SPOTIFY_API_BASE}${pathOrUrl}`;
    try {
      return await this.http.json<T>(url, {
        headers: { authorization: `Bearer ${await this.auth.accessToken()}` },
      });
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        this.auth.invalidate();
        return this.http.json<T>(url, {
          headers: { authorization: `Bearer ${await this.auth.accessToken()}` },
        });
      }
      throw error;
    }
  }
}
