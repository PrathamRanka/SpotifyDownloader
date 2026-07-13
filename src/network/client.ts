import { fetch, Headers, type Dispatcher, type RequestInit, type Response } from 'undici';
import { defaultHeaders } from './headers.js';
import { withRetry } from '../utils/retry.js';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: string,
  ) {
    super(message);
  }
}

export interface HttpClientOptions {
  dispatcher?: Dispatcher;
  timeoutMs?: number;
  retries?: number;
}

export class HttpClient {
  constructor(private readonly options: HttpClientOptions = {}) {}

  async request(url: string, init: RequestInit = {}): Promise<Response> {
    return withRetry(
      async () => {
        const response = await fetch(url, {
          ...init,
          dispatcher: this.options.dispatcher,
          headers: defaultHeaders(Object.fromEntries(new Headers(init.headers).entries())),
          signal: AbortSignal.timeout(this.options.timeoutMs ?? 30_000),
        });
        if (!response.ok) {
          const body = await response.text();
          throw new HttpError(response.status, `HTTP ${response.status} for ${url}`, body.slice(0, 500));
        }
        return response;
      },
      {
        retries: this.options.retries ?? 2,
        delayMs: 500,
        shouldRetry: (error) => !(error instanceof HttpError) || error.status === 429 || error.status >= 500,
      },
    );
  }

  async json<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await this.request(url, init);
    return response.json() as Promise<T>;
  }

  async buffer(url: string, init?: RequestInit): Promise<Buffer> {
    const response = await this.request(url, init);
    return Buffer.from(await response.arrayBuffer());
  }
}
