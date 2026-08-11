/**
 * persistence adapters keep database and remote state outside the runtime core.
 */
export function persistenceadapter(methods) {
  const required = ["savejob", "getjob", "updatejob", "listjobs", "saveevent", "listevents", "savesession", "readsession", "saveartifact", "getartifact", "savechunk", "getchunks"];
  for (const name of required) if (typeof methods?.[name] !== "function") throw new TypeError(`persistence adapter requires ${name}`);
  return methods;
}
