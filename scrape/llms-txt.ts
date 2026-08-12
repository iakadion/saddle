import type { ScrapeResult } from './types.js';

export interface LlmsTxtOptions {
  siteName?: string;
  description?: string;
  includeOptional?: boolean;
}

export function generateLlmsTxt(
  results: ScrapeResult[],
  options: LlmsTxtOptions = {}
): string {
  const siteName = options.siteName || results[0]?.metadata?.title || 'Site';
  const description = options.description || results[0]?.metadata?.description || '';

  const lines: string[] = [];
  lines.push(`# ${siteName}`);
  lines.push('');
  if (description) {
    lines.push(`> ${description}`);
    lines.push('');
  }

  const pages: ScrapeResult[] = [];
  const docs: ScrapeResult[] = [];

  for (const result of results) {
    const url = result.url.toLowerCase();
    if (url.includes('doc') || url.includes('guide') || url.includes('api')) {
      docs.push(result);
    } else {
      pages.push(result);
    }
  }

  if (pages.length > 0) {
    lines.push('## Pages');
    lines.push('');
    for (const page of pages.slice(0, 20)) {
      const title = page.metadata.title || page.title;
      const desc = page.metadata.description || '';
      lines.push(`- ${title}: ${desc || page.url}`);
    }
    lines.push('');
  }

  if (docs.length > 0) {
    lines.push('## Documentation');
    lines.push('');
    for (const doc of docs.slice(0, 20)) {
      const title = doc.metadata.title || doc.title;
      const desc = doc.metadata.description || '';
      lines.push(`- ${title}: ${desc || doc.url}`);
    }
    lines.push('');
  }

  if (options.includeOptional && results.length > 5) {
    lines.push('## Optional');
    lines.push('');
    lines.push(`- Full content: ${results.length} pages scraped`);
    lines.push(`- Last updated: ${new Date().toISOString().split('T')[0]}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function generateLlmsFullTxt(results: ScrapeResult[]): string {
  const parts: string[] = [];

  for (const result of results) {
    parts.push(`# ${result.title || result.metadata.title || 'Untitled'}`);
    parts.push('');
    parts.push(`Source: ${result.url}`);
    parts.push('');
    parts.push(result.content);
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  return parts.join('\n');
}
