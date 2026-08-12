/**
 * captcha evidence stores references and hashes, never raw secrets or tokens by default.
 */
import { sha256 } from "../core/hash.js";

export function evidence(options = {}) {
  const payload = options.data instanceof Uint8Array ? options.data : options.data ? new TextEncoder().encode(String(options.data)) : null;
  return { kind: options.kind ?? "unknown", passed: Boolean(options.passed), solver: options.solver ?? "manual", evidenceurl: options.evidenceurl, sha256: payload ? sha256(payload) : options.sha256, createdat: options.createdat ?? Date.now(), metadata: { ...(options.metadata ?? {}) } };
}
