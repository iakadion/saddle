import pLimit from 'p-limit';
import type { ScrapeOptions, ScrapeResult, BatchOptions } from './types.js';
import { scrapeUrl } from './scrape.js';

export interface BatchResult {
  results: ScrapeResult[];
  errors: { url: string; error: Error }[];
  successful: number;
  failed: number;
  duration: number;
}

export async function batchScrape(options: BatchOptions, scrapeOpts: ScrapeOptions = {}): Promise<BatchResult> {
  const startTime = Date.now();
  const limit = pLimit(options.concurrency || 5);
  const results: ScrapeResult[] = [];
  const errors: { url: string; error: Error }[] = [];

  const tasks = options.urls.map((url) =>
    limit(async () => {
      try {
        const result = await scrapeUrl(url, { ...scrapeOpts, mode: scrapeOpts.mode || 'auto' });
        results.push(result);
        options.onProgress?.(results.length + errors.length, options.urls.length, url);
      } catch (error) {
        errors.push({ url, error: error as Error });
        options.onError?.(url, error as Error);
        options.onProgress?.(results.length + errors.length, options.urls.length, url);
      }
    })
  );

  await Promise.allSettled(tasks);

  return {
    results,
    errors,
    successful: results.length,
    failed: errors.length,
    duration: Date.now() - startTime,
  };
}

export async function batchScrapeSequential(
  urls: string[],
  options: ScrapeOptions = {},
  callbacks?: {
    onResult?: (result: ScrapeResult, index: number) => void;
    onError?: (url: string, error: Error, index: number) => void;
    delayMs?: number;
  }
): Promise<BatchResult> {
  const startTime = Date.now();
  const results: ScrapeResult[] = [];
  const errors: { url: string; error: Error }[] = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const result = await scrapeUrl(urls[i], options);
      results.push(result);
      callbacks?.onResult?.(result, i);
    } catch (error) {
      errors.push({ url: urls[i], error: error as Error });
      callbacks?.onError?.(urls[i], error as Error, i);
    }

    if (callbacks?.delayMs && i < urls.length - 1) {
      await new Promise(r => setTimeout(r, callbacks.delayMs));
    }
  }

  return {
    results,
    errors,
    successful: results.length,
    failed: errors.length,
    duration: Date.now() - startTime,
  };
}
