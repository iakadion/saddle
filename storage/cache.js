/**
 * tiered cache keeps a bounded hot tier and an optional persistent cold tier with stale-while-revalidate.
 */

/** Creates a cache with caller supplied encode, decode, clock and persistent storage policies. */
export function tieredcache(options = {}) {
  const hot = new Map();
  const maxentries = Number(options.maxentries ?? 256);
  const ttl = Number(options.ttl ?? 300000);
  const stale = Number(options.stale ?? ttl);
  const now = options.now ?? (() => Date.now());
  const cold = options.storage;
  const encode = options.encode ?? ((value) => new TextEncoder().encode(JSON.stringify(value)));
  const decode = options.decode ?? ((bytes) => JSON.parse(new TextDecoder().decode(bytes)));
  const stats = { hits: 0, misses: 0, stalehits: 0, evictions: 0, revalidations: 0 };

  function readhot(key) {
    const item = hot.get(key);
    if (!item) return null;
    const current = now();
    if (current <= item.expires) { stats.hits += 1; return { value: item.value, fresh: true }; }
    if (current <= item.stale) { stats.stalehits += 1; return { value: item.value, fresh: false }; }
    hot.delete(key);
    return null;
  }

  function writehot(key, value, options = {}) {
    if (hot.size >= maxentries && !hot.has(key)) { hot.delete(hot.keys().next().value); stats.evictions += 1; }
    const current = now();
    hot.set(key, { value, expires: current + Number(options.ttl ?? ttl), stale: current + Number(options.stale ?? stale) });
    return value;
  }

  async function get(key, options = {}) {
    const hotvalue = readhot(key);
    if (hotvalue?.fresh || (hotvalue && options.allowstale !== false)) return hotvalue.value;
    if (!cold) { stats.misses += 1; return null; }
    try { const value = decode(await cold.get(key)); writehot(key, value, options); return value; } catch { stats.misses += 1; return null; }
  }

  async function set(key, value, valueoptions = {}) { writehot(key, value, valueoptions); if (cold) await cold.put({ key, data: encode(value), contenttype: "application/json" }); return value; }
  async function getorload(key, loader, options = {}) {
    if (typeof loader !== "function") throw new TypeError("cache loader must be a function");
    const current = readhot(key);
    if (current?.fresh) return current.value;
    if (current && options.allowstale !== false) { stats.revalidations += 1; Promise.resolve(loader()).then((value) => set(key, value, options)).catch(() => undefined); return current.value; }
    const value = await loader();
    return set(key, value, options);
  }
  async function remove(key) { hot.delete(key); await cold?.delete?.(key); }
  function clear() { hot.clear(); }
  function inspect() { return { ...stats, hotentries: hot.size, maxentries, ttl, stale }; }
  return { get, set, getorload, delete: remove, clear, inspect };
}
