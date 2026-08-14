/**
 * schema extraction accepts safe field descriptors and never evaluates source strings.
 */
export function extractwithschema(html, schema = {}, url) {
  const result = {};
  for (const [name, descriptor] of Object.entries(schema)) result[name] = extractfield(html, descriptor, url);
  return result;
}

/** Extracts schema fields with bounded payload and field-level source provenance. */
export function extractstructured(html, schema = {}, options = {}) {
  if (typeof html !== "string") throw new TypeError("structured extraction requires html text");
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) throw new TypeError("structured extraction requires a schema object");
  if (options.parser !== undefined && typeof options.parser !== "function") throw new TypeError("structured extraction parser must be a function");
  const sourceurl = String(options.url ?? "");
  const extractedat = String(options.extractedat ?? new Date(Number(options.now ?? Date.now())).toISOString());
  const maxbytes = normalizebound(options.maxbytes ?? 65536, "maxbytes");
  const parser = options.parser ?? ((input) => extractwithschema(input.html, input.schema, input.url));
  const values = parser({ html, schema, url: sourceurl });
  if (!values || typeof values !== "object" || Array.isArray(values)) throw new TypeError("structured extraction parser must return an object");
  const bounded = boundpayload(values, maxbytes);
  const provenance = Object.fromEntries(Object.entries(schema).map(([name, descriptor]) => [name, {
    sourceurl,
    selector: descriptorselector(descriptor),
    extractedat,
    truncated: bounded.truncated.includes(name)
  }]));
  return { version: 1, sourceurl, extractedat, values: bounded.values, provenance, bytes: bounded.bytes, maxbytes, truncated: bounded.truncated };
}

function extractfield(html, descriptor, url) {
  if (typeof descriptor === "function") return descriptor({ html, url });
  if (typeof descriptor === "string") return textfromselector(html, descriptor);
  if (!descriptor || typeof descriptor.selector !== "string") throw new TypeError("schema field requires selector or function");
  if (descriptor.selector === "title") return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
  const escaped = descriptor.selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const attribute = descriptor.attribute;
  const pattern = attribute ? new RegExp(`<[^>]+${escaped}[^>]*${attribute}=["']([^"']+)["'][^>]*>`, "i") : new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i");
  return pattern.exec(html)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null;
}

function textfromselector(html, selector) { return extractfield(html, { selector }); }

function descriptorselector(descriptor) { return typeof descriptor === "string" ? descriptor : typeof descriptor === "function" ? "function" : String(descriptor?.selector ?? "unknown"); }

function normalizebound(value, name) { const normalized = Number(value); if (!Number.isSafeInteger(normalized) || normalized <= 0) throw new RangeError(`${name} must be a positive safe integer`); return normalized; }

function boundpayload(values, maxbytes) {
  const bounded = {};
  const truncated = [];
  for (const [name, value] of Object.entries(values)) {
    const candidate = JSON.stringify({ ...bounded, [name]: value });
    if (byteLength(candidate) <= maxbytes) { bounded[name] = value; continue; }
    if (typeof value === "string") {
      const clipped = clipstring(value, (trial) => byteLength(JSON.stringify({ ...bounded, [name]: trial })) <= maxbytes);
      bounded[name] = clipped;
    } else {
      bounded[name] = null;
    }
    truncated.push(name);
  }
  const bytes = byteLength(JSON.stringify(bounded));
  if (bytes > maxbytes) throw new RangeError("structured extraction payload budget is too small");
  return { values: bounded, bytes, truncated };
}

function clipstring(value, fits) {
  let low = 0;
  let high = value.length;
  let result = "";
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = value.slice(0, middle);
    if (fits(candidate)) { result = candidate; low = middle + 1; } else high = middle - 1;
  }
  return result;
}

function byteLength(value) { return new TextEncoder().encode(String(value)).byteLength; }
