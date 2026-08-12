/**
 * distribution manifests describe targets without executing a platform command.
 */
export function distributionmanifest(options = {}) {
  if (!options.name || !options.version || !options.entry) throw new TypeError("distribution manifest requires name version and entry");
  return {
    name: options.name,
    version: options.version,
    entry: options.entry,
    modes: options.modes ?? ["library", "cli", "binary"],
    targets: options.targets ?? ["node", "container"],
    files: options.files ?? [],
    metadata: options.metadata ?? {}
  };
}

export function binaryplan(manifest, options = {}) {
  return { tool: options.tool ?? "node", command: options.command ?? `node --experimental-sea-config ${options.config ?? "sea.config.json"}`, entry: manifest.entry, targets: options.targets ?? ["linux", "windows", "macos"] };
}

export function containerplan(manifest, options = {}) {
  const base = options.base ?? "node:26.7.0-alpine";
  const workdir = options.workdir ?? "/app";
  const command = options.command ?? ["node", manifest.entry];
  const lines = [`from ${base}`, `workdir ${workdir}`, "copy package.json package-lock.json ./", "run npm ci --omit=dev", "copy . .", `cmd ${JSON.stringify(command)}`];
  if (options.port) lines.splice(3, 0, `expose ${options.port}`);
  return { base, workdir, command, dockerfile: `${lines.join("\n")}\n` };
}
