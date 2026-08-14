/**
 * browser snapshots turn page state into bounded serializable data with stable references.
 */

/** Creates a validated page snapshot for browser, MCP and extension adapters. */
export function pagesnapshot(input = {}) {
  if (!input || typeof input !== "object") throw new TypeError("page snapshot must be an object");
  const snapshot = {
    version: 1,
    snapshotid: String(input.snapshotid ?? `snapshot${Date.now().toString(36)}`),
    tabid: input.tabid === undefined ? undefined : String(input.tabid),
    frameid: input.frameid === undefined ? undefined : String(input.frameid),
    url: String(input.url ?? ""),
    title: String(input.title ?? ""),
    text: String(input.text ?? "").slice(0, input.maxtext ?? 100000),
    elements: normalizeelements(input.elements)
  };
  if (!snapshot.snapshotid || !snapshot.url) throw new TypeError("page snapshot requires snapshotid and url");
  return snapshot;
}

/** Creates an element reference bound to a snapshot and browser context. */
export function snapshotref(snapshot, input = {}) {
  const current = pagesnapshot(snapshot);
  const ref = String(input.ref ?? "");
  if (!current.elements.some((element) => element.ref === ref)) throw new TypeError(`snapshot reference not found: ${ref}`);
  return { version: 1, snapshotid: current.snapshotid, tabid: current.tabid, frameid: current.frameid, ref };
}

/** Throws a stable error when an action uses a reference from a previous page state. */
export function assertfreshsnapshot(snapshot, reference) {
  const current = pagesnapshot(snapshot);
  if (!reference || reference.snapshotid !== current.snapshotid || (reference.tabid !== undefined && reference.tabid !== current.tabid) || (reference.frameid !== undefined && reference.frameid !== current.frameid)) {
    const error = new Error("browser snapshot is stale");
    error.code = "STALE_SNAPSHOT";
    error.retryable = true;
    throw error;
  }
  return true;
}

/** Computes additions, removals and changed labels between two snapshots. */
export function snapshotdiff(previous, current) {
  const before = pagesnapshot(previous);
  const after = pagesnapshot(current);
  const oldmap = new Map(before.elements.map((element) => [element.ref, element]));
  const newmap = new Map(after.elements.map((element) => [element.ref, element]));
  const added = after.elements.filter((element) => !oldmap.has(element.ref));
  const removed = before.elements.filter((element) => !newmap.has(element.ref));
  const changed = after.elements.filter((element) => oldmap.has(element.ref) && JSON.stringify(oldmap.get(element.ref)) !== JSON.stringify(element));
  return { from: before.snapshotid, to: after.snapshotid, added, removed, changed };
}

/** Projects a page snapshot into a byte-bounded, allowlisted browser context. */
export function projectcontext(snapshot, options = {}) {
  const current = pagesnapshot(snapshot);
  const maxbytes = normalizebudget(options.maxbytes ?? 32768);
  const allowed = normalizefields(options.fields ?? options.allowlist);
  const context = { snapshotid: current.snapshotid };
  const truncated = [];
  for (const field of allowed) {
    if (field === "snapshotid") continue;
    const value = current[field];
    if (value === undefined) continue;
    if (field === "elements") {
      const elements = [];
      for (const element of value) {
        if (fitscontext(context, field, [...elements, element], maxbytes)) elements.push(element);
        else { truncated.push("elements"); break; }
      }
      if (fitscontext(context, field, elements, maxbytes)) context[field] = elements;
      else truncated.push("elements");
      continue;
    }
    if (fitscontext(context, field, value, maxbytes)) { context[field] = value; continue; }
    if (typeof value === "string") context[field] = clipcontextstring(context, field, value, maxbytes);
    else truncated.push(field);
    if (typeof value === "string" && context[field].length < value.length) truncated.push(field);
  }
  const bytes = contextbytes(context);
  if (bytes > maxbytes) throw new RangeError("browser context budget is smaller than stable snapshot identity");
  return { version: 1, snapshotid: current.snapshotid, context, fields: Object.keys(context), bytes, maxbytes, truncated: [...new Set(truncated)] };
}

function normalizeelements(elements) {
  if (!Array.isArray(elements)) return [];
  return elements.slice(0, 500).map((element, index) => ({ ref: String(element?.ref ?? `e${index + 1}`), role: String(element?.role ?? "generic"), name: String(element?.name ?? "").trim().slice(0, 200), value: element?.value === undefined ? undefined : String(element.value).slice(0, 500), disabled: Boolean(element?.disabled) }));
}

const snapshotfields = Object.freeze(["snapshotid", "tabid", "frameid", "url", "title", "text", "elements"]);

function normalizefields(fields) {
  if (fields === undefined) return [...snapshotfields];
  if (!Array.isArray(fields) || fields.length === 0) throw new TypeError("browser context fields must be a non-empty array");
  const normalized = [...new Set(fields.map((field) => String(field)))];
  if (normalized.some((field) => !snapshotfields.includes(field))) throw new TypeError("browser context field is not allowlisted");
  return normalized;
}

function normalizebudget(value) { const normalized = Number(value); if (!Number.isSafeInteger(normalized) || normalized <= 0) throw new RangeError("browser context maxbytes must be a positive safe integer"); return normalized; }

function contextbytes(value) { return new TextEncoder().encode(JSON.stringify(value)).byteLength; }

function fitscontext(context, field, value, maxbytes) { return contextbytes({ ...context, [field]: value }) <= maxbytes; }

function clipcontextstring(context, field, value, maxbytes) {
  let low = 0;
  let high = value.length;
  let result = "";
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = value.slice(0, middle);
    if (fitscontext(context, field, candidate, maxbytes)) { result = candidate; low = middle + 1; } else high = middle - 1;
  }
  return result;
}
