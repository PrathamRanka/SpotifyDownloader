import { Agent, type Dispatcher } from 'undici';
import { createProxyDispatcher } from './proxy.js';

export class NetworkSession {
  readonly dispatcher: Dispatcher;

  constructor(proxyUrl?: string) {
    this.dispatcher =
      createProxyDispatcher(proxyUrl) ??
      new Agent({ connect: { timeout: 10_000 }, keepAliveTimeout: 10_000 });
  }

  async close(): Promise<void> {
    await this.dispatcher.close();
  }
}
