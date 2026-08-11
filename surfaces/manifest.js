/**
 * surface manifests describe repackaging targets without adding target code to the engine.
 */
export const surfaces = Object.freeze(["browser", "extension", "desktop", "mobile", "n8n", "cli", "binary", "library"]);

export function surfacemanifest(options = {}) {
  const target = options.target ?? "library";
  if (!surfaces.includes(target)) throw new TypeError(`unsupported surface: ${target}`);
  return { target, name: options.name ?? "saddle", entry: options.entry ?? "index.js", permissions: options.permissions ?? [], capabilities: options.capabilities ?? ["memory", "scrape", "workflow"], metadata: options.metadata ?? {} };
}

export function surfacebundle(manifest) { return { ...manifest, files: [manifest.entry], install: manifest.target === "n8n" ? "n8n import" : manifest.target === "browser" || manifest.target === "extension" ? "import by url" : "npm install" }; }
