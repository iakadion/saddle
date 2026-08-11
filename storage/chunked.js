/**
 * chunked storage keeps large payloads split without forcing a database blob.
 */
import { collectbytes, sha256 } from "./checksum.js";

export function chunkedstorage(storage, options = {}) {
  const chunkbytes = options.chunkbytes;
  if (!Number.isInteger(chunkbytes) || chunkbytes < 1) throw new TypeError("chunkbytes must be a positive integer");
  return {
    async put(input) {
      const data = await collectbytes(input.data);
      const chunks = [];
      for (let offset = 0; offset < data.byteLength; offset += chunkbytes) {
        const index = chunks.length;
        const key = `${input.key}/chunk${String(index).padStart(8, "0")}`;
        const part = data.slice(offset, Math.min(offset + chunkbytes, data.byteLength));
        const manifest = await storage.put({ key, data: part, contenttype: input.contenttype, metadata: { parent: input.key, index: String(index) } });
        chunks.push({ key, sizebytes: part.byteLength, sha256: manifest.sha256 });
      }
      const manifest = { key: input.key, sizebytes: data.byteLength, chunks, chunkbytes, sha256: sha256(data), contenttype: input.contenttype ?? "application/octet-stream", metadata: { ...(input.metadata ?? {}) } };
      await storage.put({ key: `${input.key}/manifest`, data: new TextEncoder().encode(JSON.stringify(manifest)), contenttype: "application/json" });
      return manifest;
    },
    async get(key) {
      const raw = await storage.get(`${key}/manifest`);
      const manifest = JSON.parse(new TextDecoder().decode(raw));
      const parts = await Promise.all(manifest.chunks.map((chunk) => storage.get(chunk.key)));
      const output = new Uint8Array(manifest.sizebytes);
      let offset = 0;
      for (const part of parts) { output.set(part, offset); offset += part.byteLength; }
      return output;
    },
    async head(key) { const raw = await storage.get(`${key}/manifest`).catch(() => null); return raw ? JSON.parse(new TextDecoder().decode(raw)) : null; },
    async delete(key) { const manifest = await this.head(key); if (!manifest) return; for (const chunk of manifest.chunks) await storage.delete(chunk.key); await storage.delete(`${key}/manifest`); },
    async list(prefix) { return storage.list(prefix); }
  };
}
