/**
 * content bridge runs in the isolated world and exposes bounded page facts and user initiated actions.
 * It stays classic JavaScript because Chrome injects programmatic content scripts as files.
 */

(function installglobalbridge(global) {
  const installedkey = "__saddlecontentbridge";
  const protocolversion = 1;
  const commands = ["snapshot", "readpage", "clickref", "fillref"];

  function createbridge(documentref, now = () => Date.now()) {
    let snapshotid = null;
    let sequence = 0;
    const references = new Map();

    function snapshotpage() {
      const nextid = `snap${++sequence}${now()}`;
      const elements = [];
      references.clear();
      const candidates = documentref.querySelectorAll?.("a,button,input,textarea,select,[role]") ?? [];
      for (const element of Array.from(candidates).slice(0, 100)) {
        if (!visible(element)) continue;
        const ref = `e${elements.length + 1}`;
        references.set(ref, { element, snapshotid: nextid });
        elements.push({ ref, role: roleof(element), name: nameof(element) });
      }
      snapshotid = nextid;
      return { version: protocolversion, snapshotid, createdat: now(), url: String(documentref.location?.href ?? ""), title: String(documentref.title ?? ""), text: String(documentref.body?.innerText ?? "").slice(0, 100000), elements };
    }

    function readpage() {
      const page = snapshotpage();
      return { version: page.version, snapshotid: page.snapshotid, url: page.url, title: page.title, text: page.text };
    }

    function resolve(ref, requestedid) {
      if (requestedid !== snapshotid) throw failure("stale_snapshot", "page snapshot is stale");
      const entry = references.get(String(ref));
      if (!entry || entry.snapshotid !== snapshotid) throw failure("unknown_reference", `unknown page reference: ${ref}`);
      return entry.element;
    }

    function handle(request) {
      if (request?.version !== protocolversion || request.type !== "command" || !commands.includes(request.command)) throw failure("invalid_message", "invalid content command");
      const payload = request.payload ?? {};
      if (request.command === "snapshot") return snapshotpage();
      if (request.command === "readpage") return readpage();
      const element = resolve(payload.ref, payload.snapshotid);
      if (request.command === "clickref") { element.click?.(); return { ref: payload.ref, clicked: true, snapshotid }; }
      if (!isfillable(element)) throw failure("not_fillable", `element is not fillable: ${payload.ref}`);
      setvalue(element, payload.value);
      return { ref: payload.ref, filled: true, snapshotid };
    }

    return { handle, snapshotpage, readpage };
  }

  function install(runtime = global.chrome?.runtime, documentref = global.document) {
    if (!runtime?.onMessage || !documentref) throw new TypeError("content bridge requires runtime and document");
    if (global[installedkey]) return global[installedkey];
    const bridge = createbridge(documentref);
    const listener = (message, sender, sendresponse) => {
      Promise.resolve().then(() => bridge.handle(message)).then((payload) => sendresponse({ version: protocolversion, type: "response", id: `resp${Date.now()}`, requestid: message?.id, payload })).catch((error) => sendresponse({ version: protocolversion, type: "error", id: `err${Date.now()}`, requestid: message?.id, error: { code: error.code ?? "content_error", message: error.message } }));
      return true;
    };
    runtime.onMessage.addListener(listener);
    global[installedkey] = { bridge, listener, dispose() { runtime.onMessage.removeListener?.(listener); delete global[installedkey]; } };
    return global[installedkey];
  }

  function visible(element) {
    const style = global.getComputedStyle?.(element);
    if (style && (style.display === "none" || style.visibility === "hidden")) return false;
    return typeof element.getClientRects !== "function" || element.getClientRects().length > 0;
  }

  function roleof(element) { return String(element.getAttribute?.("role") || element.tagName || "generic").toLowerCase(); }
  function nameof(element) { return String(element.getAttribute?.("aria-label") || element.innerText || element.textContent || element.getAttribute?.("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 200); }
  function isfillable(element) { return ["INPUT", "TEXTAREA"].includes(String(element.tagName).toUpperCase()); }
  function setvalue(element, value) { element.value = String(value ?? ""); element.dispatchEvent?.(new Event("input", { bubbles: true })); element.dispatchEvent?.(new Event("change", { bubbles: true })); }
  function failure(code, message) { const error = new Error(message); error.code = code; return error; }

  global.saddlecontent = { createbridge, install };
  if (global.chrome?.runtime?.onMessage && global.document) install();
})(globalThis);
