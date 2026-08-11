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
  if (typeof tabs?.sendMessage !== "function") throw new TypeError("extension router requires tabs.sendMessage");

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

  async function handle(message, sender = {}) {
    const request = assertmessage(message);
    if (request.type !== "command") throw new TypeError("extension router accepts commands only");
    const tabid = request.payload?.tabid ?? sender.tab?.id;
    await ensurecontent(tabid);
    const response = await tabs.sendMessage(tabid, request);
    if (response?.type === "response" && response.payload?.snapshotid) await savestate({ tabid, snapshotid: response.payload.snapshotid, updatedat: Date.now() });
    return response;
  }

  return { ensurecontent, readstate, savestate, handle };
}
