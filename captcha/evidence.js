/**
 * captcha evidence stores references and hashes, never raw secrets or tokens by default.
 */
import { createHash } from "node:crypto";

export function evidence(options = {}) {
  const payload = options.data instanceof Uint8Array ? options.data : options.data ? new TextEncoder().encode(String(options.data)) : null;
  return { kind: options.kind ?? "unknown", passed: Boolean(options.passed), solver: options.solver ?? "manual", evidenceurl: options.evidenceurl, sha256: payload ? createHash("sha256").update(payload).digest("hex") : options.sha256, createdat: options.createdat ?? Date.now(), metadata: { ...(options.metadata ?? {}) } };
}
