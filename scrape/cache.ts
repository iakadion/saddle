/**
 * scrape cache context groups the active stale-aware fetch cache and the
 * historical typed cache facade without requiring an external LRU package.
 */

export interface CacheEntry<T = unknown> {
  value: T;
  timestamp: number;
  expires?: number;
}

export interface CacheConfig {
  maxSize?: number;
  defaultTtlMs?: number;
  checkPeriodMs?: number;
}

interface StaleEntry<T = unknown> extends CacheEntry<T> {
  stale: number;
}

const defaultconfig: Required<CacheConfig> = { maxSize: 1000, defaultTtlMs: 300000, checkPeriodMs: 60000 };

/** Provides a bounded typed cache facade for historical scrape callers. */
export class WebScrapeCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly config: Required<CacheConfig>;

  constructor(config: Partial<CacheConfig> = {}) { this.config = { ...defaultconfig, ...config }; }

  get<T = unknown>(key: string): T | undefined { const entry = this.store.get(key); if (!entry) return undefined; if (entry.expires && Date.now() > entry.expires) { this.store.delete(key); return undefined; } return entry.value as T; }

  set<T = unknown>(key: string, value: T, ttlMs?: number): void { if (this.store.size >= this.config.maxSize && !this.store.has(key)) this.store.delete(this.store.keys().next().value as string); this.store.set(key, { value, timestamp: Date.now(), expires: ttlMs ? Date.now() + ttlMs : Date.now() + this.config.defaultTtlMs }); }

  has(key: string): boolean { return this.get(key) !== undefined; }
  delete(key: string): boolean { return this.store.delete(key); }
  clear(): void { this.store.clear(); }
  getOrSet<T = unknown>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> { const cached = this.get<T>(key); if (cached !== undefined) return Promise.resolve(cached); return factory().then((value) => { this.set(key, value, ttlMs); return value; }); }
  size(): number { return this.store.size; }
  keys(): string[] { return [...this.store.keys()]; }
}

/** Creates the historical typed cache facade. */
export function createCache(config?: Partial<CacheConfig>): WebScrapeCache { return new WebScrapeCache(config); }

/** Creates the active stale-aware fetch cache contract. */
export function ttlcache<T = unknown>(options: { ttl?: number; stale?: boolean } = {}) {
  const values = new Map<string, StaleEntry<T>>();
  const ttl = options.ttl ?? 300000;
  return {
    get(key: string): T | null { const item = values.get(key); if (!item) return null; const now = Date.now(); if (now > item.expires) { if (now > item.stale) values.delete(key); return options.stale ? item.value : null; } return item.value; },
    set(key: string, value: T, valueoptions: { ttl?: number; stale?: number } = {}): T { const now = Date.now(); values.set(key, { value, timestamp: now, expires: now + (valueoptions.ttl ?? ttl), stale: now + (valueoptions.stale ?? ttl * 2) }); return value; },
    delete(key: string): void { values.delete(key); },
    clear(): void { values.clear(); },
    size(): number { return values.size; }
  };
}
