/**
 * binary builder plans portable artifacts without choosing a compiler vendor.
 */
export const binarytargets = Object.freeze(["node", "deno", "bun", "wasm", "singlefile"]);

/** Creates a deterministic binary build plan from explicit options. */
export function binaryplan(options = {}) {
  const target = options.target ?? "node";
  if (!binarytargets.includes(target)) throw new TypeError(`unsupported binary target: ${target}`);
  return { name: options.name ?? "saddle", target, entry: options.entry ?? "cli/main.js", output: options.output ?? "dist", command: options.command ?? `build ${target}`, minify: options.minify ?? false, embedruntime: options.embedruntime ?? false, externaldependencies: options.externaldependencies ?? [], metadata: options.metadata ?? {} };
}

/** Returns an artifact manifest without writing files or running a compiler. */
export function binarymanifest(plan) { return { name: plan.name, target: plan.target, entry: plan.entry, output: plan.output, files: [plan.entry], reproducible: true, metadata: plan.metadata }; }

/** Resolves an injected builder and preserves the plan as the execution boundary. */
export async function buildbinary(plan, builder) { if (typeof builder !== "function") throw new TypeError("binary builder is required"); return builder(binarymanifest(plan)); }
