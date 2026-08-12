#!/usr/bin/env node
import { createServer } from 'node:http';

import { scrapeUrl } from './scrape.js';
import { serializeResult } from './serialize.js';
import { resolveFormat, buildSerializeOptions } from './formats.js';
import { formatForAgent } from './agent.js';
import { randomPort } from './utils/port.js';
import type { ScrapeOptions } from './types.js';

const PORT = randomPort();

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/scrape') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { url, format: fmt, options = {} }: {
        url: string;
        format?: string;
        options?: Record<string, unknown>;
      } = JSON.parse(body);
      if (!url) throw new Error('URL is required');

      const format = resolveFormat(fmt || 'markdown');
      const result = await scrapeUrl(url, {
        timeout: 30000,
        scroll: options.scroll as boolean,
        extractLinks: (options.extractLinks as boolean) ?? true,
        extractImages: (options.extractImages as boolean) ?? true,
        extractTables: (options.extractTables as boolean) ?? true,
      } as ScrapeOptions);

      let response: Record<string, unknown>;

      if (options.agent) {
        const agentOutput = formatForAgent(result);
        response = {
          success: true,
          title: result.title,
          url: result.url,
          duration: result.duration,
          size: result.size,
          agentOutput,
        };
      } else {
        const serializeOpts = buildSerializeOptions(format);
        const serialized = serializeResult(result, serializeOpts);
        response = {
          success: true,
          title: result.title,
          url: result.url,
          format,
          content: serialized.content,
          duration: result.duration,
          size: serialized.size,
          metadata: result.metadata,
          links: result.links,
          images: result.images,
          tables: result.tables,
          result,
        };
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (err) {
      const error = err as Error;
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`POST /api/scrape with { url, format?, options? }`);
});
