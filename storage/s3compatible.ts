/**
 * s3 compatible storage stays open by accepting a caller supplied signer.
 */
import { storageadapter } from "./adapter.js";

export function s3compatible(options = {}) {
  if (!options.endpoint || !options.bucket || typeof options.sign !== "function") throw new TypeError("s3 compatible storage requires endpoint bucket and sign");
  const endpoint = new URL(options.endpoint);
  const fetcher = options.fetcher ?? fetch;
  async function request(method, key, body) {
    const signed = await options.sign({ method, endpoint, bucket: options.bucket, key, body });
    const response = await fetcher(signed.url, { method, headers: signed.headers, body });
    if (!response.ok) throw new Error(`storage request failed with ${response.status}`);
    return response;
  }
  return storageadapter({
    async put(input) { const data = await (input.data instanceof Uint8Array ? input.data : (await import("./checksum.js")).collectbytes(input.data)); await request("PUT", input.key, data); return { key: input.key, sizebytes: data.byteLength, sha256: (await import("./checksum.js")).sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: Date.now(), metadata: { ...(input.metadata ?? {}) } }; },
    async get(key) { const response = await request("GET", key); return new Uint8Array(await response.arrayBuffer()); },
    async head(key) { try { const response = await request("HEAD", key); return { key, sizebytes: Number(response.headers.get("content-length") ?? 0), sha256: response.headers.get("etag") ?? "", contenttype: response.headers.get("content-type") ?? "application/octet-stream", createdat: Date.now(), metadata: {} }; } catch { return null; } },
    async delete(key) { await request("DELETE", key); },
    async list() { throw new Error("s3 compatible list requires a provider specific implementation"); }
  });
}
