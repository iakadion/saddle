/**
 * ttl cache keeps fetch policy separate from extraction and transport.
 */
export function ttlcache(options = {}) {
  const values = new Map();
  const ttl = options.ttl ?? 300000;
  return {
    get(key) { const item = values.get(key); if (!item) return null; if (Date.now() > item.expires) { if (Date.now() > item.stale) values.delete(key); return options.stale ? item.value : null; } return item.value; },
    set(key, value, valueoptions = {}) { const current = Date.now(); values.set(key, { value, expires: current + (valueoptions.ttl ?? ttl), stale: current + (valueoptions.stale ?? ttl * 2) }); return value; },
    delete(key) { values.delete(key); },
    clear() { values.clear(); },
    size() { return values.size; }
  };
}
