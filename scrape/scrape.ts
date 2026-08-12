import { AgentBrowser } from './browser.js';
import { extractContent } from './extract.js';
import { fetchHtml, detectRenderingMode } from './fetch.js';
import type { ScrapeOptions, ScrapeResult } from './types.js';
import { WebScrapeError, ErrorCode } from './errors.js';

export async function scrapeUrl(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
  if (!url || !url.startsWith('http')) {
    throw new WebScrapeError(`Invalid URL: ${url}`, ErrorCode.VALIDATION_FAILED, 400, false);
  }

  const startTime = Date.now();
  const mode = options.mode || 'auto';

  if (mode === 'fetch' || mode === 'auto') {
    try {
      const fetchResult = await fetchHtml(url, {
        timeout: options.timeout,
        headers: options.headers,
        userAgent: options.userAgent,
      });

      if (mode === 'auto') {
        const renderMode = detectRenderingMode(fetchResult.html);
        if (renderMode === 'static') {
          return buildResult(fetchResult.html, fetchResult.url, options, startTime);
        }
      } else {
        return buildResult(fetchResult.html, fetchResult.url, options, startTime);
      }
    } catch (error) {
      if (mode === 'fetch') throw error;
      if (!(error instanceof WebScrapeError) || error.isRetryable) {
        // Fall through to browser mode
      } else {
        throw error;
      }
    }
  }

  const browser = new AgentBrowser({
    headless: true,
    timeout: options.timeout ?? 30000,
    proxy: options.proxy ?? '',
    userAgent: options.userAgent,
  });

  try {
    await browser.launch();
    await browser.navigate(url, (options.waitUntil as 'load' | 'domcontentloaded' | 'networkidle') ?? 'networkidle');

    if (options.scroll) {
      await browser.scrollToBottom(800, options.scrollDelay ?? 300, options.maxScrolls ?? 50);
    }

    const html = await browser.html();
    const pageTitle = await browser.title();
    const pageUrl = await browser.url();

    return buildResult(html, pageUrl, options, startTime, pageTitle);
  } finally {
    await browser.close();
  }
}

export async function scrapeHtml(html: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
  const startTime = Date.now();
  return buildResult(html, 'about:blank', options, startTime);
}

export async function scrapeWithBrowser(
  browser: AgentBrowser,
  url: string,
  options: ScrapeOptions = {}
): Promise<ScrapeResult> {
  const startTime = Date.now();

  await browser.navigate(url, (options.waitUntil as 'load' | 'domcontentloaded' | 'networkidle') ?? 'networkidle');

  if (options.scroll) {
    await browser.scrollToBottom(800, options.scrollDelay ?? 300, options.maxScrolls ?? 50);
  }

  const html = await browser.html();
  const pageTitle = await browser.title();
  const pageUrl = await browser.url();

  return buildResult(html, pageUrl, options, startTime, pageTitle);
}

async function buildResult(
  html: string,
  url: string,
  options: ScrapeOptions,
  startTime: number,
  title?: string,
): Promise<ScrapeResult> {
  const extracted = await extractContent(html, {
    readable: true,
    preserveLinks: options.extractLinks ?? true,
    preserveImages: options.extractImages ?? true,
    preserveTables: options.extractTables ?? true,
    maxLength: options.maxContentLength,
    removeSelectors: options.removeSelectors,
  });

  const duration = Date.now() - startTime;

  return {
    url,
    title: title || extracted.metadata.title || '',
    content: extracted.content,
    format: options.format ?? 'markdown',
    text: extracted.text,
    links: extracted.links,
    images: extracted.images,
    tables: extracted.tables,
    metadata: extracted.metadata,
    extractedAt: new Date().toISOString(),
    duration,
    size: extracted.content.length + extracted.text.length,
  };
}
