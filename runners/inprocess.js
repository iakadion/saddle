/**
 * the in process runner is the deterministic baseline for local execution.
 */
export function inprocess(options = {}) {
  let available = options.status !== "offline";
  const runner = {
    id: options.id ?? "runnerlocal",
    name: options.name ?? "local in process runner",
    priority: options.priority ?? 0,
    maxconcurrent: options.maxconcurrent ?? 1,
    capabilities: options.capabilities ?? ["node", "local"]
  };
  return {
    descriptor() { return { ...runner, status: available ? "available" : "offline" }; },
    setavailable(value) { available = Boolean(value); },
    async canrun() { return available; },
    async execute(context, handler) { return handler(context); }
  };
}
