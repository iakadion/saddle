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

export async function fetchSitemap(url: string, options: { timeout?: number; headers?: Record<string, string> } = {}): Promise<SitemapResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
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

export async function parseSitemap(url: string, options: { timeout?: number; followIndexes?: boolean; maxUrls?: number } = {}): Promise<SitemapUrl[]> {
  const { followIndexes = true, maxUrls = 10000 } = options;
  const result = await fetchSitemap(url, options);
  let allUrls = [...result.urls];

  if (followIndexes && result.sitemaps.length > 0) {
    for (const sitemapUrl of result.sitemaps) {
      if (allUrls.length >= maxUrls) break;
      try {
        const subResult = await fetchSitemap(sitemapUrl, options);
        allUrls.push(...subResult.urls);
      } catch {}
    }
  }

  return allUrls.slice(0, maxUrls);
}
