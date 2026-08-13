/**
 * browser context tracks tabs and frames without owning a browser implementation.
 */

/** Creates a serializable browser context registry for an injected browser adapter. */
export function browsercontext(options = {}) {
  const sessionid = String(options.sessionid ?? `context${Date.now().toString(36)}`);
  const tabs = new Map();
  let activeid = options.activeid === undefined ? undefined : String(options.activeid);

  function opentab(input = {}) {
    const id = String(input.id ?? `tab${tabs.size + 1}`);
    const tab = { id, url: String(input.url ?? "about:blank"), title: String(input.title ?? ""), active: Boolean(input.active), frames: new Map() };
    tabs.set(id, tab);
    if (tab.active || activeid === undefined) { activeid = id; tab.active = true; }
    return describetab(tab);
  }

  function closetab(id) {
    const key = String(id);
    if (!tabs.delete(key)) return false;
    if (activeid === key) activeid = tabs.keys().next().value;
    if (activeid && tabs.has(activeid)) tabs.get(activeid).active = true;
    return true;
  }

  function setactive(id) {
    const key = String(id);
    const tab = tabs.get(key);
    if (!tab) throw new Error(`unknown browser tab: ${key}`);
    for (const item of tabs.values()) item.active = false;
    tab.active = true;
    activeid = key;
    return describetab(tab);
  }

  function openframe(tabid, input = {}) {
    const tab = requiretab(tabid);
    const id = String(input.id ?? `frame${tab.frames.size + 1}`);
    tab.frames.set(id, { id, url: String(input.url ?? tab.url), parentid: input.parentid === undefined ? undefined : String(input.parentid), name: String(input.name ?? "") });
    return { ...tab.frames.get(id) };
  }

  function closeframe(tabid, frameid) { return Boolean(requiretab(tabid).frames.delete(String(frameid))); }
  function activetab() { return activeid === undefined ? undefined : describetab(requiretab(activeid)); }
  function describe() { return { sessionid, activeid, tabs: [...tabs.values()].map(describetab) }; }

  return { sessionid, opentab, closetab, setactive, openframe, closeframe, activetab, describe };

  function requiretab(id) { const tab = tabs.get(String(id)); if (!tab) throw new Error(`unknown browser tab: ${id}`); return tab; }
  function describetab(tab) { return { id: tab.id, url: tab.url, title: tab.title, active: tab.active, frames: [...tab.frames.values()].map((frame) => ({ ...frame })) }; }
}
