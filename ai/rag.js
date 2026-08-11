/**
 * rag manifests connect chunks to embedding stores without forcing a vendor client.
 */
export async function ragmanifest(input = {}) {
  const chunks = input.chunks ?? [];
  const unique = [];
  const hashes = new Set();
  for (const chunk of chunks) { const hash = await hashtext(chunk.content); if (hashes.has(hash)) continue; hashes.add(hash); unique.push({ ...chunk, contenthash: hash, documentid: hash.slice(0, 16), metadata: { ...(input.metadata ?? {}), ...(chunk.metadata ?? {}) } }); }
  return { documentid: (await hashtext(input.source ?? unique.map((chunk) => chunk.content).join("\n"))).slice(0, 16), source: input.source, chunks: unique, embeddingmodel: input.embeddingmodel, embeddingdimensions: input.embeddingdimensions, createdat: Date.now() };
}

export function vectorrecord(chunk, vector, options = {}) { return { id: `${chunk.documentid}-${chunk.id}`, vector, metadata: { headingpath: chunk.headingpath, contenthash: chunk.contenthash, sourceurl: options.sourceurl, tokencount: chunk.tokencount, contenttype: options.contenttype ?? "text", language: options.language ?? "en", embeddingmodel: options.embeddingmodel, embeddingdimensions: vector?.length } }; }

async function hashtext(text) { const bytes = new TextEncoder().encode(String(text)); if (globalThis.crypto?.subtle) { const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes); return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join(""); } return Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("").slice(0, 64).padEnd(64, "0"); }
