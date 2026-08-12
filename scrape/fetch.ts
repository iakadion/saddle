import * as cheerio from 'cheerio';
import type { ScrapeOptions } from './types.js';
import { getHeaders, getRandomProfile } from './headers.js';
import { WebScrapeError, ErrorCode } from './errors.js';

export interface FetchResult {
  html: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  duration: number;
}

export async function fetchHtml(url: string, options: {
  timeout?: number;
  headers?: Record<string, string>;
  userAgent?: string;
  proxy?: string;
  signal?: AbortSignal;
} = {}): Promise<FetchResult> {
  const startTime = Date.now();
  const profile = getRandomProfile();
  const baseHeaders = getHeaders(profile);
  const headers = { ...baseHeaders, ...options.headers };
  if (options.userAgent) headers['User-Agent'] = options.userAgent;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
  const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new WebScrapeError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status === 403 ? ErrorCode.BLOCKED :
        response.status === 429 ? ErrorCode.RATE_LIMITED :
        response.status >= 500 ? ErrorCode.NETWORK_ERROR :
        ErrorCode.NETWORK_ERROR,
        response.status,
        [408, 429, 500, 502, 503, 504].includes(response.status),
        { url, status: response.status }
      );
    }

    const html = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => { responseHeaders[key] = value; });

    return {
      html,
      url: response.url || url,
      status: response.status,
      headers: responseHeaders,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof WebScrapeError) throw error;
    if ((error as Error).name === 'AbortError') {
      throw new WebScrapeError(
        `Request timeout after ${options.timeout || 30000}ms`,
        ErrorCode.TIMEOUT,
        504,
        true,
        { url, timeout: options.timeout || 30000 }
      );
    }
    throw new WebScrapeError(
      `Network error: ${(error as Error).message}`,
      ErrorCode.NETWORK_ERROR,
      503,
      true,
      { url },
      error as Error
    );
  }
}

export async function fetchAndParse(url: string, options: Partial<ScrapeOptions> = {}): Promise<FetchResult> {
  return fetchHtml(url, {
    timeout: options.timeout,
    headers: options.headers,
    userAgent: options.userAgent,
    proxy: options.proxy,
  });
}

export function detectRenderingMode(html: string): 'static' | 'spa' | 'hydrated' {
  if (/<div id=["'](?:root|app|__next|__nuxt)["']>\s*<\/div>/.test(html)) return 'spa';
  if (html.includes('__NEXT_DATA__') || html.includes('__NUXT__') || html.includes('__VUE_SSR_DATA__')) return 'hydrated';
  const $ = cheerio.load(html);
  if ($('script[type="application/ld+json"]').length > 0) return 'static';
  const textContent = $.text().replace(/\s+/g, ' ').trim();
  if (textContent.length > 500) return 'static';
  return 'spa';
}
