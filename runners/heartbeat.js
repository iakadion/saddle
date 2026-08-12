/**
 * heartbeat manages cooperative liveness signals for long-running local or remote jobs.
 */

/** Creates a heartbeat controller with manual ticks and optional interval execution. */
export function heartbeat(options = {}) {
  const interval = Number(options.interval ?? 30000);
  if (!Number.isFinite(interval) || interval < 1) throw new TypeError("heartbeat interval must be positive");
  let timer;
  let sequence = 0;
  let last;
  const listeners = new Set();

  async function tick(input = {}) {
    const signal = { id: String(input.id ?? options.id ?? "job"), sequence: ++sequence, at: Date.now(), status: String(input.status ?? "running"), metadata: { ...(input.metadata ?? {}) } };
    last = signal;
    for (const listener of listeners) await listener({ ...signal, metadata: { ...signal.metadata } });
    return signal;
  }

  function on(listener) { if (typeof listener !== "function") throw new TypeError("heartbeat listener must be a function"); listeners.add(listener); return () => listeners.delete(listener); }
  function start(input = {}) { if (timer) return false; const run = () => tick(input).catch(() => undefined); timer = setInterval(run, interval); return true; }
  function stop() { if (!timer) return false; clearInterval(timer); timer = undefined; return true; }
  function status() { return { running: Boolean(timer), interval, sequence, last: last ? { ...last, metadata: { ...last.metadata } } : undefined }; }
  return { tick, on, start, stop, status };
}
