/**
 * browser recorder captures action and snapshot boundaries for deterministic replay.
 * The optional event limit keeps long sessions bounded without owning persistence.
 */

/** Creates a recorder that links actions to snapshots and optionally bounds events. */
export function actionrecorder(options = {}) {
  const startedat = Number(options.startedat ?? Date.now());
  const maxevents = limit(options.maxevents);
  const events = [];
  let lastsnapshotid;
  let dropped = 0;

  function snapshot(value) {
    lastsnapshotid = value?.snapshotid;
    add({ type: "snapshot", t: Date.now() - startedat, snapshotid: lastsnapshotid, tabid: value?.tabid, frameid: value?.frameid, context: recordercontext(value) });
    return value;
  }

  function action(input = {}) {
    const context = recordercontext(input.context ?? input);
    const event = { type: "action", t: Date.now() - startedat, action: String(input.action), snapshotid: input.snapshotid ?? lastsnapshotid, tabid: input.tabid, frameid: input.frameid, windowid: input.windowid, context, payload: clonevalue(input.payload ?? {}) };
    add(event);
    return clonevalue(event);
  }

  function list() { return events.map(clonevalue); }
  function manifest() { return { version: 1, startedat, eventcount: events.length, dropped, lastsnapshotid, events: list() }; }
  function exportjson() { return JSON.stringify(manifest()); }
  function clear() { events.length = 0; dropped = 0; lastsnapshotid = undefined; }

  return { snapshot, action, list, manifest, exportjson, clear };

  function add(event) {
    events.push(event);
    while (events.length > maxevents) { events.shift(); dropped += 1; }
  }
}

function limit(value) {
  if (value === undefined) return Infinity;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) throw new TypeError("maxevents must be a non-negative integer");
  return numeric;
}

function clonevalue(value) {
  if (Array.isArray(value)) return value.map(clonevalue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clonevalue(item)]));
  return value;
}

function recordercontext(value = {}) {
  const context = {};
  for (const name of ["windowid", "tabid", "frameid"]) if (value[name] !== undefined) context[name] = String(value[name]);
  return Object.keys(context).length ? context : undefined;
}
