/**
 * working-set planning keeps host memory operations declarative and caller-executed.
 */

/** Validates a serializable working-set capacity budget. */
export function workingbudget(input = {}) {
  return Object.freeze({ maxbytes: limit(input.maxbytes, "working-set maxbytes"), maxentries: limit(input.maxentries, "working-set maxentries"), maxage: optionalnonnegative(input.maxage, "working-set maxage") });
}

/** Selects bounded working-set candidates without materializing data or probing a host. */
export function workingadmission(items, options = {}) {
  if (!Array.isArray(items)) throw new TypeError("working-set items must be an array");
  const budget = workingbudget(options.budget);
  const now = Number(options.now ?? Date.now());
  if (!Number.isFinite(now) || now < 0) throw new TypeError("working-set now is invalid");
  const policy = validpolicy(options.policy ?? "lru");
  const normalized = normalizeitems(items);
  const admitted = [];
  const deferred = [];
  let usedbytes = 0;
  for (const item of rank(normalized, policy)) {
    const expired = item.expiresat !== null && item.expiresat <= now;
    const overbytes = usedbytes + item.sizebytes > budget.maxbytes;
    const overentries = admitted.length >= budget.maxentries;
    if (expired || overbytes || overentries) deferred.push(Object.freeze({ ...item, reason: expired ? "expired" : overbytes ? "bytebudget" : "entrybudget" }));
    else { admitted.push(item); usedbytes += item.sizebytes; }
  }
  return Object.freeze({ version: 1, policy, budget, usedbytes, admitted: Object.freeze(admitted), deferred: Object.freeze(deferred) });
}

/** Produces a host bridge plan that an explicit privileged adapter may execute. */
export function bridgeplan(input = {}) {
  const operation = String(input.operation ?? "");
  if (!bridgeoperations.includes(operation)) throw new TypeError("working-set bridge operation is invalid");
  const sizebytes = positive(input.sizebytes, "working-set bridge sizebytes");
  const capabilities = new Set(Array.isArray(input.capabilities) ? input.capabilities.map((value) => String(value)) : []);
  const supported = capabilities.has(operation);
  return Object.freeze({ version: 1, operation, sizebytes, state: supported ? "caller-executes" : "unsupported", preconditions: Object.freeze(supported ? ["explicit-consent", "host-adapter", "rollback-plan", "capacity-check"] : []), cleanup: Object.freeze({ required: supported, owner: "caller" }) });
}

/** Validates a materialized object record without reading storage or the local filesystem. */
export function materializationrecord(input = {}) {
  const id = String(input.id ?? "");
  const sha256 = String(input.sha256 ?? "").toLowerCase();
  if (!id) throw new TypeError("working-set materialization id is required");
  if (!/^[a-f0-9]{64}$/.test(sha256)) throw new TypeError("working-set materialization sha256 is invalid");
  return Object.freeze({ version: 1, id, sha256, sizebytes: positive(input.sizebytes, "working-set materialization sizebytes"), tier: validtier(input.tier ?? "l3"), state: validstate(input.state ?? "planned"), createdat: nonnegative(input.createdat ?? Date.now(), "working-set materialization createdat") });
}

/** Tracks materialization transitions and emits caller-owned cleanup plans without deleting resources. */
export function materializationledger(input = {}) {
  const records = new Map();
  const clock = typeof input.clock === "function" ? input.clock : () => Date.now();
  function add(record) { const normalized = materializationrecord(record); if (records.has(normalized.id)) throw new TypeError(`working-set materialization id is duplicated: ${normalized.id}`); records.set(normalized.id, normalized); return normalized; }
  function transition(id, state) { const current = records.get(String(id)); if (!current) throw new TypeError("working-set materialization is unknown"); const next = validstate(state); if (!allowedtransition(current.state, next)) throw new TypeError(`working-set materialization transition is invalid: ${current.state} to ${next}`); const output = Object.freeze({ ...current, state: next, updatedat: nonnegative(clock(), "working-set materialization updatedat") }); records.set(output.id, output); return output; }
  function cleanupplan(id) { const current = records.get(String(id)); if (!current) throw new TypeError("working-set materialization is unknown"); return Object.freeze({ version: 1, id: current.id, sha256: current.sha256, state: "caller-cleans", reason: current.state === "cleaned" ? "already-cleaned" : "release-working-set" }); }
  return Object.freeze({ add, transition, cleanupplan, list: () => Object.freeze([...records.values()]) });
}

const bridgeoperations = Object.freeze(["temporaryfile", "mmap", "tmpfs", "zram", "swap"]);
const policies = new Set(["lru", "sizeaware", "ttlfirst"]);
const tiers = new Set(["l1", "l2", "l3", "l4"]);
const states = new Set(["planned", "prepared", "verified", "released", "cleaned", "failed"]);

function normalizeitems(input) {
  const ids = new Set();
  return input.map((value, index) => {
    const id = String(value?.id ?? "");
    if (!id || ids.has(id)) throw new TypeError("working-set item id must be unique");
    ids.add(id);
    return Object.freeze({ id, sizebytes: positive(value.sizebytes, "working-set item sizebytes"), priority: Number(value.priority ?? 0), lastusedat: nonnegative(value.lastusedat ?? 0, "working-set item lastusedat"), expiresat: value.expiresat === undefined ? null : nonnegative(value.expiresat, "working-set item expiresat"), index });
  });
}

function rank(items, policy) {
  return [...items].sort((left, right) => {
    if (right.priority !== left.priority) return right.priority - left.priority;
    if (policy === "lru" && right.lastusedat !== left.lastusedat) return right.lastusedat - left.lastusedat;
    if (policy === "sizeaware" && left.sizebytes !== right.sizebytes) return left.sizebytes - right.sizebytes;
    if (policy === "ttlfirst" && (left.expiresat ?? Infinity) !== (right.expiresat ?? Infinity)) return (left.expiresat ?? Infinity) - (right.expiresat ?? Infinity);
    return left.index - right.index;
  });
}

function limit(value, name) { return value === undefined ? Infinity : nonnegative(value, name); }
function positive(value, name) { const numeric = nonnegative(value, name); if (numeric < 1) throw new TypeError(`${name} must be positive`); return numeric; }
function nonnegative(value, name) { const numeric = Number(value); if (!Number.isSafeInteger(numeric) || numeric < 0) throw new TypeError(`${name} must be a non-negative safe integer`); return numeric; }
function optionalnonnegative(value, name) { return value === undefined ? null : nonnegative(value, name); }
function validpolicy(value) { if (!policies.has(value)) throw new TypeError("working-set policy is invalid"); return value; }
function validtier(value) { if (!tiers.has(value)) throw new TypeError("working-set tier is invalid"); return value; }
function validstate(value) { if (!states.has(value)) throw new TypeError("working-set materialization state is invalid"); return value; }
function allowedtransition(current, next) { if (next === "failed") return current !== "cleaned"; return new Set(["planned:prepared", "prepared:verified", "verified:released", "released:cleaned"]).has(`${current}:${next}`); }
