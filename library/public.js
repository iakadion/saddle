/**
 * public library helpers compose fetch extraction serialization chunking and crawl contracts.
 */
import { crawl } from "../crawl/crawler.js";
import { chunkmarkdown } from "../ai/chunk.js";
import { estimatetokens } from "../ai/tokens.js";
import { extracthtml } from "../scrape/extract.js";
import { browseragent } from "../browser/agent.js";

export async function saddleurl(url, options = {}) { const mode = options.mode ?? "fetch"; if (mode === "browser") return scrapewithbrowser(url, options); return scrapeurl(url, options); }

export async function scrapeurl(url, options = {}) {
  const target = safeurl(url);
  const response = await (options.fetcher ?? fetch)(target, { signal: options.signal, headers: options.headers });
  if (!response.ok) throw new Error(`scrape request failed with ${response.status}`);
  const html = await response.text();
  return formatresult(scrapehtml(html, target, options), options);
}

export function scrapehtml(html, url = "https://example.com", options = {}) { const result = extracthtml(html, url); return { content: result.text, metadata: { url: result.url, title: result.title, description: result.description, links: result.links }, html: options.includehtml ? html : undefined }; }
export function extractcontent(html, options = {}) { return extracthtml(html, options.url ?? "https://example.com"); }
export async function scrapewithbrowser(url, options = {}) { const agent = browseragent(options.browser); await agent.navigate({ url, waituntil: options.waituntil ?? "networkidle" }); return formatresult({ content: await agent.text(), metadata: { url, title: await agent.title(), html: options.includehtml ? await agent.html() : undefined } }, options); }

export function serializeresult(result, options = {}) { const format = options.format ?? "json"; if (format === "json") return JSON.stringify(result, null, options.pretty ? 2 : 0); if (format === "text") return result.content ?? ""; if (format === "markdown") return `# ${result.metadata?.title ?? "result"}\n\n${result.content ?? ""}`; if (format === "xml") return `<result><title>${escape(result.metadata?.title ?? "")}</title><content>${escape(result.content ?? "")}</content></result>`; if (format === "redis") return JSON.stringify({ content: result.content, metadata: result.metadata }); throw new TypeError(`unsupported format: ${format}`); }

export function serializehtml(html) { return serializeresult(scrapehtml(html), { format: "markdown" }); }
export function formatforagent(result, options = {}) { const content = result.content ?? ""; const chunks = chunkmarkdown(content, { maxtokens: options.maxchunksize ?? 4000 }); const lines = content.split(/[.!?]\s+/).filter(Boolean); return { summary: lines.slice(0, 2).join(". "), keypoints: lines.slice(0, options.keypoints ?? 5), relevanturls: result.metadata?.links ?? [], chunks, tokencount: estimatetokens(content, options.model) }; }
export async function batchscrape(options = {}) { const urls = options.urls ?? []; const concurrency = options.concurrency ?? 10; const results = []; for (let index = 0; index < urls.length; index += concurrency) { const group = urls.slice(index, index + concurrency); const completed = await Promise.all(group.map((url) => scrapeurl(url, options))); results.push(...completed); options.onprogress?.({ completed: results.length, total: urls.length }); } return results; }
export async function crawlurl(url, options = {}) { return crawl(url, { ...options, scrape: (target) => scrapeurl(target, options) }); }

function safeurl(value) { const url = new URL(value); if (!["http:", "https:"].includes(url.protocol)) throw new TypeError("url must use http or https"); return url.href; }
function formatresult(result, options) { return options.format ? { ...result, serialized: serializeresult(result, options) } : result; }
function escape(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
