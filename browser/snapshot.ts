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

function normalizeelements(elements) {
  if (!Array.isArray(elements)) return [];
  return elements.slice(0, 500).map((element, index) => ({ ref: String(element?.ref ?? `e${index + 1}`), role: String(element?.role ?? "generic"), name: String(element?.name ?? "").trim().slice(0, 200), value: element?.value === undefined ? undefined : String(element.value).slice(0, 500), disabled: Boolean(element?.disabled) }));
}
