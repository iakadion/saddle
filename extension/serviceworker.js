/**
 * service worker router forwards user initiated commands to the active tab and persists resumable state.
 */

import { assertmessage } from "./protocol.js";

/** Creates a browser independent router around Chrome tabs, scripting and storage APIs. */
export function createworkerrouter(options = {}) {
  const tabs = options.tabs;
  const scripting = options.scripting;
  const storage = options.storage;
  const contentfile = options.contentfile ?? "content.js";
  const statekey = options.statekey ?? "saddleextensionstate";
  const maxpending = options.maxpending ?? 32;
  if (typeof tabs?.sendMessage !== "function") throw new TypeError("extension router requires tabs.sendMessage");
  if (!Number.isSafeInteger(maxpending) || maxpending < 1) throw new TypeError("extension router maxpending must be a positive safe integer");

  async function ensurecontent(tabid) {
    if (!Number.isInteger(tabid)) throw new TypeError("extension command requires a tab id");
    if (typeof scripting?.executeScript !== "function") throw new TypeError("extension router requires scripting.executeScript");
    await scripting.executeScript({ target: { tabId: tabid }, files: [contentfile] });
  }

  async function readstate() {
    if (typeof storage?.get !== "function") return {};
    const result = await storage.get(statekey);
    return result?.[statekey] ?? {};
  }

  async function savestate(value) {
    if (typeof storage?.set === "function") await storage.set({ [statekey]: value });
  }

  async function pendingstate() {
    const value = await readstate();
    return { ...value, pending: Array.isArray(value.pending) ? value.pending.filter(validpending) : [] };
  }

  async function enqueue(request, sender) {
    const state = await pendingstate();
    const record = pendingrecord(request, sender);
    const pending = state.pending.filter((item) => item.requestid !== record.requestid);
    if (pending.length >= maxpending && !state.pending.some((item) => item.requestid === record.requestid)) throw extensionerror("PENDING_LIMIT", "extension pending command limit reached");
    pending.push(record);
    await savestate({ ...state, pending });
    return record;
  }

  async function complete(requestid, patch = {}) {
    const state = await pendingstate();
    await savestate({ ...state, ...patch, pending: state.pending.filter((item) => item.requestid !== requestid) });
  }

  async function markfailure(requestid, error) {
    const state = await pendingstate();
    const pending = state.pending.map((item) => item.requestid === requestid ? { ...item, attempts: item.attempts + 1, lasterror: { code: String(error?.code ?? "extension_error"), message: String(error?.message ?? error) }, updatedat: Date.now() } : item);
    await savestate({ ...state, pending });
  }

  async function dispatch(request, sender = {}) {
    const tabid = request.payload?.tabid ?? sender.tab?.id;
    await ensurecontent(tabid);
    const response = await tabs.sendMessage(tabid, request);
    return decorate(response, sender, tabid);
  }

  async function handle(message, sender = {}) {
    const request = assertmessage(message);
    if (request.type !== "command") throw new TypeError("extension router accepts commands only");
    const tabid = request.payload?.tabid ?? sender.tab?.id;
    await enqueue(request, { ...sender, tab: { ...sender.tab, id: tabid } });
    try {
      const response = await dispatch(request, { ...sender, tab: { ...sender.tab, id: tabid } });
    await complete(request.id, response?.type === "response" && response.payload?.snapshotid ? { tabid, snapshotid: response.payload.snapshotid, frameid: response.payload.frameid, windowid: response.payload.windowid, updatedat: Date.now() } : { updatedat: Date.now() });
      return response;
    } catch (error) {
      await markfailure(request.id, error);
      throw error;
    }
  }

  async function rehydrate() { return pendingstate(); }

  async function resume(requestid, sender = {}) {
    const state = await pendingstate();
    const pending = state.pending.find((item) => item.requestid === requestid);
    if (!pending) throw extensionerror("PENDING_NOT_FOUND", `pending command not found: ${requestid}`);
    const tabid = pending.tabid ?? sender.tab?.id;
    const response = await dispatch(pending.message, { ...sender, frameId: pending.frameid ?? sender.frameId, tab: { ...sender.tab, id: tabid, windowId: pending.windowid ?? sender.tab?.windowId } });
    await complete(requestid, response?.type === "response" && response.payload?.snapshotid ? { tabid, snapshotid: response.payload.snapshotid, frameid: response.payload.frameid, windowid: response.payload.windowid, updatedat: Date.now() } : { updatedat: Date.now() });
    return response;
  }

  async function cancel(requestid) { const state = await pendingstate(); await savestate({ ...state, pending: state.pending.filter((item) => item.requestid !== requestid) }); }

  return { ensurecontent, readstate, savestate, rehydrate, enqueue, resume, cancel, handle };
}

function pendingrecord(request, sender = {}) { return { requestid: request.id, command: request.command, message: request, tabid: request.payload?.tabid ?? sender.tab?.id, frameid: request.payload?.frameid ?? sender.frameId, windowid: request.payload?.windowid ?? sender.tab?.windowId, attempts: 0, createdat: Date.now(), updatedat: Date.now() }; }

function decorate(response, sender, tabid) {
  if (response?.type !== "response" || !response.payload || typeof response.payload !== "object" || !response.payload.snapshotid) return response;
  const payload = { ...response.payload, tabid: response.payload.tabid ?? (tabid === undefined ? undefined : String(tabid)), frameid: response.payload.frameid ?? (sender.frameId === undefined ? undefined : String(sender.frameId)), windowid: response.payload.windowid ?? (sender.tab?.windowId === undefined ? undefined : String(sender.tab.windowId)) };
  return { ...response, payload };
}

function validpending(value) { return Boolean(value && typeof value === "object" && typeof value.requestid === "string" && value.message && value.message.type === "command" && Number.isSafeInteger(value.attempts) && value.attempts >= 0); }

function extensionerror(code, message) { const error = new Error(message); error.code = code; return error; }
