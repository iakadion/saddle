/**
 * page bridge exposes bounded, read-only page facts to the isolated content world.
 * It never executes page supplied commands and never forwards extension credentials.
 */

(function installpagebridge(global) {
  const channel = "saddle.pagefacts.v1";
  const installedkey = "__saddlepagebridge";

  function createpagebridge(globalref = global) {
    function readpage() {
      const documentref = globalref.document;
      return {
        url: String(documentref?.location?.href ?? ""),
        title: String(documentref?.title ?? "").slice(0, 500),
        text: String(documentref?.body?.innerText ?? "").slice(0, 100000)
      };
    }

    function listener(event) {
      const request = event?.data;
      if (event?.source && event.source !== globalref) return;
      if (request?.channel !== channel || request.type !== "request" || typeof request.requestid !== "string" || typeof request.token !== "string") return;
      globalref.postMessage({ channel, version: 1, type: "response", requestid: request.requestid, token: request.token, payload: readpage() }, "*");
    }

    return { channel, listener, readpage };
  }

  function install(globalref = global) {
    if (typeof globalref?.addEventListener !== "function" || !globalref.document) throw new TypeError("page bridge requires a window and document");
    if (globalref[installedkey]) return globalref[installedkey];
    const bridge = createpagebridge(globalref);
    globalref.addEventListener("message", bridge.listener);
    globalref[installedkey] = { ...bridge, dispose() { globalref.removeEventListener?.("message", bridge.listener); delete globalref[installedkey]; } };
    return globalref[installedkey];
  }

  global.saddlepagebridge = { channel, createpagebridge, install };
  if (global.document && typeof global.addEventListener === "function") install(global);
})(globalThis);
