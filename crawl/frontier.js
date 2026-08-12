/**
 * crawl frontier provides priorities, per-domain budgets and persistent-friendly queue state.
 */

/** Creates a bounded priority frontier for crawler and queue adapters. */
export function crawlfrontier(options = {}) {
  const maxpages = Number(options.maxpages ?? 20);
  const maxperdomain = Number(options.maxperdomain ?? maxpages);
  const queue = [];
  const seen = new Set();
  const completed = new Set();
  const domains = new Map();
  function add(input = {}) {
    const url = String(input.url ?? "");
    if (!url || seen.has(url) || seen.size >= maxpages) return false;
    seen.add(url);
    queue.push({ url, depth: Number(input.depth ?? 0), priority: Number(input.priority ?? 0), discoveredat: Number(input.discoveredat ?? Date.now()) });
    queue.sort((left, right) => right.priority - left.priority || left.discoveredat - right.discoveredat);
    return true;
  }
  function next() {
    while (queue.length) {
      const item = queue.shift();
      const domain = new URL(item.url).hostname;
      if ((domains.get(domain) ?? 0) >= maxperdomain) continue;
      domains.set(domain, (domains.get(domain) ?? 0) + 1);
      return { ...item };
    }
    return null;
  }
  function complete(url) { completed.add(String(url)); }
  function state() { return { maxpages, maxperdomain, queued: queue.length, discovered: seen.size, completed: completed.size, domains: Object.fromEntries(domains) }; }
  return { add, next, complete, state, list() { return queue.map((item) => ({ ...item })); } };
}
