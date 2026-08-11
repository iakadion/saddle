/**
 * mode profiles describe paired operation surfaces without changing engine contracts.
 */
const names = ["computer", "library", "application", "browser", "desktop", "mobile", "extension", "cli", "binary", "internet", "physicalfile", "vectorfile", "visible", "headless"];

export function modeprofile(options = {}) {
  const enabled = new Set(options.enabled ?? ["library", "cli", "binary"]);
  return Object.fromEntries(names.map((name) => [name, { name, enabled: enabled.has(name), paired: Boolean(options.paired?.includes(name)) }]));
}

export function librarymode(factory) { return { name: "library", start: factory, stop: async () => undefined }; }
export function climode(run) { return { name: "cli", run }; }
export function binarymode(run) { return { name: "binary", run }; }
export function browsermode(adapter) { return { name: "browser", adapter }; }
export function headlessmode(adapter) { return { name: "headless", adapter }; }
export function computemode(adapter) { return { name: "computer", adapter }; }
