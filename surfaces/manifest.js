/**
 * surface manifests describe repackaging targets without adding target code to the engine.
 */
export const surfaces = Object.freeze(["browser", "extension", "desktop", "mobile", "n8n", "cli", "binary", "library"]);

export const surfaceformats = Object.freeze({ desktop: Object.freeze(["appimage", "dmg", "msi"]), mobile: Object.freeze(["apk", "ipa"]) });

export function surfacemanifest(options = {}) {
  const target = options.target ?? "library";
  if (!surfaces.includes(target)) throw new TypeError(`unsupported surface: ${target}`);
  return { target, name: options.name ?? "saddle", entry: options.entry ?? "index.js", runtime: options.runtime ?? "caller", formats: [...(options.formats ?? surfaceformats[target] ?? [])], permissions: options.permissions ?? [], capabilities: options.capabilities ?? ["memory", "scrape", "workflow"], metadata: options.metadata ?? {} };
}

/** Creates a desktop surface manifest with caller-selected packaging formats. */
export function desktopmanifest(options = {}) { return surfacemanifest({ ...options, target: "desktop", formats: options.formats ?? surfaceformats.desktop }); }

/** Creates a mobile surface manifest with caller-selected packaging formats. */
export function mobilemanifest(options = {}) { return surfacemanifest({ ...options, target: "mobile", formats: options.formats ?? surfaceformats.mobile }); }

/** Describes installation without performing a package or platform mutation. */
export function surfacebundle(manifest) {
  if (!manifest?.target || !surfaces.includes(manifest.target)) throw new TypeError("surface bundle requires a valid manifest");
  const install = { n8n: "n8n import", browser: "import by url", extension: "load unpacked", desktop: "caller desktop bundle", mobile: "caller mobile bundle" }[manifest.target] ?? "npm install";
  return { ...manifest, files: [...new Set([manifest.entry, ...(manifest.files ?? [])])], install };
}
