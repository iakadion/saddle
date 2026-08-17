// @ts-nocheck
/**
 * virtual browser contracts select remote browser capabilities without launching a browser or touching user state.
 */

import { executiondecision, executionrequest } from "../isolation/contracts.js";

const engines = new Set(["chromium", "gecko", "webkit", "custom"]);
const displays = new Set(["webrtc", "cdp", "webdriver", "remote-display", "custom"]);
const storages = new Set(["ephemeral", "caller-managed"]);
const receipts = new Set(["declared", "observed", "completed", "unknown"]);
const distributions = Object.freeze({
  chromium: new Set(["chromium", "chrome", "edge", "brave", "vivaldi", "opera", "ungoogled-chromium"]),
  gecko: new Set(["firefox", "tor-browser"]),
  webkit: new Set(["safari"]),
  custom: new Set(["saddle-browser", "custom"])
});

/** Creates a data-only request for a remote, adapter-owned browser session. */
export function virtualbrowserrequest(input = {}) {
  const engine = valid(input.engine, engines, "browser engine");
  const distribution = nonempty(input.distribution, "browser distribution");
  if (!distributions[engine].has(distribution)) throw new TypeError("browser distribution does not match engine");
  const display = valid(input.display ?? "webrtc", displays, "browser display transport");
  const storage = valid(input.storage ?? "ephemeral", storages, "browser storage policy");
  const execution = executionrequest({
    id: input.id,
    effect: "browser-session",
    target: "remote",
    source: input.source,
    budget: input.budget
  });
  return Object.freeze({
    version: 1,
    state: "requested",
    id: execution.id,
    engine,
    distribution,
    display,
    storage,
    execution,
    localaccess: Object.freeze({ browser: false, filesystem: false, storage: false, process: false }),
    effects: Object.freeze([])
  });
}

/** Evaluates a virtual browser request without contacting a runtime or provider. */
export function virtualbrowserdecision(input, configuration = {}) {
  const request = normalizerequest(input);
  const base = executiondecision(request.execution, configuration);
  const adapter = configuration.adapter ?? {};
  const supportedengines = list(adapter.engines);
  const supporteddistributions = list(adapter.distributions);
  const reasons = [...base.reasons];
  if (!supportedengines.includes(request.engine)) reasons.push("adapter-engine");
  if (!supporteddistributions.includes(request.distribution)) reasons.push("adapter-distribution");
  const allowed = reasons.length === 0;
  return Object.freeze({
    version: 1,
    request,
    state: allowed ? "caller-delegates" : "denied",
    reasons: Object.freeze([...new Set(reasons)].sort()),
    adapter: allowed ? Object.freeze({ owner: String(adapter.owner), engines: Object.freeze(supportedengines), distributions: Object.freeze(supporteddistributions) }) : null,
    effects: Object.freeze([])
  });
}

/** Projects an adapter handoff without launching a browser or transferring user state. */
export function virtualbrowserhandoff(input = {}) {
  const decision = virtualbrowserdecision(input.request, input.configuration);
  if (decision.state !== "caller-delegates") return Object.freeze({ version: 1, state: "browser-disabled", code: "VIRTUAL_BROWSER_POLICY_DENIED", decision, effects: Object.freeze([]) });
  return Object.freeze({ version: 1, state: "caller-delegates", code: "REMOTE_BROWSER_ADAPTER_REQUIRED", decision, effects: Object.freeze([]) });
}

/** Records declared or observed remote-browser capabilities without asserting isolation or trust. */
export function virtualbrowserreceipt(input = {}) {
  const request = normalizerequest(input.request ?? input);
  const state = valid(input.state ?? "declared", receipts, "browser receipt state");
  const adapterid = nonempty(input.adapterid, "browser adapter id");
  const image = nonempty(input.image, "browser image reference");
  return Object.freeze({
    version: 1,
    state,
    request,
    adapterid,
    image,
    capabilities: Object.freeze(list(input.capabilities)),
    effects: Object.freeze([])
  });
}

function list(value) { return [...new Set(Array.isArray(value) ? value.map((entry) => String(entry)) : [])].sort(); }
function normalizerequest(input) {
  if (input?.execution?.effect === "browser-session") return virtualbrowserrequest({ id: input.id, source: input.execution.source, engine: input.engine, distribution: input.distribution, display: input.display, storage: input.storage, budget: input.execution.budget });
  return virtualbrowserrequest(input);
}
function valid(value, collection, name) { const output = String(value ?? ""); if (!collection.has(output)) throw new TypeError(`${name} is invalid`); return output; }
function nonempty(value, name) { const output = String(value ?? ""); if (!output) throw new TypeError(`${name} is required`); return output; }
