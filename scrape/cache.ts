import { LRUCache } from 'lru-cache';

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

const DEFAULT_CONFIG: Required<CacheConfig> = {
  maxSize: 1000,
  defaultTtlMs: 5 * 60 * 1000,
  checkPeriodMs: 60 * 1000,
};

export class WebScrapeCache {
  private store: LRUCache<string, CacheEntry>;

  constructor(config: Partial<CacheConfig> = {}) {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    this.store = new LRUCache<string, CacheEntry>({
      max: cfg.maxSize,
      ttl: cfg.defaultTtlMs,
      updateAgeOnGet: true,
    });
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expires && Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T = unknown>(key: string, value: T, ttlMs?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      expires: ttlMs ? Date.now() + ttlMs : undefined,
    };
    this.store.set(key, entry, { ttl: ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getOrSet<T = unknown>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return Promise.resolve(cached);
    return factory().then(value => {
      this.set(key, value, ttlMs);
      return value;
    });
  }

  size(): number {
    return this.store.size;
  }

  keys(): string[] {
    return [...this.store.keys()];
  }
}

export function createCache(config?: Partial<CacheConfig>): WebScrapeCache {
  return new WebScrapeCache(config);
}
