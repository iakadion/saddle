/**
 * browser actions normalize adapter outcomes and preserve failure metadata for agents and replay.
 */

export const browseractions = Object.freeze(["navigate", "click", "type", "fill", "key", "scroll", "upload", "screenshot", "snapshot"]);

/** Creates a stable action result independent of the underlying browser vendor. */
export function actionresult(action, options = {}) {
  if (!browseractions.includes(action)) throw new TypeError(`unsupported browser action: ${action}`);
  return { version: 1, action, ok: true, startedat: Number(options.startedat ?? Date.now()), finishedat: Number(options.finishedat ?? Date.now()), tabid: options.tabid === undefined ? undefined : String(options.tabid), frameid: options.frameid === undefined ? undefined : String(options.frameid), snapshotid: options.snapshotid, value: options.value, metadata: options.metadata ?? {} };
}

/** Creates a stable action failure without leaking adapter internals or credentials. */
export function actionfailure(action, error, options = {}) {
  if (!action || typeof action !== "string") throw new TypeError("browser action failure requires an action name");
  return { version: 1, action, ok: false, code: String(options.code ?? error?.code ?? "BROWSER_ACTION_FAILED"), message: String(error?.message ?? error ?? "browser action failed"), retryable: Boolean(options.retryable ?? error?.retryable), tabid: options.tabid === undefined ? undefined : String(options.tabid), frameid: options.frameid === undefined ? undefined : String(options.frameid), snapshotid: options.snapshotid, metadata: options.metadata ?? {} };
}

/** Executes a bounded list of actions through an injected adapter and keeps per-action outcomes. */
export async function actionbatch(adapter, actions = [], options = {}) {
  if (!adapter || typeof adapter !== "object") throw new TypeError("browser action batch requires an adapter");
  if (!Array.isArray(actions) || actions.length > (options.maxactions ?? 100)) throw new TypeError("browser action batch is invalid or too large");
  const results = [];
  for (const item of actions) {
    const action = String(item?.action ?? "");
    const method = adapter[action];
    if (typeof method !== "function") { results.push(actionfailure(action, new Error(`browser adapter does not support ${action}`), { code: "UNSUPPORTED_ACTION" })); continue; }
    const startedat = Date.now();
    try { const value = await method(item.options ?? item.value); results.push(actionresult(action, { ...item, startedat, finishedat: Date.now(), value })); }
    catch (error) { results.push(actionfailure(action, error, { ...item, tabid: item.tabid, frameid: item.frameid, snapshotid: item.snapshotid })); if (options.stoponerror) break; }
  }
  return results;
}
