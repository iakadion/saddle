/**
 * byte collection and hashing are grouped because every storage adapter uses them.
 */
import { createHash } from "node:crypto";

export async function collectbytes(input) {
  if (input instanceof Uint8Array) return input;
  const chunks = [];
  let size = 0;
  for await (const chunk of input) { chunks.push(chunk); size += chunk.byteLength; }
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}

export function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}
