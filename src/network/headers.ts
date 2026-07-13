import { USER_AGENT } from '../config/constants.js';

export function defaultHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { accept: 'application/json', 'user-agent': USER_AGENT, ...extra };
}
