import { ProxyAgent, type Dispatcher } from 'undici';

export function createProxyDispatcher(proxyUrl?: string): Dispatcher | undefined {
  return proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
}
