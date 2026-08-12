#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { scrapeUrl, scrapeHtml } from './scrape.js';
import { serializeResult } from './serialize.js';
import { resolveFormat, extensionForFormat, buildSerializeOptions } from './formats.js';
import { formatForAgent } from './agent.js';
import { writeOutput } from './utils.js';
import type { ScrapeOptions, ScrapeResult } from './types.js';

const program = new Command();

program
  .name('webscrape')
  .description('DevThink WebScrape — Universal AI-powered web scraping toolkit')
  .version('2.0.0');

program
  .argument('[url]', 'URL to scrape')
  .option('-f, --format <type>', 'Output format: markdown, html, text, json, xml, redis', 'markdown')
  .option('-o, --output <file>', 'Write output to file')
  .option('--file <path>', 'Scrape HTML from local file')
  .option('--mode <mode>', 'Scraping mode: auto, fetch, browser', 'auto')
  .option('--no-headless', 'Show browser window')
  .option('--timeout <ms>', 'Navigation timeout', '30000')
  .option('--scroll', 'Scroll page to load dynamic content')
  .option('--readable', 'Extract readable content only')
  .option('--agent', 'Format output for AI agent consumption')
  .option('--pretty', 'Pretty-print JSON output')
  .option('--proxy <url>', 'Proxy server URL')
  .option('--retries <n>', 'Number of retries', '3')
  .option('--user-agent <ua>', 'Custom User-Agent string')
  .action(async (url, options) => {
    if (!url && !options.file) {
      program.help();
    }

    const format = resolveFormat(options.format);
    const scrapeOpts: ScrapeOptions = {
      format,
      timeout: parseInt(options.timeout),
      scroll: options.scroll,
      readable: options.readable,
      mode: options.mode,
      proxy: options.proxy,
      retries: parseInt(options.retries),
      userAgent: options.userAgent,
      extractLinks: true,
      extractImages: true,
      extractTables: true,
    };

    if (options.readable) {
      scrapeOpts.removeSelectors = [
        'script', 'style', 'nav', 'footer', 'header',
        '.sidebar', '.advertisement', '.ads', '.menu',
        '.comments', '.comment', '#comments',
      ];
    }

    console.error(`Scraping: ${url || options.file}`);

    let result: ScrapeResult;

    if (options.file) {
      const filePath = resolve(options.file);
      if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }
      const html = readFileSync(filePath, 'utf-8');
      result = await scrapeHtml(html, scrapeOpts);
    } else {
      result = await scrapeUrl(url, scrapeOpts);
    }

    console.error(`Done in ${result.duration}ms (${(result.size / 1024).toFixed(1)} KB)`);

    if (options.agent) {
      const agentOutput = formatForAgent(result);
      const output = JSON.stringify(agentOutput, null, 2);

      if (options.output) {
        writeOutput(options.output, output);
        console.error(`Saved to ${options.output}`);
      } else {
        console.log(output);
      }
    } else {
      const serializeOpts = buildSerializeOptions(format, options.pretty);
      const serialized = serializeResult(result, serializeOpts);

      if (options.output) {
        const ext = extensionForFormat(format);
        const finalPath = options.output.endsWith(ext) ? options.output : options.output + ext;
        writeOutput(finalPath, serialized.content);
        console.error(`Saved to ${finalPath}`);
      } else {
        console.log(serialized.content);
      }
    }
  });

program.parse();
