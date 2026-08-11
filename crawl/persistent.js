/**
 * persistent crawl queue uses an injected store and falls back to memory when no store exists.
 */
export function persistentqueue(options = {}) {
  const store = options.store;
  const values = [];
  const seen = new Set();
  async function restore() { if (typeof store?.list !== "function") return; for (const item of await store.list()) if (!seen.has(item.url) && item.status !== "done") { seen.add(item.url); values.push(item); } }
  async function add(item) { if (!item?.url || seen.has(item.url)) return false; const value = { url: item.url, depth: item.depth ?? 0, status: "queued", createdat: Date.now(), metadata: item.metadata ?? {} }; seen.add(value.url); values.push(value); if (typeof store?.save === "function") await store.save(value); return true; }
  async function next() { const item = values.find((value) => value.status === "queued"); if (!item) return null; item.status = "running"; if (typeof store?.update === "function") await store.update(item.url, item); return item; }
  async function complete(url, patch = {}) { const item = values.find((value) => value.url === url); if (!item) return null; Object.assign(item, patch, { status: patch.status ?? "done", processedat: Date.now() }); if (typeof store?.update === "function") await store.update(url, item); return item; }
  return { restore, add, next, complete, list() { return values.map((value) => ({ ...value })); } };
}
