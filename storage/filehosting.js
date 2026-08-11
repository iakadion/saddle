/**
 * file hosting adapter accepts a caller supplied request function for s3compatible or webdav.
 */
import { collectbytes, sha256 } from "./checksum.js";
import { storageadapter } from "./adapter.js";

export function filehosting(options = {}) {
  if (!options.host || typeof options.request !== "function") throw new TypeError("file hosting requires host and request");
  const method = options.method ?? "s3compatible";
  return storageadapter({
    async put(input) { const data = await collectbytes(input.data); await options.request({ method: method === "webdav" ? "PUT" : "put", url: new URL(input.key, options.host).href, data, headers: { "content-type": input.contenttype ?? "application/octet-stream" } }); return { key: input.key, sizebytes: data.byteLength, sha256: sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: Date.now(), metadata: input.metadata ?? {} }; },
    async get(key) { const result = await options.request({ method: method === "webdav" ? "GET" : "get", url: new URL(key, options.host).href }); return result.data ?? result; },
    async head(key) { try { const result = await options.request({ method: "head", url: new URL(key, options.host).href }); return { key, sizebytes: Number(result.headers?.["content-length"] ?? 0), sha256: result.headers?.etag ?? "", contenttype: result.headers?.["content-type"] ?? "application/octet-stream", createdat: Date.now(), metadata: {} }; } catch { return null; } },
    async delete(key) { await options.request({ method: method === "webdav" ? "DELETE" : "delete", url: new URL(key, options.host).href }); },
    async list(prefix = "") { const result = await options.request({ method: method === "webdav" ? "PROPFIND" : "list", url: new URL(prefix, options.host).href }); return result.items ?? []; }
  });
}
