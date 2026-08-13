/**
 * memory engine loads from the first backend, persists to every backend and
 * bounds the hot working set without changing the default unbounded behavior.
 */
import { memoryobject, tobytes } from "./objects.js";
import { transformtocompute, transformtostorage } from "./transforms.js";
import { storagecapabilities, syncbackends } from "../storage/sync.js";

/** Creates a storage-backed memory engine with optional LRU working-set limits. */
export function memoryengine(options = {}) {
  const backends = options.backends ?? [];
  const maxentries = limit(options.maxentries, "maxentries");
  const maxbytes = limit(options.maxbytes, "maxbytes");
  const values = new Map();
  let usedbytes = 0;
  let hits = 0;
  let misses = 0;
  let evictions = 0;

  async function load(key) {
    if (!key) throw new TypeError("memory key is required");
    if (values.has(key)) {
      hits += 1;
      return touch(key);
    }
    misses += 1;
    let last;
    for (const backend of backends) {
      try {
        const value = await backend.get(key);
        if (value == null) continue;
        const object = memoryobject({ id: key, buffer: value.data ?? value, type: value.contenttype ?? value.type, metadata: value.metadata });
        cache(key, object);
        return object;
      } catch (error) { last = error; }
    }
    if (last) throw new Error(`memory engine load failed for key "${key}": ${last.message}`, { cause: last });
    throw new Error(`memory engine load failed for key "${key}": not found`);
  }

  async function persist(key, data, options = {}) {
    if (!key) throw new TypeError("memory key is required");
    const payload = tobytes(data?.payload ?? data?.buffer ?? data);
    const object = memoryobject({ id: key, buffer: payload, type: options.mimetype ?? data?.mimetype, metadata: options.metadata ?? data?.metadata });
    for (const backend of backends) await backend.put(key, { data: object.buffer, contenttype: object.type, metadata: object.metadata });
    cache(key, object);
    return object;
  }

  function release(key) {
    const object = values.get(key);
    if (object) usedbytes -= object.buffer.byteLength;
    values.delete(key);
  }

  async function safeload(key) { try { return { success: true, data: await load(key) }; } catch (error) { return { success: false, error }; } }

  async function sync(key, options = {}) {
    const sourceindex = Number(options.sourceindex ?? 0);
    const source = backends[sourceindex];
    if (!source) throw new TypeError("memory sync source backend is missing");
    const targets = backends.filter((_backend, index) => index !== sourceindex);
    return syncbackends(source, targets, key, options);
  }

  function capabilities() { return backends.map((backend, index) => ({ index, capabilities: storagecapabilities(backend) })); }
  function stats() { return { entries: values.size, bytes: usedbytes, hits, misses, evictions, maxentries, maxbytes }; }

  return { load, persist, release, safeload, sync, capabilities, stats, transformtocompute, transformtostorage, list() { return [...values.keys()]; } };

  function cache(key, object) {
    const previous = values.get(key);
    if (previous) usedbytes -= previous.buffer.byteLength;
    values.delete(key);
    if (object.buffer.byteLength > maxbytes || maxentries === 0) return;
    values.set(key, object);
    usedbytes += object.buffer.byteLength;
    while (values.size > maxentries || usedbytes > maxbytes) {
      const oldest = values.keys().next().value;
      const evicted = values.get(oldest);
      values.delete(oldest);
      usedbytes -= evicted.buffer.byteLength;
      evictions += 1;
    }
  }

  function touch(key) {
    const object = values.get(key);
    values.delete(key);
    values.set(key, object);
    return object;
  }
}

function limit(value, name) {
  if (value === undefined) return Infinity;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) throw new TypeError(`${name} must be a non-negative integer`);
  return numeric;
}
