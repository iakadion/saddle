/**
 * URL security rejects private network targets before a fetch is attempted.
 * DNS resolution remains a host adapter concern and is never performed silently.
 */
export function assertpublicurl(value, options = {}) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new TypeError("url protocol is not allowed");
  if (options.allowprivate) return url;
  if (privatehostname(url.hostname) || privateip(url.hostname)) throw new Error("private network target is not allowed");
  return url;
}

/** Returns a non throwing boolean for validators and middleware. */
export function ispublicurl(value, options = {}) { try { assertpublicurl(value, options); return true; } catch { return false; } }

function privatehostname(hostname) { const value = hostname.toLowerCase(); return value.endsWith(".local") || value.endsWith(".internal") || value.endsWith(".localhost") || value === "localhost"; }
function privateip(hostname) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd");
  const [first, second] = parts;
  return first === 10 || first === 127 || first === 169 && second === 254 || first === 172 && second >= 16 && second <= 31 || first === 192 && second === 168;
}
