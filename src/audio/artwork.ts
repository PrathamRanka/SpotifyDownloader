import { HttpClient } from '../network/client.js';

export class ArtworkService {
  constructor(private readonly http: HttpClient) {}
  async download(url?: string): Promise<Buffer | undefined> {
    return url ? this.http.buffer(url) : undefined;
  }
}
