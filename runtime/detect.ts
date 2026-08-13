/**
 * runtime detection uses standard globals and keeps node specific modules outside the core.
 */
export function runtimename(scope = globalThis) {
  if (scope.Deno) return "deno";
  if (scope.Bun) return "bun";
  if (scope.process?.versions?.node) return "node";
  if (scope.window?.document) return "browser";
  return "unknown";
}

export function runtimefeatures(scope = globalThis) {
  return { runtime: runtimename(scope), fetch: typeof scope.fetch === "function", streams: typeof scope.ReadableStream === "function" && typeof scope.WritableStream === "function", crypto: Boolean(scope.crypto), websocket: typeof scope.WebSocket === "function", filesystem: Boolean(scope.process?.versions?.node || scope.Deno) };
}
