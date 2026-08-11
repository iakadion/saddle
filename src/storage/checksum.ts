// Node storage utility: checksums are computed over bytes, never over a base64 representation.
import { createHash } from "node:crypto";
export async function collectBytes(input: Uint8Array | AsyncIterable<Uint8Array>): Promise<Uint8Array> {
  if (input instanceof Uint8Array) return input;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of input) { chunks.push(chunk); size += chunk.byteLength; }
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}
export function sha256(data: Uint8Array): string { return createHash("sha256").update(data).digest("hex"); }
