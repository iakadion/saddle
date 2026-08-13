/**
 * persistent queue stores job state in a caller selected file.
 * running items return to queued when a process restores after a crash.
 */
import { readFile, writeFile } from "node:fs/promises";

/** Creates a crash recoverable queue with idempotent item identifiers. */
export function persistentqueue(options = {}) {
  if (!options.path) throw new TypeError("persistent queue requires path");
  const maxattempts = options.maxattempts ?? 3;
  let state = { version: 1, items: [] };
  let loaded = false;

  /** Reads the queue once and returns running jobs to the waiting state. */
  async function restore() {
    if (loaded) return state;
    try { state = JSON.parse(await readFile(options.path, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
    for (const item of state.items ?? []) if (item.status === "running") item.status = "queued";
    state.items ??= [];
    loaded = true;
    await persist();
    return state;
  }

  /** Appends a queued job and persists the new state. */
  async function enqueue(payload, metadata = {}) { await restore(); const id = metadata.id ?? `persistentjob${Date.now()}${state.items.length}`; if (state.items.some((item) => item.id === id)) return state.items.find((item) => item.id === id); const item = { id, payload, status: "queued", attempts: 0, createdat: Date.now(), updatedat: Date.now(), metadata }; state.items.push(item); await persist(); return { ...item }; }

  /** Claims the first queued job with stable ordering. */
  async function claim() { await restore(); const item = state.items.find((entry) => entry.status === "queued"); if (!item) return null; item.status = "running"; item.attempts += 1; item.updatedat = Date.now(); await persist(); return { ...item }; }

  /** Commits a successful result. */
  async function complete(id, result) { await restore(); const item = find(id); item.status = "completed"; item.result = result; item.updatedat = Date.now(); await persist(); return { ...item }; }

  /** Records an error and either retries or closes the item as failed. */
  async function fail(id, error) { await restore(); const item = find(id); item.error = { message: error?.message ?? String(error), code: error?.code }; item.status = item.attempts < maxattempts && error?.retryable !== false ? "queued" : "failed"; item.updatedat = Date.now(); await persist(); return { ...item }; }

  /** Lists queue items for status and diagnostics. */
  async function list(filter) { await restore(); return state.items.filter((item) => !filter || item.status === filter).map((item) => ({ ...item })); }

  return { restore, enqueue, claim, complete, fail, list };

  function find(id) { const item = state.items.find((entry) => entry.id === id); if (!item) throw new Error(`persistent queue item not found: ${id}`); return item; }
  async function persist() { await writeFile(options.path, `${JSON.stringify(state, null, 2)}\n`, "utf8"); }
}
