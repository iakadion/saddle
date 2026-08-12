import type { ScrapeFormat, SerializeTarget, SerializeOptions, ScrapeResult } from './types.js';
import { serializeResult as sr } from './serialize.js';

const FORMAT_ALIASES: Record<string, ScrapeFormat> = {
  md: 'markdown',
  txt: 'text',
  plain: 'text',
  xml: 'xml',
  json: 'json',
  redis: 'redis',
  html: 'html',
  h: 'html',
};

const FORMAT_EXTENSIONS: Record<string, ScrapeFormat> = {
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.html': 'html',
  '.htm': 'html',
  '.txt': 'text',
  '.json': 'json',
  '.xml': 'xml',
  '.redis': 'redis',
};

export function resolveFormat(format: string): ScrapeFormat {
  const lower = format.toLowerCase().trim();
  return FORMAT_ALIASES[lower] || (lower as ScrapeFormat);
}

export function formatFromExtension(ext: string): ScrapeFormat | null {
  return FORMAT_EXTENSIONS[ext.toLowerCase()] ?? null;
}

export function extensionForFormat(format: ScrapeFormat): string {
  const map: Record<ScrapeFormat, string> = {
    markdown: '.md',
    html: '.html',
    text: '.txt',
    json: '.json',
    xml: '.xml',
    redis: '.redis',
  };
  return map[format] || '.md';
}

export function detectContentType(html: string): 'article' | 'list' | 'page' | 'other' {
  if (html.includes('<article') || html.includes('entry-content') || html.includes('class="post-content"') || html.includes('class="article-content"') || html.includes('role="main"')) {
    return 'article';
  }
  const listCount = (html.match(/<li>/gi) || []).length;
  if (listCount > 20) return 'list';
  if (html.includes('<article') || html.includes('entry-content')) return 'article';
  return 'page';
}

export function buildSerializeOptions(format: ScrapeFormat, pretty = true): SerializeOptions {
  const targetMap: Record<ScrapeFormat, SerializeTarget> = {
    markdown: 'markdown',
    html: 'markdown',
    text: 'text',
    json: 'json',
    xml: 'xml',
    redis: 'redis',
  };
  return {
    format: targetMap[format] || 'markdown',
    pretty,
    includeMetadata: true,
  };
}

export async function convertResult(result: ScrapeResult, targetFormat: ScrapeFormat): Promise<ScrapeResult> {
  if (result.format === targetFormat) return result;

  const opts = buildSerializeOptions(targetFormat);
  const serialized = sr(result, opts);

  return {
    ...result,
    content: serialized.content,
    format: targetFormat,
    size: serialized.size,
  };
}
