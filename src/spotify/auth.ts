import { SPOTIFY_ACCOUNTS_BASE } from '../config/constants.js';
import { HttpClient } from '../network/client.js';
import type { SpotifyTokenResponse } from './types.js';

export class SpotifyAuth {
  private token?: { value: string; expiresAt: number };

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly http: HttpClient,
  ) {}

  async accessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) return this.token.value;
    if (!this.clientId || !this.clientSecret)
      throw new Error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET');
    const authorization = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await this.http.json<SpotifyTokenResponse>(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
      method: 'POST',
      headers: {
        authorization: `Basic ${authorization}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    this.token = {
      value: response.access_token,
      expiresAt: Date.now() + Math.max(0, response.expires_in - 60) * 1000,
    };
    return this.token.value;
  }

  invalidate(): void {
    this.token = undefined;
  }
}
