import * as cheerio from 'cheerio';
import type { ExtractOptions, LinkInfo, ImageInfo, TableInfo, PageMetadata } from './types.js';
import { normalizeUrl, isInternalUrl } from './utils.js';

export interface ExtractedContent {
  content: string;
  text: string;
  links: LinkInfo[];
  images: ImageInfo[];
  tables: TableInfo[];
  metadata: PageMetadata;
  jsonLd: unknown[];
}

function extractReadableContent($: cheerio.CheerioAPI): string {
  const articleSelectors = [
    'article', '[role="main"]', 'main', '.post-content', '.article-content',
    '.entry-content', '.content', '#content', '.prose', '.markdown-body',
  ];
  for (const sel of articleSelectors) {
    const el = $(sel).first();
    if (el.length) return el.text().trim();
  }
  return $('body').text().trim();
}

function extractMetadata($: cheerio.CheerioAPI): PageMetadata {
  const getMeta = (name: string): string | undefined => {
    return $(`meta[name="${name}"], meta[property="${name}"]`).attr('content') || undefined;
  };
  return {
    title: $('title').text() || getMeta('og:title') || '',
    description: getMeta('description') || getMeta('og:description'),
    favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href'),
    charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content'),
    language: $('html').attr('lang') || undefined,
    author: getMeta('author'),
    publishedDate: getMeta('article:published_time') || getMeta('date'),
    ogImage: getMeta('og:image'),
    ogType: getMeta('og:type'),
    keywords: getMeta('keywords')?.split(',').map(k => k.trim()),
  };
}

function extractJsonLd($: cheerio.CheerioAPI): unknown[] {
  const results: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      if (data['@graph']) {
        results.push(...(Array.isArray(data['@graph']) ? data['@graph'] : [data['@graph']]));
      } else {
        results.push(data);
      }
    } catch {}
  });
  return results;
}

function extractLinks($: cheerio.CheerioAPI, baseUrl: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim().slice(0, 200);
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    const fullUrl = normalizeUrl(href, baseUrl);
    links.push({
      href: fullUrl,
      text: text || fullUrl,
      isInternal: isInternalUrl(fullUrl, baseUrl),
      isExternal: !isInternalUrl(fullUrl, baseUrl),
    });
  });
  return links;
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): ImageInfo[] {
  const images: ImageInfo[] = [];
  $('img[src]').each((_, el) => {
    const src = normalizeUrl($(el).attr('src') || '', baseUrl);
    const alt = $(el).attr('alt') || '';
    const width = parseInt($(el).attr('width') || '') || undefined;
    const height = parseInt($(el).attr('height') || '') || undefined;
    if (src) images.push({ src, alt: alt.slice(0, 200), width, height });
  });
  return images;
}

function extractTables($: cheerio.CheerioAPI): TableInfo[] {
  const tables: TableInfo[] = [];
  $('table').each((_, table) => {
    const headers: string[] = [];
    const rows: string[][] = [];
    $('thead tr th, thead tr td', table).each((_, th) => {
      headers.push($(th).text().trim());
    });
    $('tbody tr, > tr', table).each((_, tr) => {
      if ($(tr).parent().is('thead')) return;
      const row: string[] = [];
      $('td, th', tr).each((_, td) => {
        row.push($(td).text().trim());
      });
      if (row.length) rows.push(row);
    });
    const caption = $('caption', table).text().trim() || undefined;
    if (rows.length) tables.push({ headers, rows, caption });
  });
  return tables;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractContent(html: string, options: ExtractOptions = {}): Promise<ExtractedContent> {
  const $ = cheerio.load(html);
  const baseUrl = $('base').attr('href') || '';

  if (options.removeSelectors?.length) {
    for (const sel of options.removeSelectors) {
      $(sel).remove();
    }
  }

  const metadata = extractMetadata($);
  const jsonLd = extractJsonLd($);
  const links = options.preserveLinks !== false ? extractLinks($, baseUrl) : [];
  const images = options.preserveImages !== false ? extractImages($, baseUrl) : [];
  const tables = options.preserveTables !== false ? extractTables($) : [];

  const text = options.readable
    ? extractReadableContent($)
    : $('body').text().trim();

  const content = htmlToText(text);

  return {
    content: options.maxLength ? content.slice(0, options.maxLength) : content,
    text,
    links,
    images,
    tables,
    metadata,
    jsonLd,
  };
}

export async function extractReadable(html: string): Promise<string> {
  const result = await extractContent(html, { readable: true });
  return result.content;
}
