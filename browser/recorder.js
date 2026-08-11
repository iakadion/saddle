/**
 * browser recorder captures action and snapshot boundaries for deterministic replay.
 */

/** Creates a bounded recorder that links actions to the snapshot used before execution. */
export function actionrecorder(options = {}) {
  const startedat = Number(options.startedat ?? Date.now());
  const events = [];
  let lastsnapshotid;
  function snapshot(snapshot) { lastsnapshotid = snapshot?.snapshotid; events.push({ type: "snapshot", t: Date.now() - startedat, snapshotid: lastsnapshotid, tabid: snapshot?.tabid, frameid: snapshot?.frameid }); return snapshot; }
  function action(input = {}) { const event = { type: "action", t: Date.now() - startedat, action: String(input.action), snapshotid: input.snapshotid ?? lastsnapshotid, tabid: input.tabid, frameid: input.frameid, payload: input.payload ?? {} }; events.push(event); return { ...event }; }
  function list() { return events.map((event) => ({ ...event, payload: { ...event.payload } })); }
  function manifest() { return { version: 1, startedat, eventcount: events.length, lastsnapshotid, events: list() }; }
  return { snapshot, action, list, manifest };
}
