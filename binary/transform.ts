/**
 * binary transformation contracts classify inputs and delegate execution to isolated caller-owned adapters.
 */
import { sha256 } from "../core/hash.js";

/** Classifies a small binary prefix without trusting a filename extension. */
export function magicbytes(input) {
  const bytes = tobytes(input);
  const matches = (prefix) => prefix.every((value, index) => bytes[index] === value);
  if (matches([0x00, 0x61, 0x73, 0x6d])) return Object.freeze({ format: "wasm", executable: true });
  if (matches([0x7f, 0x45, 0x4c, 0x46])) return Object.freeze({ format: "elf", executable: true });
  if (matches([0x4d, 0x5a])) return Object.freeze({ format: "pe", executable: true });
  if (matches([0x50, 0x4b, 0x03, 0x04])) return Object.freeze({ format: "zip", executable: false });
  return Object.freeze({ format: "unknown", executable: false });
}

/** Validates a bounded WASM transformation plan without compiling or instantiating a module. */
export function wasmplan(input = {}) {
  const source = normalizedigest(input.source, "wasm source");
  const imports = normalizeimports(input.imports);
  const budget = resourcebudget(input.budget);
  return Object.freeze({ version: 1, source, imports, budget, target: String(input.target ?? "wasm"), policyversion: positive(input.policyversion ?? 1, "wasm policyversion"), state: "caller-executes" });
}

/** Builds a reproducible transformation cache key from verified inputs and normalized policy. */
export function transformationkey(input = {}) {
  const plan = wasmplan(input.plan ?? input);
  const compiler = normalizedigest(input.compiler, "transformation compiler");
  return sha256(JSON.stringify({ source: plan.source, imports: plan.imports, budget: plan.budget, target: plan.target, policyversion: plan.policyversion, compiler }));
}

/** Validates an immutable cache manifest that can be reused only by matching policy and toolchain identities. */
export function transformationcache(input = {}) {
  const source = normalizedigest(input.source, "transformation cache source");
  const compiler = normalizedigest(input.compiler, "transformation cache compiler");
  const key = normalizedigest(input.key, "transformation cache key");
  const outputs = Array.isArray(input.outputs) ? input.outputs.map((output) => Object.freeze({ name: nonempty(output?.name, "transformation cache output name"), sha256: normalizedigest(output?.sha256, "transformation cache output sha256"), sizebytes: positive(output?.sizebytes, "transformation cache output sizebytes") })) : [];
  if (outputs.length === 0) throw new TypeError("transformation cache outputs are required");
  return Object.freeze({ version: 1, key, source, compiler, policyversion: positive(input.policyversion, "transformation cache policyversion"), outputs: Object.freeze(outputs), verified: input.verified === true });
}

/** Explains whether a verified cache manifest can serve a requested transformation. */
export function cachedecision(manifest, request) {
  const cached = transformationcache(manifest);
  const requested = transformationcache(request);
  const reasons = [];
  if (!cached.verified) reasons.push("unverified");
  if (cached.key !== requested.key) reasons.push("key");
  if (cached.source !== requested.source) reasons.push("source");
  if (cached.compiler !== requested.compiler) reasons.push("compiler");
  if (cached.policyversion !== requested.policyversion) reasons.push("policyversion");
  return Object.freeze({ reusable: reasons.length === 0, reasons: Object.freeze(reasons), manifest: cached });
}

/** Rejects cache reuse for outputs that are sensitive, environment-bound, partial, or unverified. */
export function cacheeligibility(input = {}) {
  const reasons = [];
  if (input.verified !== true) reasons.push("unverified");
  if (input.containssecrets === true) reasons.push("secrets");
  if (input.containsprivate === true) reasons.push("private-data");
  if (input.environmentbound === true) reasons.push("environment-bound");
  if (input.partial === true) reasons.push("partial");
  return Object.freeze({ eligible: reasons.length === 0, reasons: Object.freeze(reasons) });
}

/** Runs a transformation only through an injected isolated adapter and verifies declared output digests. */
export async function executeisolated(plan, adapter) {
  if (typeof adapter?.execute !== "function") throw transformerror("ISOLATED_EXECUTION_UNAVAILABLE", "isolated transformation adapter is required");
  const result = await adapter.execute(wasmplan(plan));
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  if (outputs.length === 0) throw transformerror("ISOLATED_EXECUTION_OUTPUT_INVALID", "isolated transformation returned no outputs");
  const verified = outputs.map((output) => {
    const data = tobytes(output?.data);
    const expected = normalizedigest(output?.sha256, "isolated transformation output sha256");
    const actual = sha256(data);
    if (actual !== expected) throw transformerror("ISOLATED_EXECUTION_DIGEST_MISMATCH", "isolated transformation output digest did not match");
    return Object.freeze({ name: nonempty(output?.name, "isolated transformation output name"), data, sha256: actual, sizebytes: data.byteLength });
  });
  return Object.freeze({ version: 1, state: "completed", outputs: Object.freeze(verified) });
}

function resourcebudget(input = {}) { return Object.freeze({ maxbytes: positive(input.maxbytes ?? 1, "wasm budget maxbytes"), maxoutputbytes: positive(input.maxoutputbytes ?? input.maxbytes ?? 1, "wasm budget maxoutputbytes"), maxmilliseconds: positive(input.maxmilliseconds ?? 1, "wasm budget maxmilliseconds"), network: input.network === true }); }
function normalizeimports(input) { if (!Array.isArray(input ?? [])) throw new TypeError("wasm imports must be an array"); return Object.freeze([...new Set(input.map((value) => nonempty(value, "wasm import")))].sort()); }
function normalizedigest(value, name) { const digest = String(value ?? "").toLowerCase(); if (!/^[a-f0-9]{64}$/.test(digest)) throw new TypeError(`${name} sha256 is invalid`); return digest; }
function nonempty(value, name) { const output = String(value ?? ""); if (!output) throw new TypeError(`${name} is required`); return output; }
function positive(value, name) { const numeric = Number(value); if (!Number.isSafeInteger(numeric) || numeric < 1) throw new TypeError(`${name} must be a positive safe integer`); return numeric; }
function tobytes(value) { if (value instanceof Uint8Array) return new Uint8Array(value); if (value instanceof ArrayBuffer) return new Uint8Array(value); throw new TypeError("binary input must be Uint8Array or ArrayBuffer"); }
function transformerror(code, message) { const error = new Error(message); error.code = code; return error; }
