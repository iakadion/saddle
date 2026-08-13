/**
 * worker bridge translates message events through an injected dispatcher without owning a worker runtime.
 */

/** Attaches a bounded message bridge to a caller-owned worker scope. */
export function workerbridge(options = {}) {
  const scope = options.scope ?? globalThis;
  const dispatch = options.dispatch;
  if (typeof scope.addEventListener !== "function") throw new TypeError("worker scope requires addEventListener");
  if (typeof dispatch !== "function") throw new TypeError("worker bridge requires dispatch");
  const event = String(options.event ?? "message");
  async function listener(message) {
    const input = message?.data ?? message;
    try { scope.postMessage?.({ ok: true, requestid: input?.requestid, data: await dispatch(input) }); } catch (error) { scope.postMessage?.({ ok: false, requestid: input?.requestid, error: { code: String(error?.code ?? "WORKER_DISPATCH_FAILED"), message: String(error?.message ?? error) } }); }
  }
  scope.addEventListener(event, listener);
  return { event, listener, close() { scope.removeEventListener?.(event, listener); } };
}
