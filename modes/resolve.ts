/**
 * mode resolver selects open defaults while preserving every caller choice.
 */
import { modeaxes, validatemode } from "./matrix.js";

/** Resolves an execution profile without starting a process or opening a socket. */
export function resolvemode(options = {}) {
  const profile = {
    execution: options.execution ?? "library",
    runtime: options.runtime ?? "unknown",
    memory: options.memory ?? "internal",
    file: options.file ?? "internal",
    dependency: options.dependency ?? "internal",
    visibility: options.visibility ?? "headless",
    pair: options.pair ?? "without"
  };
  for (const [axis, value] of Object.entries(profile)) if (!validatemode(axis, value)) throw new TypeError(`unsupported mode ${axis}:${value}`);
  return { ...profile, capabilities: modecapabilities(profile) };
}

/** Returns stable capabilities for adapters and diagnostics. */
export function modecapabilities(profile) {
  return {
    library: profile.execution === "library" || profile.execution === "application",
    browser: profile.execution === "browser" || profile.execution === "extension" || profile.runtime === "browser" || profile.runtime === "worker",
    cli: profile.execution === "cli" || profile.execution === "binary",
    physicalmemory: profile.memory === "physical",
    vectorizedmemory: profile.memory === "vectorized",
    externalmemory: profile.memory === "external",
    externalfile: profile.file === "external",
    externaldependency: profile.dependency === "external",
    visible: profile.visibility === "visible"
  };
}

/** Applies one profile to a caller supplied operation. */
export async function withmode(options, operation) { if (typeof operation !== "function") throw new TypeError("mode operation is required"); return operation(resolvemode(options)); }

export { modeaxes };
