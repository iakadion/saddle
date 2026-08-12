import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function ensureDir(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function writeOutput(path: string, content: string): void {
  ensureDir(path);
  writeFileSync(path, content, 'utf-8');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, max: number, suffix = '...'): string {
  if (text.length <= max) return text;
  return text.slice(0, max - suffix.length) + suffix;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = i + chunkSize;
    if (end < text.length) {
      const breakIdx = text.lastIndexOf('\n', end);
      if (breakIdx > i) end = breakIdx + 1;
    }
    chunks.push(text.slice(i, end).trim());
    i = end;
  }
  return chunks;
}

export function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string, base?: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

export function isInternalUrl(href: string, base: string): boolean {
  try {
    const baseUrl = new URL(base);
    const target = new URL(href, base);
    return target.hostname === baseUrl.hostname;
  } catch {
    return false;
  }
}
