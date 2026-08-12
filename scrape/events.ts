import Emittery from 'emittery';
import type { ScrapeOptions } from './types.js';

export interface WebScrapeEvents {
  'request:start': { url: string; options: ScrapeOptions; timestamp: number };
  'request:response': { url: string; status: number; attempt: number; duration: number };
  'request:error': { url: string; error: Error; attempt: number };
  'request:retry': { url: string; attempt: number; maxRetries: number; delayMs: number };
  'request:complete': { url: string; duration: number; success: boolean };
  'cache:hit': { key: string };
  'cache:miss': { key: string };
  'cache:set': { key: string; ttlMs?: number };
  'proxy:rotate': { proxy: string; reason: string };
  'proxy:error': { proxy: string; error: Error };
  'proxy:disabled': { proxy: string; reason: string };
  'crawl:discover': { url: string; depth: number; parentUrl?: string };
  'crawl:complete': { totalUrls: number; successful: number; failed: number; duration: number };
}

export type EventEmitter = Emittery<WebScrapeEvents>;

export function createEventEmitter(): EventEmitter {
  return new Emittery<WebScrapeEvents>();
}

export const globalEmitter = createEventEmitter();
