/**
 * storage pools combine caller-owned adapters without selecting a provider or creating background work.
 */
import { collectbytes, sha256 } from "./checksum.js";
import { storagecapabilities } from "./sync.js";

/** Creates a deterministic pool over explicit caller-owned storage adapters. */
export function storagepool(options = {}) {
  const members = normalizemembers(options.members);
  const clock = typeof options.clock === "function" ? options.clock : () => Date.now();
  const metrics = { reads: 0, writes: 0, hits: 0, misses: 0, mismatches: 0, bytes: 0 };

  async function read(key, options = {}) {
    const normalizedkey = requiredkey(key);
    const expectedsha = optionalsha(options.sha256);
    const attempts = [];
    metrics.reads += 1;
    for (const member of selectable(members, options.memberids)) {
      if (options.signal?.aborted) throw poolerror("STORAGE_POOL_ABORTED", "storage pool read was aborted", { key: normalizedkey, attempts });
      try {
        const manifest = await optionalhead(member.storage, normalizedkey);
        const raw = await member.storage.get(normalizedkey);
        const data = await collectbytes(raw?.data ?? raw);
        const actualsha = sha256(data);
        const requiredsha = expectedsha ?? manifest?.sha256;
        if (requiredsha && actualsha !== requiredsha) {
          metrics.mismatches += 1;
          throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool read digest did not match", { key: normalizedkey, memberid: member.id, expectedsha: requiredsha, actualsha });
        }
        metrics.hits += 1;
        metrics.bytes += data.byteLength;
        return Object.freeze({ version: 1, key: normalizedkey, memberid: member.id, data, sha256: actualsha, verified: Boolean(requiredsha), manifest: manifest ?? null, attempts, readat: Number(clock()) });
      } catch (error) { attempts.push(attempt(member.id, error)); }
    }
    metrics.misses += 1;
    throw poolerror("STORAGE_POOL_READ_FAILED", "storage pool could not read a verified object", { key: normalizedkey, attempts });
  }

  async function put(input = {}, options = {}) {
    const key = requiredkey(input.key);
    const data = await collectbytes(input.data);
    const digest = sha256(data);
    const selected = selectable(members, options.memberids);
    const quorum = positiveinteger(options.quorum ?? 1, "storage pool quorum");
    if (quorum > selected.length) throw new RangeError("storage pool quorum exceeds selected members");
    const results = [];
    metrics.writes += 1;
    for (const member of selected) {
      if (options.signal?.aborted) { results.push({ memberid: member.id, state: "skipped", code: "STORAGE_POOL_ABORTED" }); break; }
      try {
        const manifest = await member.storage.put({ ...input, key, data: new Uint8Array(data), metadata: { ...(input.metadata ?? {}), sha256: digest } });
        if (manifest?.sha256 && manifest.sha256 !== digest) throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool write digest did not match", { key, memberid: member.id, expectedsha: digest, actualsha: manifest.sha256 });
        results.push({ memberid: member.id, state: "written", manifest: manifest ?? null });
      } catch (error) { results.push({ memberid: member.id, state: "failed", code: error?.code ?? "STORAGE_POOL_WRITE_FAILED", message: String(error?.message ?? error) }); }
    }
    const written = results.filter((result) => result.state === "written");
    metrics.bytes += data.byteLength * written.length;
    const output = Object.freeze({ version: 1, key, sha256: digest, sizebytes: data.byteLength, quorum, state: written.length === selected.length ? "complete" : "partial", results, written: written.length, writtenat: Number(clock()) });
    if (written.length < quorum) throw poolerror("STORAGE_POOL_QUORUM_FAILED", "storage pool write quorum was not met", output);
    return output;
  }

  function repairplan(key, options = {}) {
    const normalizedkey = requiredkey(key);
    const sourceid = String(options.sourceid ?? "");
    if (!members.some((member) => member.id === sourceid)) throw new TypeError("storage pool repair source member is unknown");
    return Object.freeze({ version: 1, key: normalizedkey, sourceid, sha256: optionalsha(options.sha256), targets: selectable(members, options.memberids).filter((member) => member.id !== sourceid).map((member) => member.id), action: "caller-executes" });
  }

  return Object.freeze({ read, put, repairplan, members: () => members.map(describe), capabilities: () => members.map((member) => ({ id: member.id, priority: member.priority, capabilities: storagecapabilities(member.storage) })), metrics: () => ({ ...metrics }) });
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
function attempt(memberid, error) { return { memberid, code: error?.code ?? "STORAGE_POOL_READ_FAILED", message: String(error?.message ?? error) }; }
function poolerror(code, message, detail) { const error = new Error(message); error.code = code; error.detail = detail; return error; }
