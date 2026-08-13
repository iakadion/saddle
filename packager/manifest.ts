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
  return { name: manifest.name, version: manifest.version, target, format, entry: manifest.entry, output: options.output ?? `build/artifacts/${target}.${format}`, command: options.command ?? `caller-build ${target} ${format}`, generated: true, credentials: "caller-managed", metadata: options.metadata ?? {} };
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
