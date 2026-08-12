/**
 * crawler performs bounded breadth first traversal through the scraper contract.
 */
import { normalizeurl, sameorigin } from "./normalize.js";
import { crawlfrontier } from "./frontier.js";

export async function crawl(start, options = {}) {
  const maxdepth = options.maxdepth ?? 1;
  const maxpages = options.maxpages ?? 20;
  const sameDomain = options.samedomain ?? true;
  const frontier = crawlfrontier({ maxpages, maxperdomain: options.maxperdomain ?? maxpages });
  frontier.add({ url: normalizeurl(start), depth: 0, priority: options.startpriority ?? 0 });
  const results = [];
  while (frontier.state().queued && results.length < maxpages) {
    const current = frontier.next();
    if (!current || current.depth > maxdepth) continue;
    const result = await options.scrape(current.url);
    results.push({ ...result, depth: current.depth });
    frontier.complete(current.url);
    if (current.depth >= maxdepth) continue;
    for (const link of result.links ?? []) {
      let url;
      try { url = normalizeurl(link); } catch { continue; }
      if (sameDomain && !sameorigin(start, url)) continue;
      frontier.add({ url, depth: current.depth + 1, priority: Number(options.priority?.(url, result) ?? 0) });
    }
  }
  return { results, stats: { ...frontier.state(), completed: results.length, maxdepth, maxpages } };
}
