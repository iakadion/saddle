/**
 * content addressed storage deduplicates immutable bytes while keeping logical references separate.
 */

import { collectbytes, sha256 } from "./checksum.js";

/** Creates a content-addressed view over a caller supplied storage adapter. */
export function contentstorage(storage, options = {}) {
  const objectprefix = options.objectprefix ?? "objects";
  const refprefix = options.refprefix ?? "refs";
  const encode = options.encode ?? ((value) => new TextEncoder().encode(JSON.stringify(value)));
  const decode = options.decode ?? ((bytes) => JSON.parse(new TextDecoder().decode(bytes)));
  if (typeof storage?.put !== "function" || typeof storage?.get !== "function" || typeof storage?.head !== "function") throw new TypeError("content storage requires put, get and head");

  async function put(input = {}) {
    const data = await collectbytes(input.data);
    const digest = sha256(data);
    const objectkey = `${objectprefix}/${digest}`;
    if (!(await storage.head(objectkey))) await storage.put({ key: objectkey, data, contenttype: input.contenttype, metadata: { ...(input.metadata ?? {}), immutable: "true", sha256: digest } });
    const reference = { version: 1, key: String(input.key), objectkey, sha256: digest, sizebytes: data.byteLength, contenttype: input.contenttype ?? "application/octet-stream", metadata: { ...(input.metadata ?? {}) } };
    await storage.put({ key: `${refprefix}/${input.key}`, data: encode(reference), contenttype: "application/json" });
    return reference;
  }

  async function get(key) {
    const reference = decode(await storage.get(`${refprefix}/${key}`));
    return storage.get(reference.objectkey);
  }

  async function head(key) {
    try { return decode(await storage.get(`${refprefix}/${key}`)); } catch { return null; }
  }

  async function remove(key) {
    const reference = await head(key);
    if (!reference) return false;
    await storage.delete?.(`${refprefix}/${key}`);
    return true;
  }

  return { put, get, head, delete: remove, capabilities: { immutableobjects: true, dedupe: true, references: true } };
}
