/**
 * append only events are the small protocol shared by adapters.
 */
export const eventtypes = Object.freeze([
  "jobqueued",
  "jobpreparing",
  "runnerselected",
  "jobrunning",
  "jobsyncing",
  "storagecommitted",
  "jobcompleted",
  "jobfailed"
]);

export function eventbus() {
  const recorded = [];
  return {
    emit(event) { recorded.push(Object.freeze({ ...event })); },
    all() { return [...recorded]; }
  };
}
