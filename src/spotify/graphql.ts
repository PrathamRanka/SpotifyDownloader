import { HttpClient } from '../network/client.js';

/**
 * Extension point for Spotify operations not exposed by the Web API client.
 * v1 intentionally does not depend on private GraphQL endpoints.
 */
export class SpotifyGraphqlClient {
  constructor(
    private readonly http: HttpClient,
    private readonly endpoint: string,
  ) {}

  execute<T>(operationName: string, variables: Record<string, unknown>, hash: string): Promise<T> {
    return this.http.json<T>(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operationName,
        variables,
        extensions: { persistedQuery: { version: 1, sha256Hash: hash } },
      }),
    });
  }
}
