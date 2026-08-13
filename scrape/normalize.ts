/**
 * content normalization classifies bounded response bytes without owning a parser, transport or storage backend.
 */

const extensions = Object.freeze({
  ".json": "application/json",
  ".map": "application/json",
  ".xml": "application/xml",
  ".rss": "application/rss+xml",
  ".atom": "application/atom+xml",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".txt": "text/plain",
  ".csv": "text/csv"
});

/** Detects a normalized media type from a header, URL suffix or caller fallback. */
export function detectcontenttype(header, url, fallback = "application/octet-stream") {
  const value = String(header ?? "").split(";", 1)[0].trim().toLowerCase();
  if (value) return value;
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const suffix = Object.keys(extensions).find((extension) => pathname.endsWith(extension));
    if (suffix) return extensions[suffix];
  } catch { /* invalid or absent URLs remain caller-owned metadata */ }
  return String(fallback).toLowerCase();
}

/** Normalizes bounded input bytes into a serializable text, JSON or binary result. */
export function normalizeresult(input, options = {}) {
  const contenttype = detectcontenttype(options.contenttype, options.url, options.defaultcontenttype ?? "application/octet-stream");
  const bytes = tobytes(input);
  const maxbytes = boundedlimit(options.maxbytes, 2_000_000);
  if (bytes.byteLength > maxbytes) throw normalizationerror("CONTENT_TOO_LARGE", `content exceeds ${maxbytes} bytes`);
  const kind = contentkind(contenttype);
  if (kind === "binary") return { contenttype, kind, size: bytes.byteLength, bytes };
  const text = new TextDecoder(options.charset ?? "utf-8", { fatal: false }).decode(bytes).replaceAll("\r\n", "\n");
  if (text.length > boundedlimit(options.maxtext, maxbytes)) throw normalizationerror("TEXT_TOO_LARGE", "decoded content exceeds the configured text limit");
  if (kind === "json") {
    try { return { contenttype, kind, size: bytes.byteLength, content: text, data: JSON.parse(text) }; } catch (error) { throw normalizationerror("INVALID_JSON", `invalid JSON content: ${error.message}`); }
  }
  return { contenttype, kind, size: bytes.byteLength, content: text };
}

/** Reads a caller-provided response body after checking declared and actual size limits. */
export async function normalizeresponse(response, options = {}) {
  if (!response || typeof response !== "object") throw new TypeError("response is required");
  const headers = response.headers;
  const header = typeof headers?.get === "function" ? headers.get("content-type") : headers?.["content-type"];
  const declared = Number(typeof headers?.get === "function" ? headers.get("content-length") : headers?.["content-length"]);
  const maxbytes = boundedlimit(options.maxbytes, 2_000_000);
  if (Number.isFinite(declared) && declared > maxbytes) throw normalizationerror("CONTENT_TOO_LARGE", `content exceeds ${maxbytes} bytes`);
  const body = typeof response.arrayBuffer === "function" ? await response.arrayBuffer() : await response.text();
  return normalizeresult(body, { ...options, contenttype: header ?? options.contenttype, url: options.url ?? response.url });
}

function contentkind(contenttype) {
  if (contenttype === "application/json" || contenttype.endsWith("+json")) return "json";
  if (contenttype === "text/html" || contenttype === "application/xhtml+xml") return "html";
  if (contenttype === "application/xml" || contenttype === "text/xml" || contenttype.endsWith("+xml")) return "xml";
  if (contenttype === "text/markdown") return "markdown";
  if (contenttype.startsWith("text/")) return "text";
  return "binary";
}

function tobytes(input) {
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new TypeError("content must be a string, ArrayBuffer or typed array");
}

function boundedlimit(value, fallback) {
  const limit = Number(value ?? fallback);
  if (!Number.isSafeInteger(limit) || limit < 1) throw new TypeError("content limit must be a positive safe integer");
  return limit;
}

function normalizationerror(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
