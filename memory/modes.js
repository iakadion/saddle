/**
 * memory modes expose the same byte contract with different backing choices.
 */
export function internalmemory(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, tobytes(value)]));
  return {
    mode: "internal",
    async put(key, value) { values.set(key, tobytes(value)); return { key, bytes: values.get(key).byteLength }; },
    async get(key) { return values.get(key) ?? null; },
    async delete(key) { values.delete(key); },
    async list() { return [...values.keys()]; }
  };
}

export function externalmemory(storage) {
  if (!storage?.put || !storage?.get) throw new TypeError("external memory requires storage adapter");
  return {
    mode: "external",
    async put(key, value) { return storage.put({ key, data: tobytes(value) }); },
    async get(key) { try { return await storage.get(key); } catch (error) { if (error.code === "ARTIFACT_NOT_FOUND") return null; throw error; } },
    async delete(key) { return storage.delete(key); },
    async list(prefix) { return storage.list(prefix); }
  };
}

export function physicalmemory(options = {}) {
  if (!options.path) throw new TypeError("physical memory requires a path");
  return { mode: "physical", path: options.path, put: options.put, get: options.get, delete: options.delete, list: options.list };
}

export function vectorizedmemory() {
  const vectors = new Map();
  return {
    mode: "vectorized",
    async put(key, vector) { assertvector(vector); vectors.set(key, [...vector]); return { key, dimensions: vector.length }; },
    async get(key) { return vectors.get(key) ?? null; },
    async average(keys) { const selected = keys.map((key) => vectors.get(key)).filter(Boolean); if (!selected.length) return null; const size = selected[0].length; const result = Array.from({ length: size }, () => 0); for (const vector of selected) for (let index = 0; index < size; index += 1) result[index] += vector[index] / selected.length; return result; },
    async list() { return [...vectors.keys()]; }
  };
}

export function librarymemory(factory) {
  if (typeof factory !== "function") throw new TypeError("library memory requires a factory");
  return { mode: "library", async load(options) { return factory(options); } };
}

function tobytes(value) {
  if (value instanceof Uint8Array) return value;
  if (typeof value === "string") return new TextEncoder().encode(value);
  return new TextEncoder().encode(JSON.stringify(value));
}

function assertvector(vector) {
  if (!Array.isArray(vector) || vector.length === 0 || vector.some((value) => !Number.isFinite(value))) throw new TypeError("vector must be a non empty numeric array");
}
