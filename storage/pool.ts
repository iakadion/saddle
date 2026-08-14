/**
 * storage pools combine caller-owned adapters without selecting a provider or creating background work.
 */
import { collectbytes, sha256 } from "./checksum.js";
import { storagecapabilities } from "./sync.js";

/** Creates a deterministic pool over explicit caller-owned storage adapters. */
export function storagepool(options = {}) {
  const members = normalizemembers(options.members);
  const clock = typeof options.clock === "function" ? options.clock : () => Date.now();
  const metrics = { reads: 0, writes: 0, hits: 0, misses: 0, mismatches: 0, bytes: 0, attempts: 0, elapsedms: 0 };

  async function read(key, options = {}) {
    const normalizedkey = requiredkey(key);
    const expectedsha = optionalsha(options.sha256);
    const attempts = [];
    const startedat = Number(clock());
    const selected = selectable(members, options.memberids);
    const budget = operationbudget(options.budget, selected.length);
    metrics.reads += 1;
    for (const member of selected.slice(0, budget.maxattempts)) {
      if (options.signal?.aborted) throw poolerror("STORAGE_POOL_ABORTED", "storage pool read was aborted", { key: normalizedkey, attempts });
      if (elapsed(clock, startedat) > budget.maxmilliseconds) throw poolerror("STORAGE_POOL_TIME_BUDGET", "storage pool read time budget was exceeded", { key: normalizedkey, attempts });
      try {
        metrics.attempts += 1;
        const manifest = await optionalhead(member.storage, normalizedkey);
        const raw = await member.storage.get(normalizedkey);
        const data = await collectbytes(raw?.data ?? raw);
        if (data.byteLength > budget.maxbytes) throw poolerror("STORAGE_POOL_BYTE_BUDGET", "storage pool read byte budget was exceeded", { key: normalizedkey, memberid: member.id, maxbytes: budget.maxbytes, sizebytes: data.byteLength });
        const actualsha = sha256(data);
        const requiredsha = expectedsha ?? manifest?.sha256;
        if (requiredsha && actualsha !== requiredsha) {
          metrics.mismatches += 1;
          throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool read digest did not match", { key: normalizedkey, memberid: member.id, expectedsha: requiredsha, actualsha });
        }
        metrics.hits += 1;
        metrics.bytes += data.byteLength;
        metrics.elapsedms += elapsed(clock, startedat);
        return Object.freeze({ version: 1, key: normalizedkey, memberid: member.id, data, sha256: actualsha, verified: Boolean(requiredsha), manifest: manifest ?? null, attempts: Object.freeze(attempts), budget, readat: Number(clock()) });
      } catch (error) { attempts.push(attempt(member.id, error)); }
    }
    metrics.misses += 1;
    metrics.elapsedms += elapsed(clock, startedat);
    throw poolerror("STORAGE_POOL_READ_FAILED", "storage pool could not read a verified object", { key: normalizedkey, attempts });
  }

  async function put(input = {}, options = {}) {
    const key = requiredkey(input.key);
    const data = await collectbytes(input.data);
    const digest = sha256(data);
    const selected = selectable(members, options.memberids);
    const budget = operationbudget(options.budget, selected.length);
    if (data.byteLength > budget.maxbytes) throw poolerror("STORAGE_POOL_BYTE_BUDGET", "storage pool write byte budget was exceeded", { key, maxbytes: budget.maxbytes, sizebytes: data.byteLength });
    const quorum = positiveinteger(options.quorum ?? 1, "storage pool quorum");
    if (quorum > selected.length) throw new RangeError("storage pool quorum exceeds selected members");
    const results = [];
    metrics.writes += 1;
    const startedat = Number(clock());
    for (const member of selected.slice(0, budget.maxattempts)) {
      if (options.signal?.aborted) { results.push({ memberid: member.id, state: "skipped", code: "STORAGE_POOL_ABORTED" }); break; }
      if (elapsed(clock, startedat) > budget.maxmilliseconds) { results.push({ memberid: member.id, state: "skipped", code: "STORAGE_POOL_TIME_BUDGET" }); break; }
      try {
        metrics.attempts += 1;
        const manifest = await member.storage.put({ ...input, key, data: new Uint8Array(data), metadata: { ...(input.metadata ?? {}), sha256: digest } });
        if (manifest?.sha256 && manifest.sha256 !== digest) throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool write digest did not match", { key, memberid: member.id, expectedsha: digest, actualsha: manifest.sha256 });
        results.push({ memberid: member.id, state: "written", manifest: manifest ?? null });
      } catch (error) { results.push({ memberid: member.id, state: "failed", code: error?.code ?? "STORAGE_POOL_WRITE_FAILED", message: String(error?.message ?? error) }); }
    }
    const written = results.filter((result) => result.state === "written");
    metrics.bytes += data.byteLength * written.length;
    metrics.elapsedms += elapsed(clock, startedat);
    const output = Object.freeze({ version: 1, key, sha256: digest, sizebytes: data.byteLength, quorum, state: written.length === selected.length ? "complete" : "partial", results: Object.freeze(results), written: written.length, budget, writtenat: Number(clock()) });
    if (written.length < quorum) throw poolerror("STORAGE_POOL_QUORUM_FAILED", "storage pool write quorum was not met", output);
    return output;
  }

  async function readrange(key, start, end, options = {}) {
    const normalizedkey = requiredkey(key);
    const range = validrange(start, end);
    const expectedsha = optionalsha(options.sha256);
    const attempts = [];
    const selected = selectable(members, options.memberids);
    const budget = operationbudget(options.budget, selected.length);
    const startedat = Number(clock());
    metrics.reads += 1;
    for (const member of selected.slice(0, budget.maxattempts)) {
      if (options.signal?.aborted) throw poolerror("STORAGE_POOL_ABORTED", "storage pool range read was aborted", { key: normalizedkey, range, attempts });
      if (elapsed(clock, startedat) > budget.maxmilliseconds) throw poolerror("STORAGE_POOL_TIME_BUDGET", "storage pool range read time budget was exceeded", { key: normalizedkey, range, attempts });
      if (typeof member.storage.getrange !== "function") { attempts.push({ memberid: member.id, code: "STORAGE_POOL_RANGE_UNSUPPORTED", message: "storage pool member does not support range reads" }); continue; }
      try {
        metrics.attempts += 1;
        const data = await collectbytes(await member.storage.getrange(normalizedkey, range.start, range.end));
        if (data.byteLength !== range.end - range.start) throw poolerror("STORAGE_POOL_RANGE_SIZE", "storage pool range result size did not match", { key: normalizedkey, range, memberid: member.id, sizebytes: data.byteLength });
        const actualsha = sha256(data);
        if (expectedsha && actualsha !== expectedsha) throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool range digest did not match", { key: normalizedkey, range, memberid: member.id, expectedsha, actualsha });
        metrics.hits += 1;
        metrics.bytes += data.byteLength;
        metrics.elapsedms += elapsed(clock, startedat);
        return Object.freeze({ version: 1, key: normalizedkey, range, memberid: member.id, data, sha256: actualsha, verified: Boolean(expectedsha), attempts: Object.freeze(attempts), budget, readat: Number(clock()) });
      } catch (error) { attempts.push(attempt(member.id, error)); }
    }
    metrics.misses += 1;
    metrics.elapsedms += elapsed(clock, startedat);
    throw poolerror("STORAGE_POOL_RANGE_FAILED", "storage pool could not read the requested range", { key: normalizedkey, range, attempts });
  }

  function repairplan(key, options = {}) {
    const normalizedkey = requiredkey(key);
    const sourceid = String(options.sourceid ?? "");
    if (!members.some((member) => member.id === sourceid)) throw new TypeError("storage pool repair source member is unknown");
    return Object.freeze({ version: 1, key: normalizedkey, sourceid, sha256: optionalsha(options.sha256), targets: selectable(members, options.memberids).filter((member) => member.id !== sourceid).map((member) => member.id), action: "caller-executes" });
  }

  return Object.freeze({ read, readrange, put, repairplan, members: () => members.map(describe), capabilities: () => members.map((member) => ({ id: member.id, priority: member.priority, capabilities: storagecapabilities(member.storage) })), metrics: () => ({ ...metrics }) });
}

