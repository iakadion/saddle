import { z } from 'zod';

export const ScrapeFormatSchema = z.enum(['markdown', 'html', 'text', 'json', 'xml', 'redis']);
export type ScrapeFormat = z.infer<typeof ScrapeFormatSchema>;

export const SerializeTargetSchema = z.enum(['markdown', 'xml', 'json', 'redis', 'text']);
export type SerializeTarget = z.infer<typeof SerializeTargetSchema>;

export const ScrapeOptionsSchema = z.strictObject({
  url: z.string().url().optional(),
  html: z.string().optional(),
  mode: z.enum(['auto', 'fetch', 'browser']).prefault('auto').optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle', 'commit']).prefault('networkidle').optional(),
  timeout: z.number().positive().prefault(30000).optional(),
  scroll: z.boolean().prefault(false).optional(),
  scrollDelay: z.number().nonnegative().prefault(300).optional(),
  maxScrolls: z.number().positive().prefault(50).optional(),
  removeSelectors: z.array(z.string()).prefault([]).optional(),
  extractImages: z.boolean().prefault(true).optional(),
  extractLinks: z.boolean().prefault(true).optional(),
  extractTables: z.boolean().prefault(true).optional(),
  maxContentLength: z.number().positive().optional(),
  format: ScrapeFormatSchema.prefault('markdown').optional(),
  language: z.string().optional(),
  proxy: z.string().optional(),
  retries: z.number().nonnegative().prefault(3).optional(),
  retryDelay: z.number().positive().prefault(1000).optional(),
  userAgent: z.string().optional(),
  headers: z.record(z.string(), z.string()).prefault({}).optional(),
  cache: z.boolean().prefault(false).optional(),
  cacheTtlMs: z.number().positive().prefault(300000).optional(),
  readable: z.boolean().optional(),
});
export type ScrapeOptions = z.infer<typeof ScrapeOptionsSchema>;

export interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  format: ScrapeFormat;
  text: string;
  links: LinkInfo[];
  images: ImageInfo[];
  tables: TableInfo[];
  metadata: PageMetadata;
  extractedAt: string;
  duration: number;
  size: number;
}

export interface PageMetadata {
  title: string;
  description?: string;
  favicon?: string;
  charset?: string;
  language?: string;
  author?: string;
  publishedDate?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
}

export interface LinkInfo {
  href: string;
  text: string;
  isInternal: boolean;
  isExternal: boolean;
}

export interface ImageInfo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface TableInfo {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export const BrowserAgentConfigSchema = z.strictObject({
  headless: z.boolean().prefault(true).optional(),
  userAgent: z.string().optional(),
  viewport: z
    .strictObject({
      width: z.number().positive().prefault(1280),
      height: z.number().positive().prefault(720),
    })
    .prefault({ width: 1280, height: 720 })
    .optional(),
  locale: z.string().prefault('en-US').optional(),
  geolocation: z
    .strictObject({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  timeout: z.number().positive().prefault(30000).optional(),
  recordVideo: z.boolean().prefault(false).optional(),
  proxy: z.string().prefault('').optional(),
  storageState: z.string().prefault('').optional(),
  blockAds: z.boolean().prefault(true).optional(),
  stealth: z.boolean().prefault(true).optional(),
});
export type BrowserAgentConfig = z.infer<typeof BrowserAgentConfigSchema>;

export interface ExtractOptions {
  readable?: boolean;
  stripTags?: string[];
  preserveLinks?: boolean;
  preserveImages?: boolean;
  preserveTables?: boolean;
  maxLength?: number;
  removeSelectors?: string[];
  baseUrl?: string;
}

export interface SerializeOptions {
  format: SerializeTarget;
  pretty?: boolean;
  maxChunkSize?: number;
  includeMetadata?: boolean;
  redisKey?: string;
  xmlRoot?: string;
}

export interface SerializedOutput {
  format: SerializeTarget;
  content: string;
  chunks?: string[];
  size: number;
  metadata?: Record<string, unknown>;
}

export interface AgentOutput {
  summary: string;
  content: string;
  keyPoints: string[];
  relevantUrls: string[];
  structured?: Record<string, unknown>;
  tokens: number;
}

export interface RenderOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
  output?: string;
}

export interface ChromeCommand {
  action: 'goto' | 'click' | 'type' | 'screenshot' | 'evaluate' | 'wait' | 'scroll' | 'extract';
  args?: Record<string, unknown>;
}

export interface CliOptions {
  url?: string;
  file?: string;
  format?: ScrapeFormat;
  output?: string;
  'no-headless'?: boolean;
  timeout?: number;
  scroll?: boolean;
  readable?: boolean;
  agent?: boolean;
  pretty?: boolean;
  proxy?: string;
  retries?: number;
  mode?: 'auto' | 'fetch' | 'browser';
}

export interface RetryConfig {
  retries: number;
  delay: number;
  backoff: 'exponential' | 'linear' | 'constant';
  maxDelay?: number;
  statusCodes?: number[];
}

export interface ProxyConfig {
  url: string;
  username?: string;
  password?: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttlMs?: number;
  maxEntries?: number;
  storage?: 'memory' | 'redis' | 'sqlite' | 'indexeddb';
}

export interface CrawlStats {
  totalUrls: number;
  successful: number;
  failed: number;
  skipped: number;
  duration: number;
  avgResponseTime: number;
}

export interface BatchOptions {
  urls: string[];
  concurrency?: number;
  mode?: 'auto' | 'fetch' | 'browser';
  format?: ScrapeFormat;
  onProgress?: (completed: number, total: number, currentUrl: string) => void;
  onError?: (url: string, error: Error) => void;
}
