import type { ScrapeOptions, ScrapeResult, CrawlStats } from './types.js';
import { scrapeUrl } from './scrape.js';

export interface CrawlOptions extends ScrapeOptions {
  maxDepth?: number;
  maxPages?: number;
  maxConcurrent?: number;
  sameDomain?: boolean;
  delayMs?: number;
  onDiscover?: (url: string, depth: number) => void;
  onResult?: (result: ScrapeResult) => void;
  onError?: (url: string, error: Error) => void;
}

interface CrawlEntry {
  url: string;
  depth: number;
}

function isSameDomain(url1: string, url2: string): boolean {
  try {
    return new URL(url1).hostname === new URL(url2).hostname;
  } catch {
    return false;
  }
}

function normalizeForDedup(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    return u.href.replace(/\/+$/, '') || u.href;
  } catch {
    return url;
  }
}

export async function crawl(
  startUrl: string,
  options: CrawlOptions = {}
): Promise<{ results: ScrapeResult[]; stats: CrawlStats }> {
  const {
    maxDepth = 2,
    maxPages = 50,
    maxConcurrent = 3,
    sameDomain = true,
    delayMs = 1000,
    onDiscover,
    onResult,
    onError,
    ...scrapeOpts
  } = options;

  const startTime = Date.now();
  const visited = new Set<string>();
  const queue: CrawlEntry[] = [{ url: startUrl, depth: 0 }];
  const results: ScrapeResult[] = [];
  let failed = 0;

  visited.add(normalizeForDedup(startUrl));

  while (queue.length > 0 && results.length < maxPages) {
    const batch = queue.splice(0, maxConcurrent);
    const promises = batch.map(async (entry) => {
      if (entry.depth > maxDepth) return;

      try {
        const result = await scrapeUrl(entry.url, scrapeOpts);
        results.push(result);
        onResult?.(result);

        // Extract links for further crawling
        if (entry.depth < maxDepth) {
          for (const link of result.links) {
            const normalized = normalizeForDedup(link.href);
            if (visited.has(normalized)) continue;
            if (sameDomain && !isSameDomain(startUrl, link.href)) continue;
            try {
              new URL(link.href);
            } catch {
              continue;
            }
            visited.add(normalized);
            queue.push({ url: link.href, depth: entry.depth + 1 });
            onDiscover?.(link.href, entry.depth + 1);
          }
        }
      } catch (error) {
        failed++;
        onError?.(entry.url, error as Error);
      }
    });

    await Promise.all(promises);

    if (delayMs > 0 && queue.length > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  const duration = Date.now() - startTime;

  return {
    results,
    stats: {
      totalUrls: visited.size,
      successful: results.length,
      failed,
      skipped: visited.size - results.length - failed,
      duration,
      avgResponseTime: results.length > 0 ? results.reduce((sum, r) => sum + r.duration, 0) / results.length : 0,
    },
  };
}
