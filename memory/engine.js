/**
 * memory engine loads from the first backend and persists to every backend.
 */
import { memoryobject, tobytes } from "./objects.js";
import { transformtocompute, transformtostorage } from "./transforms.js";
import { storagecapabilities, syncbackends } from "../storage/sync.js";

export function memoryengine(options = {}) {
  const backends = options.backends ?? [];
  const values = new Map();
  async function load(key) {
    if (!key) throw new TypeError("memory key is required");
    if (values.has(key)) return values.get(key);
    let last;
    for (const backend of backends) {
      try {
        const value = await backend.get(key);
        if (value == null) continue;
        const object = memoryobject({ id: key, buffer: value.data ?? value, type: value.contenttype ?? value.type, metadata: value.metadata });
        values.set(key, object);
        return object;
      } catch (error) { last = error; }
    }
    if (last) throw new Error(`memory engine load failed for key "${key}": ${last.message}`, { cause: last });
    throw new Error(`memory engine load failed for key "${key}": not found`);
  }
  async function persist(key, data, options = {}) {
    const payload = tobytes(data?.payload ?? data?.buffer ?? data);
    const object = memoryobject({ id: key, buffer: payload, type: options.mimetype ?? data?.mimetype, metadata: options.metadata ?? data?.metadata });
    for (const backend of backends) await backend.put(key, { data: object.buffer, contenttype: object.type, metadata: object.metadata });
    values.set(key, object);
    return object;
  }
  function release(key) { values.delete(key); }
  async function safeload(key) { try { return { success: true, data: await load(key) }; } catch (error) { return { success: false, error }; } }
  async function sync(key, options = {}) {
    const sourceindex = Number(options.sourceindex ?? 0);
    const source = backends[sourceindex];
    if (!source) throw new TypeError("memory sync source backend is missing");
    const targets = backends.filter((_backend, index) => index !== sourceindex);
    return syncbackends(source, targets, key, options);
  }
  function capabilities() { return backends.map((backend, index) => ({ index, capabilities: storagecapabilities(backend) })); }
  return { load, persist, release, safeload, sync, capabilities, transformtocompute, transformtostorage, list() { return [...values.keys()]; } };
}
