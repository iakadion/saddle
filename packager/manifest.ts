/**
 * packager manifest context describes publication and platform artifacts without
 * executing a platform command or selecting a vendor toolchain.
 */

export const artifactformats = Object.freeze({
  desktop: Object.freeze(["appimage", "deb", "rpm", "snap", "flatpak", "dmg", "pkg", "exe", "msi", "msix"]),
  mobile: Object.freeze(["apk", "aab", "ipa"]),
  browser: Object.freeze(["crx", "xpi", "safariextz"]),
  web: Object.freeze(["html", "pwa", "ssg", "ssr", "wasm"]),
  package: Object.freeze(["npm", "github", "maven", "nuget", "rubygems", "oci", "vsix", "oxt"])
});

const publicsurfaces = Object.freeze({ desktopapp: "browser", mobileapp: "mobile" });

/** Creates the public dotted artifact stem for a target and version. */
export function artifactname(target, version, format) {
  const surface = publicsurfaces[target] ?? target;
  const normalized = `${surface}.${version}.${format}`.toLowerCase();
  if (!/^[a-z0-9]+(?:\.[a-z0-9]+)+$/.test(normalized)) throw new TypeError("artifact name contains unsupported characters");
  return normalized;
}

/** Creates the supported cross-platform release matrix for a version. */
export function releaseartifactmatrix(version, options = {}) {
  const normalizedversion = normalizeversion(version);
  const signing = String(options.signing ?? "caller-owned");
  const entries = [
    entry("desktop", "linux", "x64", ["deb", "rpm", "appimage"], normalizedversion, signing),
    entry("desktop", "linux", "arm64", ["deb", "rpm", "appimage"], normalizedversion, signing),
    entry("desktop", "windows", "x86", ["exe", "msi"], normalizedversion, signing),
    entry("desktop", "windows", "x64", ["exe", "msi"], normalizedversion, signing),
    entry("desktop", "windows", "arm64", ["exe", "msi"], normalizedversion, signing),
    entry("desktop", "macos", "x64", ["dmg", "app.zip"], normalizedversion, signing),
    entry("desktop", "macos", "arm64", ["dmg", "app.zip"], normalizedversion, signing),
    entry("android", "android", "caller", ["apk", "aab"], normalizedversion, signing),
    entry("ios", "ios", "caller", ["ipa", "app.zip"], normalizedversion, signing),
    entry("container", "oci", "caller", ["tar.gz"], normalizedversion, signing),
    entry("extension", "browser", "caller", ["zip"], normalizedversion, signing),
  ];
  return { version: normalizedversion, signing, entries };
}

/** Creates a distribution manifest for caller-owned build and publication steps. */
export function distributionmanifest(options = {}) {
  if (!options.name || !options.version || !options.entry) throw new TypeError("distribution manifest requires name version and entry");
  return {
    name: options.name,
    version: options.version,
    entry: options.entry,
    modes: options.modes ?? ["library", "application", "computer", "desktop", "mobile", "browser", "cli", "binary", "web", "extension"],
    targets: options.targets ?? ["node", "container", "linux", "windows", "macos", "android", "ios"],
    files: options.files ?? [],
    metadata: options.metadata ?? {}
  };
}

/** Creates a caller-owned artifact plan without invoking a platform toolchain. */
export function targetplan(manifest, target, options = {}) {
  if (!manifest?.name || !manifest?.version) throw new TypeError("target plan requires a distribution manifest");
  if (!target) throw new TypeError("target plan requires a target");
  const format = options.format ?? target;
  return { name: manifest.name, version: manifest.version, target, format, entry: manifest.entry, output: options.output ?? `build/artifacts/${artifactname(target, manifest.version, format)}`, command: options.command ?? `caller-build ${target} ${format}`, generated: true, credentials: "caller-managed", metadata: options.metadata ?? {} };
}

/** Creates a declarative Node SEA or caller-selected binary build plan. */
export function binaryplan(manifest, options = {}) {
  return { tool: options.tool ?? "node", command: options.command ?? `node --experimental-sea-config ${options.config ?? "sea.config.json"}`, entry: manifest.entry, targets: options.targets ?? ["linux", "windows", "macos", "android", "ios"] };
}

/** Creates an OCI container plan with caller-controlled base, workdir and command. */
export function containerplan(manifest, options = {}) {
  const base = options.base ?? "node:26.7.0-alpine";
  const workdir = options.workdir ?? "/app";
  const command = options.command ?? ["node", manifest.entry];
  const lines = [`from ${base}`, `workdir ${workdir}`, "copy package.json package-lock.json ./", "run npm ci --omit=dev", "copy dist ./dist", `cmd ${JSON.stringify(command)}`];
  if (options.port) lines.splice(3, 0, `expose ${options.port}`);
  return { base, workdir, command, dockerfile: `${lines.join("\n")}\n` };
}

function normalizeversion(value) { const normalized = String(value).trim(); if (!/^\d+\.\d+\.\d+$/.test(normalized)) throw new TypeError(`invalid release version: ${value}`); return normalized; }

function entry(surface, platform, architecture, formats, version, signing) {
  const files = formats.map((format) => {
    if (surface === "android") return `saddle.${format}.${version}.${format}`;
    if (surface === "ios") return `saddle.${format}.${version}.${format === "app.zip" ? "app.zip" : format}`;
    if (surface === "container") return `saddle.container.${version}.tar.gz`;
    if (surface === "extension") return `saddle.extension.${version}.zip`;
    return `saddle.browser.${version}.${architecture}.${format}`;
  });
  const metadata = surface === "desktop" ? `desktop.${platform}.${architecture}` : surface;
  return { surface, platform, architecture, formats, files, signing, checksums: `sha256.${metadata}.${version}`, manifest: `manifest.${metadata}.${version}.json` };
}
