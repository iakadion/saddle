/**
 * provider chains rank caller-authorized execution candidates without dispatching remote work.
 */

/** Creates a stable provider chain over declarative capability reports. */
export function providerchain(input = {}) {
  const providers = normalizeproviders(input.providers);
  return Object.freeze({ select(request = {}) { return selectprovider(providers, request); }, dispatchplan(request = {}) { const selection = selectprovider(providers, request); return Object.freeze({ version: 1, state: "caller-dispatches", provider: selection.selected, request: normalizerequest(request), rejected: selection.rejected }); }, providers: () => providers.map((provider) => ({ ...provider, capabilities: [...provider.capabilities] })) });
}

/** Selects the first eligible provider under stable priority and returns every exclusion reason. */
export function selectprovider(providers, request = {}) {
  const normalized = normalizeproviders(providers);
  const required = normalizerequest(request);
  const rejected = [];
  const accepted = [];
  for (const provider of normalized) {
    const reasons = eligibility(provider, required);
    if (reasons.length) rejected.push(Object.freeze({ id: provider.id, reasons: Object.freeze(reasons) }));
    else accepted.push(provider);
  }
  if (accepted.length === 0) throw chainerror("PROVIDER_CHAIN_UNAVAILABLE", "provider chain has no eligible providers", { request: required, rejected });
  accepted.sort((left, right) => preferenceindex(required.preferredids, left.id) - preferenceindex(required.preferredids, right.id) || left.priority - right.priority || left.id.localeCompare(right.id));
  const selected = accepted[0];
  return Object.freeze({ version: 1, selected: describe(selected), rejected: Object.freeze(rejected), request: required });
}

/** Produces a verified runner-to-storage handoff record without writing an artifact. */
export function artifacthandoff(input = {}) {
  const key = nonempty(input.key, "artifact handoff key");
  const sha256 = digest(input.sha256, "artifact handoff sha256");
  const providerid = nonempty(input.providerid, "artifact handoff providerid");
  const retention = nonempty(input.retention, "artifact handoff retention");
  return Object.freeze({ version: 1, key, sha256, sizebytes: positive(input.sizebytes, "artifact handoff sizebytes"), providerid, retention, state: "caller-transfers" });
}

/** Creates a cancellation intent without claiming that a remote runner has stopped or cleaned up. */
export function cancellationplan(input = {}) {
  const runid = nonempty(input.runid, "provider cancellation runid");
  const providerid = nonempty(input.providerid, "provider cancellation providerid");
  const reason = nonempty(input.reason ?? "caller-requested", "provider cancellation reason");
  return Object.freeze({ version: 1, runid, providerid, reason, state: "caller-cancels", remotestate: "unknown", compensation: input.compensation === true ? "caller-evaluates" : "not-requested" });
}

/** Renders a caller-dispatches plan through an injected forge adapter without sending it. */
export async function renderdispatch(plan, adapter) {
  if (plan?.state !== "caller-dispatches") throw new TypeError("provider dispatch plan is invalid");
  if (typeof adapter?.render !== "function") throw chainerror("PROVIDER_DISPATCH_RENDER_UNAVAILABLE", "provider dispatch render adapter is required");
  return adapter.render(Object.freeze({ ...plan }));
}

function normalizeproviders(input) {
  if (!Array.isArray(input) || input.length === 0) throw new TypeError("provider chain providers must be a non-empty array");
  const ids = new Set();
  return Object.freeze(input.map((value, index) => {
    const id = nonempty(value?.id, "provider chain provider id");
    if (ids.has(id)) throw new TypeError(`provider chain provider id is duplicated: ${id}`);
    ids.add(id);
    const status = String(value.status ?? "available");
    if (!new Set(["available", "busy", "offline", "disabled"]).has(status)) throw new TypeError(`provider chain provider status is invalid: ${id}`);
    return Object.freeze({ id, priority: nonnegative(value.priority ?? index, "provider chain provider priority"), status, capabilities: Object.freeze(unique(value.capabilities ?? [], "provider chain capability")), architecture: optionalword(value.architecture, "provider chain provider architecture"), operatingSystem: optionalword(value.operatingSystem, "provider chain provider operating system"), networkpolicy: policy(value.networkpolicy ?? "caller", "provider chain network policy"), storagepolicy: policy(value.storagepolicy ?? "caller", "provider chain storage policy"), cpu: nonnegative(value.cpu ?? 0, "provider chain provider cpu"), memorybytes: nonnegative(value.memorybytes ?? 0, "provider chain provider memorybytes"), maxmilliseconds: nonnegative(value.maxmilliseconds ?? 0, "provider chain provider maxmilliseconds") });
  }).sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id)));
}

