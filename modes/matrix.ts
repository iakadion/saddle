/**
 * mode matrix keeps supported execution choices in one grouped contract.
 */
export const modeaxes = Object.freeze({
  execution: ["library", "application", "browser", "desktopapp", "mobileapp", "extension", "cli", "binary", "computer", "internet"],
  runtime: ["node", "browser", "deno", "bun", "worker", "unknown"],
  memory: ["internal", "external", "physical", "vectorized", "library"],
  file: ["internal", "external", "physical", "vector"],
  dependency: ["internal", "external", "dev"],
  visibility: ["visible", "headless"],
  pair: ["without", "with"]
});

export const operationmodes = Object.freeze(modeaxes.execution.flatMap((execution) => modeaxes.pair.map((pair) => `${execution}${pair}`)));

/** Returns true when the matrix contains the requested axis value. */
export function validatemode(axis, value) { return Boolean(modeaxes[axis]?.includes(value)); }

/** Returns a serializable snapshot for documentation and diagnostics. */
export function modecatalog() { return { axes: Object.fromEntries(Object.entries(modeaxes).map(([key, values]) => [key, [...values]])), operationmodes: [...operationmodes] }; }
