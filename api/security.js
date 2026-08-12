/**
 * URL security rejects private network targets before a fetch is attempted.
 * DNS resolution remains a host adapter concern and is never performed silently.
 */
export function assertpublicurl(value, options = {}) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new TypeError("url protocol is not allowed");
  if (Array.isArray(options.allowedhosts) && options.allowedhosts.length > 0 && !options.allowedhosts.includes(url.hostname)) throw new Error("url host is not allowed");
  if (options.allowprivate) return url;
  if (privatehostname(url.hostname) || privateip(url.hostname)) throw new Error("private network target is not allowed");
  return url;
}

/** Checks a resolved address list through a caller supplied DNS resolver to reduce rebinding risk. */
export async function assertresolvedpublicurl(value, options = {}) {
  const url = assertpublicurl(value, options);
  if (typeof options.resolve !== "function" || options.allowprivate) return url;
  const addresses = await options.resolve(url.hostname);
  if (!Array.isArray(addresses) || addresses.length === 0) throw new Error("url host did not resolve to an address");
  for (const address of addresses) if (privateip(String(address)) || privatehostname(String(address))) throw new Error("resolved target is private");
  return url;
}

/** Validates a redirect chain as public and bounded before a caller follows it. */
export function assertredirectchain(values = [], options = {}) {
  const maxredirects = Number(options.maxredirects ?? 5);
  if (!Array.isArray(values) || values.length > maxredirects + 1) throw new Error("redirect chain exceeds configured limit");
  return values.map((value) => assertpublicurl(value, options).href);
}

/** Returns a non throwing boolean for validators and middleware. */
export function ispublicurl(value, options = {}) { try { assertpublicurl(value, options); return true; } catch { return false; } }

function privatehostname(hostname) { const value = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, ""); return value.endsWith(".local") || value.endsWith(".internal") || value.endsWith(".localhost") || value === "localhost" || value === "broadcasthost"; }
function privateip(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:") || normalized.startsWith("::ffff:")) return true;
  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [first, second] = parts;
  return first === 10 || first === 127 || first === 169 && second === 254 || first === 172 && second >= 16 && second <= 31 || first === 192 && second === 168;
}