function normalizerequest(input) { return Object.freeze({ capabilities: Object.freeze(unique(input.capabilities ?? [], "provider chain requested capability")), preferredids: Object.freeze(unique(input.preferredids ?? [], "provider chain preferred id")), architecture: optionalword(input.architecture, "provider chain requested architecture"), operatingSystem: optionalword(input.operatingSystem, "provider chain requested operating system"), networkpolicy: input.networkpolicy === undefined ? null : policy(input.networkpolicy, "provider chain requested network policy"), storagepolicy: input.storagepolicy === undefined ? null : policy(input.storagepolicy, "provider chain requested storage policy"), mincpu: nonnegative(input.mincpu ?? 0, "provider chain minimum cpu"), minmemorybytes: nonnegative(input.minmemorybytes ?? 0, "provider chain minimum memorybytes"), minmilliseconds: nonnegative(input.minmilliseconds ?? 0, "provider chain minimum milliseconds") }); }
function eligibility(provider, request) { const reasons = []; if (provider.status !== "available") reasons.push(`status:${provider.status}`); for (const capability of request.capabilities) if (!provider.capabilities.includes(capability)) reasons.push(`capability:${capability}`); if (request.architecture && provider.architecture !== request.architecture) reasons.push("architecture"); if (request.operatingSystem && provider.operatingSystem !== request.operatingSystem) reasons.push("operatingSystem"); if (request.networkpolicy && provider.networkpolicy !== request.networkpolicy) reasons.push("networkpolicy"); if (request.storagepolicy && provider.storagepolicy !== request.storagepolicy) reasons.push("storagepolicy"); if (provider.cpu < request.mincpu) reasons.push("cpu"); if (provider.memorybytes < request.minmemorybytes) reasons.push("memorybytes"); if (provider.maxmilliseconds < request.minmilliseconds) reasons.push("maxmilliseconds"); return reasons; }
function describe(provider) { return Object.freeze({ id: provider.id, priority: provider.priority, capabilities: Object.freeze([...provider.capabilities]), architecture: provider.architecture, operatingSystem: provider.operatingSystem, networkpolicy: provider.networkpolicy, storagepolicy: provider.storagepolicy, cpu: provider.cpu, memorybytes: provider.memorybytes, maxmilliseconds: provider.maxmilliseconds }); }
function unique(input, name) { if (!Array.isArray(input)) throw new TypeError(`${name} values must be an array`); return [...new Set(input.map((value) => nonempty(value, name)))].sort(); }
function nonempty(value, name) { const output = String(value ?? ""); if (!output) throw new TypeError(`${name} is required`); return output; }
function optionalword(value, name) { if (value === undefined || value === null || value === "") return null; return nonempty(value, name); }
function policy(value, name) { const output = String(value); if (!new Set(["caller", "restricted", "isolated", "none"]).has(output)) throw new TypeError(`${name} is invalid`); return output; }
function preferenceindex(preferredids, id) { const index = preferredids.indexOf(id); return index === -1 ? Number.MAX_SAFE_INTEGER : index; }
function nonnegative(value, name) { const numeric = Number(value); if (!Number.isSafeInteger(numeric) || numeric < 0) throw new TypeError(`${name} must be a non-negative safe integer`); return numeric; }
function positive(value, name) { const numeric = nonnegative(value, name); if (numeric < 1) throw new TypeError(`${name} must be positive`); return numeric; }
function digest(value, name) { const output = String(value ?? "").toLowerCase(); if (!/^[a-f0-9]{64}$/.test(output)) throw new TypeError(`${name} is invalid`); return output; }
function chainerror(code, message, detail) { const error = new Error(message); error.code = code; error.detail = detail; return error; }
