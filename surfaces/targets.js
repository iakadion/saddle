/**
 * target profiles keep platform packaging open and describe capability boundaries.
 */
export const targetprofiles = Object.freeze({
  computer: { runtime: "unknown", entry: "index.js", capabilities: ["memory", "storage", "runner"] },
  desktopapp: { runtime: "unknown", entry: "index.js", capabilities: ["memory", "file", "visible"] },
  mobileapp: { runtime: "browser", entry: "index.js", capabilities: ["memory", "network", "headless"] },
  extension: { runtime: "browser", entry: "index.js", capabilities: ["browser", "network", "visible"] },
  internet: { runtime: "unknown", entry: "index.js", capabilities: ["network", "webhook", "api"] }
});

/** Creates a surface target with caller supplied entry and capabilities. */
export function targetmanifest(target, options = {}) { const profile = targetprofiles[target]; if (!profile) throw new TypeError(`unsupported target: ${target}`); return { target, runtime: options.runtime ?? profile.runtime, entry: options.entry ?? profile.entry, capabilities: options.capabilities ?? [...profile.capabilities], permissions: options.permissions ?? [], metadata: options.metadata ?? {} }; }

/** Returns all supported target profiles for documentation and tooling. */
export function targetcatalog() { return Object.fromEntries(Object.entries(targetprofiles).map(([key, value]) => [key, { ...value, capabilities: [...value.capabilities] }])); }
