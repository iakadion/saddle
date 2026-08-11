/**
 * storage adapters keep remote services out of the engine core.
 */
export function storageadapter(methods) {
  const required = ["put", "get", "head", "delete", "list"];
  for (const name of required) if (typeof methods?.[name] !== "function") throw new TypeError(`storage adapter requires ${name}`);
  return methods;
}
