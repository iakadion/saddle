import { AgentBrowser } from './browser.js';
import type { BrowserAgentConfig } from './types.js';

export interface PoolConfig {
  maxSize?: number;
  acquireTimeoutMs?: number;
}

interface PoolEntry {
  browser: AgentBrowser;
  inUse: boolean;
  createdAt: number;
}

export class BrowserPool {
  private pool: PoolEntry[] = [];
  private waitQueue: Array<(browser: AgentBrowser) => void> = [];
  private config: Required<PoolConfig>;
  private browserConfig: BrowserAgentConfig;

  constructor(config: PoolConfig = {}, browserConfig: BrowserAgentConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 3,
      acquireTimeoutMs: config.acquireTimeoutMs || 30000,
    };
    this.browserConfig = browserConfig;
  }

  async acquire(): Promise<AgentBrowser> {
    const idle = this.pool.find(e => !e.inUse && e.browser.isConnected());
    if (idle) {
      idle.inUse = true;
      return idle.browser;
    }

    if (this.pool.length < this.config.maxSize) {
      const browser = new AgentBrowser(this.browserConfig);
      await browser.launch();
      const entry: PoolEntry = { browser, inUse: true, createdAt: Date.now() };
      this.pool.push(entry);
      return browser;
    }

    return new Promise<AgentBrowser>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const idx = this.waitQueue.indexOf(waiter);
        if (idx !== -1) this.waitQueue.splice(idx, 1);
        reject(new Error('Timeout waiting for browser'));
      }, this.config.acquireTimeoutMs);

      const waiter = (browser: AgentBrowser) => {
        clearTimeout(timeout);
        resolve(browser);
      };
      this.waitQueue.push(waiter);
    });
  }

  release(browser: AgentBrowser): void {
    const entry = this.pool.find(e => e.browser === browser);
    if (entry) {
      entry.inUse = false;

      if (this.waitQueue.length > 0) {
        const waiter = this.waitQueue.shift()!;
        entry.inUse = true;
        waiter(browser);
      }
    }
  }

  async destroy(): Promise<void> {
    for (const entry of this.pool) {
      await entry.browser.close().catch(() => {});
    }
    this.pool = [];
    for (const waiter of this.waitQueue) {
      waiter(new AgentBrowser());
    }
    this.waitQueue = [];
  }

  getStatus(): { total: number; idle: number; inUse: number; waiting: number } {
    return {
      total: this.pool.length,
      idle: this.pool.filter(e => !e.inUse).length,
      inUse: this.pool.filter(e => e.inUse).length,
      waiting: this.waitQueue.length,
    };
  }
}

export function createPool(config?: PoolConfig, browserConfig?: BrowserAgentConfig): BrowserPool {
  return new BrowserPool(config, browserConfig);
}
