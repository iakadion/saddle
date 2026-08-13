/**
 * scrape crawl context owns URL normalization traversal frontier and durable crawl state.
 *
 * The context keeps single page acquisition injectable while grouping the correlated
 * crawl responsibilities that previously lived in four separate top level files.
 */

/** Removes fragments and tracking parameters before crawl deduplication. */
export function normalizeurl(value) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|msclkid$|gclid$|gclsrc$|dclid$|gbraid$|wbraid$|twclid$|campaign$|content$|term$|source$|medium$|ref$|share_id$)/i.test(key)) url.searchParams.delete(key);
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
}

/** Compares two crawl targets by origin. */
export function sameorigin(left, right) { return new URL(left).origin === new URL(right).origin; }

/** Creates a bounded priority frontier for crawler and queue adapters. */
export function crawlfrontier(options = {}) {
  const maxpages = Number(options.maxpages ?? 20);
  const maxperdomain = Number(options.maxperdomain ?? maxpages);
  const queue = [];
  const seen = new Set();
  const completed = new Set();
  const domains = new Map();

  /** Adds a URL once while respecting the global page budget. */
  function add(input = {}) {
    const url = String(input.url ?? "");
    if (!url || seen.has(url) || seen.size >= maxpages) return false;
    seen.add(url);
    queue.push({ url, depth: Number(input.depth ?? 0), priority: Number(input.priority ?? 0), discoveredat: Number(input.discoveredat ?? Date.now()) });
    queue.sort((left, right) => right.priority - left.priority || left.discoveredat - right.discoveredat);
    return true;
  }

  /** Removes the next URL that still fits its per-domain budget. */
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

  /** Records a completed URL for diagnostics and persistence-friendly state. */
  function complete(url) { completed.add(String(url)); }

  /** Returns stable frontier diagnostics without exposing mutable collections. */
  function state() { return { maxpages, maxperdomain, queued: queue.length, discovered: seen.size, completed: completed.size, domains: Object.fromEntries(domains) }; }

  return { add, next, complete, state, list() { return queue.map((item) => ({ ...item })); } };
}

/** Creates a durable crawl queue around a caller-owned store. */
export function persistentqueue(options = {}) {
  const store = options.store;
  const values = [];
  const seen = new Set();

  /** Restores unfinished crawl records from the injected store. */
  async function restore() { if (typeof store?.list !== "function") return; for (const item of await store.list()) if (!seen.has(item.url) && item.status !== "done") { seen.add(item.url); values.push(item); } }

  /** Adds a crawl record and persists it when the store supports writes. */
  async function add(item) { if (!item?.url || seen.has(item.url)) return false; const value = { url: item.url, depth: item.depth ?? 0, status: "queued", createdat: Date.now(), metadata: item.metadata ?? {} }; seen.add(value.url); values.push(value); if (typeof store?.save === "function") await store.save(value); return true; }

  /** Claims the next queued crawl record. */
  async function next() { const item = values.find((value) => value.status === "queued"); if (!item) return null; item.status = "running"; if (typeof store?.update === "function") await store.update(item.url, item); return item; }

  /** Completes a crawl record and persists the resulting status. */
  async function complete(url, patch = {}) { const item = values.find((value) => value.url === url); if (!item) return null; Object.assign(item, patch, { status: patch.status ?? "done", processedat: Date.now() }); if (typeof store?.update === "function") await store.update(url, item); return item; }

  return { restore, add, next, complete, list() { return values.map((value) => ({ ...value })); } };
}

/** Runs bounded breadth first traversal through the injected single page scrape contract. */
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
