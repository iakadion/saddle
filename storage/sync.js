/**
 * storage synchronization compares versioned manifests and keeps conflict policy explicit.
 */

import { collectbytes, sha256 } from "./checksum.js";

/** Describes capabilities exposed by a storage adapter without forcing optional methods. */
export function storagecapabilities(storage) {
  return Object.freeze({ range: typeof storage?.getrange === "function", conditional: typeof storage?.putifmatch === "function", metadata: typeof storage?.head === "function", delete: typeof storage?.delete === "function" });
}

/** Creates a comparable object manifest from bytes and caller metadata. */
export async function objectmanifest(key, data, options = {}) {
  const bytes = await collectbytes(data);
  return { version: 1, key: String(key), sizebytes: bytes.byteLength, sha256: sha256(bytes), updatedat: Number(options.updatedat ?? Date.now()), etag: options.etag ?? sha256(bytes), metadata: { ...(options.metadata ?? {}) } };
}

/** Compares two manifests and classifies an update or conflict. */
export function comparemanifests(local, remote) {
  if (!local && !remote) return { state: "empty" };
  if (!local) return { state: "remoteonly", remote };
  if (!remote) return { state: "localonly", local };
  if (local.sha256 === remote.sha256) return { state: "identical", local, remote };
  if (local.updatedat > remote.updatedat) return { state: "localnewer", local, remote };
  if (remote.updatedat > local.updatedat) return { state: "remotenewer", local, remote };
  return { state: "conflict", local, remote };
}

/** Synchronizes one logical object between two adapters with explicit conflict handling. */
export async function syncobject(source, target, key, options = {}) {
  if (typeof source?.head !== "function" || typeof source?.get !== "function" || typeof target?.head !== "function" || typeof target?.put !== "function") throw new TypeError("sync requires source and target head, get and put");
  const sourcehead = await source.head(key);
  const targethead = await target.head(key);
  const comparison = comparemanifests(normalizemanifest(sourcehead, key), normalizemanifest(targethead, key));
  if (["empty", "identical"].includes(comparison.state)) return { key: String(key), state: comparison.state, manifest: comparison.local ?? comparison.remote };
  if (comparison.state === "conflict" && typeof options.resolve !== "function") { const error = new Error(`storage conflict for key: ${key}`); error.code = "STORAGE_CONFLICT"; error.retryable = false; throw error; }
  if (comparison.state === "conflict") { const choice = await options.resolve(comparison); if (!["source", "target"].includes(choice)) throw new TypeError("sync conflict resolver must return source or target"); if (choice === "target") return { key: String(key), state: "kepttarget", manifest: comparison.remote }; }
  const data = await source.get(key);
  const manifest = await objectmanifest(key, data, { updatedat: comparison.local?.updatedat ?? Date.now(), metadata: sourcehead?.metadata });
  await target.put({ key: String(key), data, contenttype: sourcehead?.contenttype, metadata: { ...(sourcehead?.metadata ?? {}), sha256: manifest.sha256, updatedat: String(manifest.updatedat) } });
  return { key: String(key), state: comparison.state === "conflict" ? "resolvedsource" : "copied", manifest };
}

/** Synchronizes one object to multiple backends and returns each outcome. */
export async function syncbackends(source, targets = [], key, options = {}) {
  if (!Array.isArray(targets)) throw new TypeError("sync targets must be an array");
  const results = [];
  for (const target of targets) {
    try { results.push(await syncobject(source, target, key, options)); }
    catch (error) { results.push({ key: String(key), state: "failed", code: error.code ?? "STORAGE_SYNC_FAILED", message: error.message }); if (options.stoponerror) break; }
  }
  return results;
}

function normalizemanifest(value, key) { return value ? { ...value, key: String(value.key ?? key), sha256: value.sha256 ?? value.etag, updatedat: Number(value.updatedat ?? 0) } : null; }
