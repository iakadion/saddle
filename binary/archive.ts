/**
 * archive inspection validates declared entry metadata before any caller-owned extraction adapter runs.
 */

/** Validates portable archive limits without opening an archive. */
export function archivelimits(input = {}) {
  return Object.freeze({ maxentries: positive(input.maxentries ?? 1, "archive maxentries"), maxdepth: positive(input.maxdepth ?? 1, "archive maxdepth"), maxoutputbytes: positive(input.maxoutputbytes ?? 1, "archive maxoutputbytes"), maxratio: positive(input.maxratio ?? 1, "archive maxratio") });
}

/** Inspects declared archive entries and returns explicit acceptance or denial evidence. */
export function archiveinspection(input = {}) {
  const limits = archivelimits(input.limits);
  if (!Array.isArray(input.entries)) throw new TypeError("archive entries must be an array");
  const entries = input.entries.map((entry) => normalizeentry(entry));
  const reasons = [];
  if (entries.length > limits.maxentries) reasons.push("entrycount");
  let outputbytes = 0;
  for (const entry of entries) {
    outputbytes += entry.sizebytes;
    if (entry.depth > limits.maxdepth) reasons.push(`depth:${entry.path}`);
    if (entry.path.split("/").includes("..") || entry.path.startsWith("/")) reasons.push(`path:${entry.path}`);
    if (entry.sizebytes / Math.max(1, entry.compressedbytes) > limits.maxratio) reasons.push(`ratio:${entry.path}`);
  }
  if (outputbytes > limits.maxoutputbytes) reasons.push("outputbytes");
  return Object.freeze({ version: 1, state: reasons.length === 0 ? "accepted" : "denied", limits, entries: Object.freeze(entries), outputbytes, reasons: Object.freeze([...new Set(reasons)]) });
}

/** Requires a caller-owned extraction adapter and denies an unsafe inspection result. */
export async function extractarchive(inspection, adapter) {
  if (inspection?.state !== "accepted") throw archiveerror("ARCHIVE_POLICY_DENIED", "archive inspection must be accepted before extraction");
  if (typeof adapter?.extract !== "function") throw archiveerror("ARCHIVE_EXTRACTION_UNAVAILABLE", "archive extraction adapter is required");
  return adapter.extract(inspection);
}

function normalizeentry(input) { const path = String(input?.path ?? ""); if (!path) throw new TypeError("archive entry path is required"); return Object.freeze({ path, sizebytes: nonnegative(input.sizebytes, "archive entry sizebytes"), compressedbytes: nonnegative(input.compressedbytes, "archive entry compressedbytes"), depth: path.split("/").filter(Boolean).length }); }
function nonnegative(value, name) { const output = Number(value); if (!Number.isSafeInteger(output) || output < 0) throw new TypeError(`${name} must be a non-negative safe integer`); return output; }
function positive(value, name) { const output = nonnegative(value, name); if (output < 1) throw new TypeError(`${name} must be positive`); return output; }
function archiveerror(code, message) { const error = new Error(message); error.code = code; return error; }