function normalizemembers(input) {
  if (!Array.isArray(input) || input.length === 0) throw new TypeError("storage pool members must be a non-empty array");
  const ids = new Set();
  const members = input.map((value, index) => {
    const id = String(value?.id ?? "");
    if (!id) throw new TypeError("storage pool member id is required");
    if (ids.has(id)) throw new TypeError(`storage pool member id is duplicated: ${id}`);
    ids.add(id);
    if (typeof value?.storage?.get !== "function" || typeof value?.storage?.put !== "function") throw new TypeError(`storage pool member requires get and put: ${id}`);
    const priority = Number(value.priority ?? index);
    if (!Number.isFinite(priority)) throw new TypeError(`storage pool member priority is invalid: ${id}`);
    return Object.freeze({ id, storage: value.storage, priority });
  });
  return Object.freeze(members.sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id)));
}

function selectable(members, ids) {
  if (ids === undefined) return members;
  if (!Array.isArray(ids) || ids.length === 0) throw new TypeError("storage pool memberids must be a non-empty array");
  const expected = new Set(ids.map((id) => String(id)));
  const selected = members.filter((member) => expected.has(member.id));
  if (selected.length !== expected.size) throw new TypeError("storage pool memberids include an unknown member");
  return selected;
}

async function optionalhead(storage, key) { return typeof storage.head === "function" ? await storage.head(key) : null; }
function describe(member) { return Object.freeze({ id: member.id, priority: member.priority }); }
function requiredkey(value) { const key = String(value ?? ""); if (!key) throw new TypeError("storage pool key is required"); return key; }
function optionalsha(value) { if (value === undefined || value === null) return null; const digest = String(value); if (!/^[a-f0-9]{64}$/i.test(digest)) throw new TypeError("storage pool sha256 is invalid"); return digest.toLowerCase(); }
function positiveinteger(value, name) { const numeric = Number(value); if (!Number.isInteger(numeric) || numeric < 1) throw new TypeError(`${name} must be a positive integer`); return numeric; }
function operationbudget(input = {}, fallbackattempts) { const budget = input ?? {}; return Object.freeze({ maxattempts: positiveinteger(budget.maxattempts ?? fallbackattempts, "storage pool budget maxattempts"), maxbytes: nonnegativebudget(budget.maxbytes, "storage pool budget maxbytes"), maxmilliseconds: nonnegativebudget(budget.maxmilliseconds, "storage pool budget maxmilliseconds") }); }
function nonnegativebudget(value, name) { if (value === undefined) return Infinity; const numeric = Number(value); if (!Number.isSafeInteger(numeric) || numeric < 0) throw new TypeError(`${name} must be a non-negative safe integer`); return numeric; }
function elapsed(clock, startedat) { return Math.max(0, Number(clock()) - startedat); }
function validrange(start, end) { const from = nonnegativebudget(start, "storage pool range start"); const to = nonnegativebudget(end, "storage pool range end"); if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) throw new TypeError("storage pool range is invalid"); return Object.freeze({ start: from, end: to }); }
function attempt(memberid, error) { return { memberid, code: error?.code ?? "STORAGE_POOL_READ_FAILED", message: String(error?.message ?? error) }; }
function poolerror(code, message, detail) { const error = new Error(message); error.code = code; error.detail = detail; return error; }
