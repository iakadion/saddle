import { WebScrapeError, ErrorCode } from './errors.js';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export interface SitemapResult {
  urls: SitemapUrl[];
  sitemaps: string[];
  duration: number;
}

function parseSitemapXml(xml: string): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const urlMatches = xml.match(/<url[^>]*>([\s\S]*?)<\/url>/gi) || [];

  for (const urlBlock of urlMatches) {
    const loc = urlBlock.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim();
    if (!loc) continue;

    const lastmod = urlBlock.match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim();
    const changefreq = urlBlock.match(/<changefreq>([\s\S]*?)<\/changefreq>/i)?.[1]?.trim();
    const priorityStr = urlBlock.match(/<priority>([\s\S]*?)<\/priority>/i)?.[1]?.trim();
    const priority = priorityStr ? parseFloat(priorityStr) : undefined;

    urls.push({ loc, lastmod, changefreq, priority });
  }

  return urls;
}

function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const sitemapMatches = xml.match(/<sitemap[^>]*>[\s\S]*?<loc>([\s\S]*?)<\/loc>[\s\S]*?<\/sitemap>/gi) || [];
  for (const match of sitemapMatches) {
    const loc = match.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim();
    if (loc) urls.push(loc);
  }
  return urls;
}

export async function fetchSitemap(url: string, options: { timeout?: number; headers?: Record<string, string>; fetcher?: typeof fetch } = {}): Promise<SitemapResult> {
  const startTime = Date.now();
  const fetcher = options.fetcher ?? fetch;

  try {
    const response = await fetcher(url, {
      headers: {
        'User-Agent': 'DevThink-WebScrape/2.0 (sitemap parser)',
        ...options.headers,
      },
      signal: AbortSignal.timeout(options.timeout || 10000),
    });

    if (!response.ok) {
      throw new WebScrapeError(`Failed to fetch sitemap: ${response.status}`, ErrorCode.NETWORK_ERROR, response.status, false, { url });
    }

    const text = await response.text();
    const isIndex = text.includes('<sitemapindex');
    const urls = isIndex ? [] : parseSitemapXml(text);
    const sitemaps = isIndex ? extractSitemapUrls(text) : [];

    return {
      urls,
      sitemaps,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    if (error instanceof WebScrapeError) throw error;
    throw new WebScrapeError(`Failed to parse sitemap: ${(error as Error).message}`, ErrorCode.PARSE_ERROR, 422, false, { url }, error as Error);
  }
}

export async function discoverSitemaps(siteUrl: string): Promise<string[]> {
  const candidates = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-index.xml',
    '/sitemaps.xml',
    '/robots.txt',
  ];

  const found: string[] = [];
  const base = siteUrl.replace(/\/$/, '');

  for (const path of candidates) {
    try {
      const url = path === '/robots.txt' ? `${base}/robots.txt` : `${base}${path}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'DevThink-WebScrape/2.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const text = await response.text();
        if (path === '/robots.txt') {
          const sitemapUrls = text.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
          if (sitemapUrls) {
            for (const s of sitemapUrls) {
              found.push(s.replace(/Sitemap:\s*/i, '').trim());
            }
          }
        } else {
          found.push(url);
        }
      }
    } catch {}
  }

  return [...new Set(found)];
}

export async function parseSitemap(url: string, options: { timeout?: number; headers?: Record<string, string>; fetcher?: typeof fetch; followIndexes?: boolean; maxUrls?: number; maxDepth?: number } = {}): Promise<SitemapUrl[]> {
  const maxUrls = Math.max(0, Number(options.maxUrls ?? 10000));
  const maxDepth = Math.max(0, Number(options.maxDepth ?? 8));
  const allUrls: SitemapUrl[] = [];
  const seenSitemaps = new Set<string>();
  const seenUrls = new Set<string>();

  async function visit(current: string, depth: number) {
    const identity = sitemapidentity(current);
    if (seenSitemaps.has(identity) || depth > maxDepth || allUrls.length >= maxUrls) return;
    seenSitemaps.add(identity);
    const result = await fetchSitemap(current, options);
    for (const item of result.urls) {
      const itemidentity = sitemapidentity(item.loc);
      if (!seenUrls.has(itemidentity)) {
        seenUrls.add(itemidentity);
        allUrls.push(item);
        if (allUrls.length >= maxUrls) return;
      }
    }
    if (options.followIndexes === false || depth >= maxDepth) return;
    for (const child of result.sitemaps) {
      if (allUrls.length >= maxUrls) return;
      await visit(child, depth + 1);
    }
  }

  await visit(url, 0);
  return allUrls;
}

function sitemapidentity(value: string) { try { const parsed = new URL(value); parsed.hash = ""; return parsed.href; } catch { return String(value).trim(); } }
