import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { scrapeUrl } from './scrape.js';
import { batchScrape } from './batch.js';
import { crawl } from './crawler.js';
import { formatForAgent } from './agent.js';
import { randomPort } from './utils/port.js';
import type { ScrapeOptions } from './types.js';

export interface ServerConfig {
  port?: number;
  host?: string;
  apiKey?: string;
}

const app = new Hono();

app.use('*', cors());

const api = new Hono();

api.post('/scrape', async (c) => {
  const body = await c.req.json();
  const { url, options = {} } = body;

  if (!url) {
    return c.json({ error: { code: 'MISSING_URL', message: 'URL is required' } }, 400);
  }

  try {
    const result = await scrapeUrl(url, options as ScrapeOptions);
    return c.json({ status: 'ok', data: result });
  } catch (error) {
    return c.json({
      error: {
        code: (error as any).code || 'SCRAPE_ERROR',
        message: (error as Error).message,
      }
    }, (error as any).statusCode || 500);
  }
});

api.post('/scrape/agent', async (c) => {
  const body = await c.req.json();
  const { url, options = {} } = body;

  if (!url) {
    return c.json({ error: { code: 'MISSING_URL', message: 'URL is required' } }, 400);
  }

  try {
    const result = await scrapeUrl(url, options as ScrapeOptions);
    const agentOutput = formatForAgent(result);
    return c.json({ status: 'ok', data: agentOutput });
  } catch (error) {
    return c.json({
      error: {
        code: (error as any).code || 'SCRAPE_ERROR',
        message: (error as Error).message,
      }
    }, (error as any).statusCode || 500);
  }
});

api.post('/batch', async (c) => {
  const body = await c.req.json();
  const { urls, options = {}, scrapeOptions = {} } = body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return c.json({ error: { code: 'MISSING_URLS', message: 'urls array is required' } }, 400);
  }

  try {
    const result = await batchScrape({ urls, ...options }, scrapeOptions as ScrapeOptions);
    return c.json({
      status: 'ok',
      data: {
        successful: result.successful,
        failed: result.failed,
        duration: result.duration,
        results: result.results,
        errors: result.errors.map(e => ({ url: e.url, error: e.error.message })),
      },
    });
  } catch (error) {
    return c.json({
      error: {
        code: 'BATCH_ERROR',
        message: (error as Error).message,
      }
    }, 500);
  }
});

api.post('/crawl', async (c) => {
  const body = await c.req.json();
  const { url, options = {} } = body;

  if (!url) {
    return c.json({ error: { code: 'MISSING_URL', message: 'URL is required' } }, 400);
  }

  try {
    const result = await crawl(url, options);
    return c.json({
      status: 'ok',
      data: {
        stats: result.stats,
        results: result.results.slice(0, 100),
      },
    });
  } catch (error) {
    return c.json({
      error: {
        code: 'CRAWL_ERROR',
        message: (error as Error).message,
      }
    }, 500);
  }
});

api.get('/health', (c) => {
  return c.json({ status: 'ok', version: '2.0.0', uptime: process.uptime() });
});

app.route('/v1', api);

export function createServer(config: ServerConfig = {}) {
  return {
    fetch: app.fetch,
    port: config.port || randomPort(),
    host: config.host || '0.0.0.0',
  };
}

export { app };
export default app;
