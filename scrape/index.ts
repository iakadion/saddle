// ─── Core Scraping ───
export { AgentBrowser, createBrowser } from './browser.js';
export { scrapeUrl, scrapeHtml, scrapeWithBrowser } from './scrape.js';
export { extractContent, extractReadable } from './extract.js';
export type { ExtractedContent } from './extract.js';
export { extractwithschema, extractstructured } from './schema.js';
export { fetchHtml, fetchAndParse, detectRenderingMode } from './fetch.js';
export type { FetchResult } from './fetch.js';

// ─── Serialization ───
export { serializeResult, serializeHtml } from './serialize.js';
export { resolveFormat, formatFromExtension, extensionForFormat, buildSerializeOptions, convertResult } from './formats.js';

// ─── Renderer ───
export { PygameRenderer, createRenderer } from './renderer.js';

// ─── AI/LLM ───
export { formatForAgent, buildContext } from './agent.js';
export { estimateTokens, countTokens, fitsInContext, truncateToTokens, tokenCost } from './tokens.js';
export type { ModelType } from './tokens.js';
export { chunkMarkdown, chunkText, formatChunksForRAG } from './chunking.js';
export type { Chunk, ChunkOptions } from './chunking.js';
export { generateLlmsTxt, generateLlmsFullTxt } from './llms-txt.js';
export type { LlmsTxtOptions } from './llms-txt.js';

// ─── Infrastructure ───
export { WebScrapeError, ValidationError, TimeoutError, BlockedError, RateLimitError, ProxyError, ParseError, AuthError, NetworkError, BrowserNotAvailableError } from './errors.js';
export type { ErrorCode } from './errors.js';
export { createEventEmitter, globalEmitter } from './events.js';
export type { WebScrapeEvents, EventEmitter } from './events.js';
export { withRetry, isRetryableError, AbortError } from './retry.js';
export { RateLimiter, createRateLimiter } from './rate-limiter.js';
export type { RateLimiterConfig } from './rate-limiter.js';
export { ProxyPool, createProxyPool } from './proxy.js';
export type { ProxyPoolConfig, ProxyRotationStrategy } from './proxy.js';
export { CookieJar, ScrapingSession, createSession } from './session.js';
export type { Cookie } from './session.js';
export { getRandomProfile, getHeaders, mergeHeaders } from './headers.js';
export type { HeaderProfile } from './headers.js';
export { WebScrapeCache, createCache } from './cache.js';
export type { CacheConfig, CacheEntry } from './cache.js';
export { MiddlewarePipeline, createPipeline, loggingMiddleware, timeoutMiddleware, retryMiddleware } from './middleware.js';
export type { Middleware, MiddlewareContext, MiddlewareNext } from './middleware.js';

// ─── Crawling ───
export { crawl } from './crawler.js';
export type { CrawlOptions } from './crawler.js';
export { fetchSitemap, discoverSitemaps, parseSitemap } from './sitemap.js';
export type { SitemapUrl, SitemapResult } from './sitemap.js';
export { fetchRobotsTxt, isAllowed, getCrawlDelay, getSitemaps } from './robots.js';
export type { RobotsTxt, RobotsDirective } from './robots.js';

// ─── Batch & Pool ───
export { batchScrape, batchScrapeSequential } from './batch.js';
export type { BatchResult } from './batch.js';
export { BrowserPool, createPool } from './pool.js';
export type { PoolConfig } from './pool.js';

// ─── Server ───
export { createServer, app } from './server.js';
export type { ServerConfig } from './server.js';

// ─── Utilities ───
export { ensureDir, writeOutput, slugify, truncate, chunkText as chunkTextUtil, delay, isValidUrl, normalizeUrl, isInternalUrl } from './utils.js';
export { randomPort, resetPort } from './utils/port.js';

// ─── Types ───
export {
  ScrapeOptionsSchema,
  BrowserAgentConfigSchema,
} from './types.js';
export type {
  ScrapeFormat,
  SerializeTarget,
  ScrapeOptions,
  ScrapeResult,
  PageMetadata,
  LinkInfo,
  ImageInfo,
  TableInfo,
  BrowserAgentConfig,
  ExtractOptions,
  SerializeOptions,
  SerializedOutput,
  AgentOutput,
  RenderOptions,
  ChromeCommand,
  CliOptions,
  RetryConfig,
  ProxyConfig,
  CrawlStats,
  BatchOptions,
} from './types.js';
