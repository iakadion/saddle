/**
 * context provenance links retrieved chunks to source, query and transformation metadata.
 */

/** Creates a serializable retrieval record for an agent context result. */
export function provenance(input = {}) {
  if (!input.source && !input.sourceurl) throw new TypeError("provenance requires a source");
  return { version: 1, source: input.source ?? input.sourceurl, sourceurl: input.sourceurl, documentid: input.documentid, query: input.query, retrievedat: Number(input.retrievedat ?? Date.now()), chunks: Array.isArray(input.chunks) ? input.chunks.map((chunk, index) => ({ id: String(chunk.id ?? index), contenthash: chunk.contenthash, score: chunk.score === undefined ? undefined : Number(chunk.score), headingpath: chunk.headingpath, tokencount: chunk.tokencount, citation: chunk.citation ?? input.sourceurl })) : [], metadata: { ...(input.metadata ?? {}) } };
}

/** Merges provenance records while deduplicating chunk identifiers. */
export function mergeprovenance(records = []) {
  const valid = records.filter(Boolean);
  const chunks = [];
  const seen = new Set();
  for (const record of valid) for (const chunk of record.chunks ?? []) { const key = `${record.documentid ?? record.source}:${chunk.id}`; if (seen.has(key)) continue; seen.add(key); chunks.push({ ...chunk, source: record.source, documentid: record.documentid }); }
  return { version: 1, sources: [...new Set(valid.map((record) => record.source))], chunks, mergedat: Date.now() };
}
