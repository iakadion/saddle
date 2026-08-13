/**
 * extension permission policies keep the browser capability boundary explicit and caller-owned.
 */

export const extensionpermissions = Object.freeze(["activeTab", "scripting", "storage"]);

/** Creates a minimal permission policy without requesting broad host access. */
export function permissionpolicy(options = {}) {
  const requested = [...new Set((options.requested ?? extensionpermissions).map(String))];
  const optional = [...new Set((options.optional ?? []).map(String))];
  const unknown = requested.concat(optional).filter((permission) => !extensionpermissions.includes(permission));
  if (unknown.length) throw new TypeError(`unsupported extension permission: ${unknown[0]}`);
  return { version: 1, requested, optional, hostpermissions: [], allows(permission) { return requested.includes(String(permission)); }, missing(permissions = []) { return [...new Set(permissions.map(String))].filter((permission) => !requested.includes(permission)); } };
}

/** Requests an optional capability through an injected browser permission function. */
export async function requestpermission(policy, permission, request) {
  const name = String(permission ?? "");
  if (!policy?.optional?.includes(name)) throw new TypeError(`permission is not optional: ${name}`);
  if (typeof request !== "function") throw new TypeError("permission request function is required");
  try { return { permission: name, granted: Boolean(await request(name)) }; } catch (error) { return { permission: name, granted: false, code: String(error?.code ?? "PERMISSION_REQUEST_FAILED"), message: String(error?.message ?? error) }; }
}
