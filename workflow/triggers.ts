/**
 * workflow triggers normalize manual, event, schedule and retry starts without binding a forge.
 */

export const triggernames = Object.freeze(["manual", "dispatch", "webhook", "schedule", "retry", "heartbeat"]);

/** Validates and normalizes a trigger declaration. */
export function workflowtriggers(value = ["manual"]) {
  const list = Array.isArray(value) ? value : [value];
  if (list.length === 0 || list.some((name) => !triggernames.includes(name))) throw new TypeError("workflow trigger is unsupported");
  return [...new Set(list)];
}

/** Matches a workflow trigger against an incoming event without executing it. */
export function triggermatch(manifest, event = {}) {
  const triggers = workflowtriggers(manifest?.trigger);
  const type = String(event.type ?? "manual");
  if (!triggers.includes(type)) return { matched: false, type, reason: "trigger-not-declared" };
  if (type === "schedule" && event.at !== undefined && Number(event.at) > Date.now()) return { matched: false, type, reason: "not-due" };
  return { matched: true, type, requestid: event.requestid ?? `${manifest.name}/${type}/${event.id ?? Date.now()}` };
}

/** Keeps trigger declarations and produces deterministic matching results. */
export function triggerregistry() {
  const values = new Map();
  function register(manifest) { if (!manifest?.name) throw new TypeError("trigger manifest requires name"); const normalized = { ...manifest, trigger: workflowtriggers(manifest.trigger) }; values.set(normalized.name, normalized); return normalized; }
  function get(name) { return values.get(name); }
  function match(name, event) { const manifest = get(name); if (!manifest) throw new Error(`workflow not found: ${name}`); return triggermatch(manifest, event); }
  function list() { return [...values.values()].map((manifest) => ({ ...manifest, trigger: [...manifest.trigger] })); }
  return { register, get, match, list };
}
