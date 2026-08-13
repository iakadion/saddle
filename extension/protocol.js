/**
 * extension protocol defines serializable commands, responses, errors and page snapshots.
 */

export const protocolversion = 1;
export const extensioncommands = Object.freeze(["snapshot", "readpage", "pagefacts", "clickref", "fillref"]);

/** Creates a compact identifier without embedding a host, port or credential. */
export function createid(prefix = "msg", source) {
  const generator = source ?? (() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(16).slice(2)}`);
  const value = generator().replaceAll("-", "");
  return `${prefix}${value}`;
}

/** Creates a versioned command for the extension message bus. */
export function createcommand(command, payload = {}, options = {}) {
  if (!extensioncommands.includes(command)) throw new TypeError(`unsupported extension command: ${command}`);
  return createmessage("command", { ...options, command, payload });
}

/** Creates a serializable message envelope. */
export function createmessage(type, options = {}) {
  if (!["command", "response", "error", "event"].includes(type)) throw new TypeError(`unsupported extension message type: ${type}`);
  const message = { version: protocolversion, type, id: options.id ?? createid(type) };
  if (options.requestid) message.requestid = options.requestid;
  if (options.command) message.command = options.command;
  if (options.payload !== undefined) message.payload = options.payload;
  if (options.error) message.error = options.error;
  assertserializable(message);
  return message;
}

/** Creates a correlated successful response. */
export function createresponse(request, payload = {}) {
  assertmessage(request);
  return createmessage("response", { requestid: request.id, payload });
}

/** Creates a correlated error response with stable error fields. */
export function createerror(request, error, options = {}) {
  const requestid = request?.id ?? options.requestid;
  const failure = { code: options.code ?? error?.code ?? "extension_error", message: String(error?.message ?? error ?? "extension request failed"), retryable: Boolean(options.retryable ?? error?.retryable) };
  return createmessage("error", { requestid, error: failure });
}

/** Validates a message before a privileged context handles it. */
export function assertmessage(message) {
  if (!message || typeof message !== "object") throw new TypeError("extension message must be an object");
  if (message.version !== protocolversion) throw new TypeError(`unsupported extension protocol version: ${message.version}`);
  if (typeof message.type !== "string" || typeof message.id !== "string") throw new TypeError("extension message requires type and id");
  if (message.type === "command" && !extensioncommands.includes(message.command)) throw new TypeError(`unsupported extension command: ${message.command}`);
  if (message.payload !== undefined && (!message.payload || typeof message.payload !== "object" || Array.isArray(message.payload))) throw new TypeError("extension payload must be an object");
  return message;
}

/** Creates a structured page snapshot with stable element references. */
export function createsnapshot(input = {}) {
  const snapshot = {
    version: protocolversion,
    snapshotid: String(input.snapshotid ?? createid("snap")),
    createdat: Number(input.createdat ?? Date.now()),
    windowid: input.windowid === undefined ? undefined : String(input.windowid),
    tabid: input.tabid === undefined ? undefined : String(input.tabid),
    frameid: input.frameid === undefined ? undefined : String(input.frameid),
    url: String(input.url ?? ""),
    title: String(input.title ?? ""),
    text: String(input.text ?? ""),
    elements: Array.isArray(input.elements) ? input.elements.map((element) => ({ ref: String(element.ref), role: String(element.role ?? "generic"), name: String(element.name ?? ""), value: element.value === undefined ? undefined : String(element.value), disabled: Boolean(element.disabled) })) : []
  };
  assertserializable(snapshot);
  return snapshot;
}

/** Returns whether a reference still belongs to the current page snapshot. */
export function isfreshsnapshot(snapshotid, currentid) { return Boolean(snapshotid && currentid && snapshotid === currentid); }

/** Computes bounded additions, removals and changed elements between extension snapshots. */
export function snapshotdiff(previous, current) {
  const before = createsnapshot(previous);
  const after = createsnapshot(current);
  const oldmap = new Map(before.elements.map((element) => [element.ref, element]));
  const newmap = new Map(after.elements.map((element) => [element.ref, element]));
  return {
    from: before.snapshotid,
    to: after.snapshotid,
    contextchanged: before.windowid !== after.windowid || before.tabid !== after.tabid || before.frameid !== after.frameid,
    added: after.elements.filter((element) => !oldmap.has(element.ref)),
    removed: before.elements.filter((element) => !newmap.has(element.ref)),
    changed: after.elements.filter((element) => oldmap.has(element.ref) && JSON.stringify(oldmap.get(element.ref)) !== JSON.stringify(element))
  };
}

function assertserializable(value) {
  try { JSON.stringify(value); } catch (error) { throw new TypeError(`extension message is not serializable: ${error.message}`); }
}
