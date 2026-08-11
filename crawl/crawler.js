/**
 * crawler performs bounded breadth first traversal through the scraper contract.
 */
import { normalizeurl, sameorigin } from "./normalize.js";

export async function crawl(start, options = {}) {
  const maxdepth = options.maxdepth ?? 1;
  const maxpages = options.maxpages ?? 20;
  const sameDomain = options.samedomain ?? true;
  const queue = [{ url: normalizeurl(start), depth: 0 }];
  const seen = new Set();
  const results = [];
  while (queue.length && results.length < maxpages) {
    const current = queue.shift();
    if (seen.has(current.url) || current.depth > maxdepth) continue;
    seen.add(current.url);
    const result = await options.scrape(current.url);
    results.push({ ...result, depth: current.depth });
    if (current.depth >= maxdepth) continue;
    for (const link of result.links ?? []) {
      let url;
      try { url = normalizeurl(link); } catch { continue; }
      if (sameDomain && !sameorigin(start, url)) continue;
      if (!seen.has(url)) queue.push({ url, depth: current.depth + 1 });
    }
  }
  return { results, stats: { discovered: seen.size, completed: results.length, maxdepth, maxpages } };
}
