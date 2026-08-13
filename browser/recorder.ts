/**
 * browser recorder captures action and snapshot boundaries for deterministic replay.
 */

/** Creates a bounded recorder that links actions to the snapshot used before execution. */
export function actionrecorder(options = {}) {
  const startedat = Number(options.startedat ?? Date.now());
  const events = [];
  let lastsnapshotid;
  function snapshot(snapshot) { lastsnapshotid = snapshot?.snapshotid; const context = recordercontext(snapshot); events.push({ type: "snapshot", t: Date.now() - startedat, snapshotid: lastsnapshotid, tabid: snapshot?.tabid, frameid: snapshot?.frameid, context }); return snapshot; }
  function action(input = {}) { const context = recordercontext(input.context ?? input); const event = { type: "action", t: Date.now() - startedat, action: String(input.action), snapshotid: input.snapshotid ?? lastsnapshotid, tabid: input.tabid, frameid: input.frameid, windowid: input.windowid, context, payload: input.payload ?? {} }; events.push(event); return { ...event }; }
  function list() { return events.map((event) => ({ ...event, payload: { ...event.payload } })); }
  function manifest() { return { version: 1, startedat, eventcount: events.length, lastsnapshotid, events: list() }; }
  return { snapshot, action, list, manifest };
}

function recordercontext(value = {}) {
  const context = {};
  for (const name of ["windowid", "tabid", "frameid"]) if (value[name] !== undefined) context[name] = String(value[name]);
  return Object.keys(context).length ? context : undefined;
}
