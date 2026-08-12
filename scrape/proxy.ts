import type { ProxyConfig } from './types.js';

interface ProxyStats {
  failures: number;
  successes: number;
  consecutiveFailures: number;
  lastFailure?: number;
  lastSuccess?: number;
  disabled: boolean;
  disabledAt?: number;
}

export type ProxyRotationStrategy = 'round-robin' | 'random';

export interface ProxyPoolConfig {
  maxFailures?: number;
  reviveAfterMs?: number;
  strategy?: ProxyRotationStrategy;
}

const DEFAULT_POOL_CONFIG: Required<ProxyPoolConfig> = {
  maxFailures: 3,
  reviveAfterMs: 30 * 60 * 1000,
  strategy: 'round-robin',
};

export class ProxyPool {
  private proxies: ProxyConfig[];
  private stats = new Map<string, ProxyStats>();
  private currentIndex = 0;
  private config: Required<ProxyPoolConfig>;

  constructor(proxies: ProxyConfig[], config: Partial<ProxyPoolConfig> = {}) {
    this.proxies = proxies;
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
    for (const p of proxies) {
      this.stats.set(p.url, { failures: 0, successes: 0, consecutiveFailures: 0, disabled: false });
    }
  }

  private getActiveProxies(): ProxyConfig[] {
    const now = Date.now();
    return this.proxies.filter(p => {
      const s = this.stats.get(p.url);
      if (!s) return true;
      if (s.disabled && s.disabledAt && (now - s.disabledAt) >= this.config.reviveAfterMs) {
        s.disabled = false;
        s.failures = 0;
        s.consecutiveFailures = 0;
        return true;
      }
      return !s.disabled;
    });
  }

  next(): ProxyConfig | null {
    const active = this.getActiveProxies();
    if (active.length === 0) return null;

    if (this.config.strategy === 'random') {
      return active[Math.floor(Math.random() * active.length)];
    }

    const proxy = active[this.currentIndex % active.length];
    this.currentIndex = (this.currentIndex + 1) % active.length;
    return proxy;
  }

  reportSuccess(proxy: ProxyConfig): void {
    const s = this.stats.get(proxy.url);
    if (s) {
      s.successes++;
      s.consecutiveFailures = 0;
      s.lastSuccess = Date.now();
    }
  }

  reportFailure(proxy: ProxyConfig): void {
    const s = this.stats.get(proxy.url);
    if (s) {
      s.failures++;
      s.consecutiveFailures++;
      s.lastFailure = Date.now();
      if (s.consecutiveFailures >= this.config.maxFailures) {
        s.disabled = true;
        s.disabledAt = Date.now();
      }
    }
  }

  getStatus(): { total: number; active: number; disabled: number } {
    const active = this.getActiveProxies();
    return {
      total: this.proxies.length,
      active: active.length,
      disabled: this.proxies.length - active.length,
    };
  }
}

export function createProxyPool(proxies: ProxyConfig[], config?: Partial<ProxyPoolConfig>): ProxyPool {
  return new ProxyPool(proxies, config);
}
