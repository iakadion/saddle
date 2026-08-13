/**
 * forge adapter defines the common dispatch and artifact surface for compatible forges.
 */
import { transport } from "./transport.js";

export function forgeadapter(options = {}) {
  if (!options.baseurl || typeof options.token !== "function") throw new TypeError("forge adapter requires baseurl and token function");
  const client = transport({ fetcher: options.fetcher, attempts: options.attempts, timeout: options.timeout });
  async function call(path, init = {}) { const token = await options.token(); return client.request(new URL(path, options.baseurl), { ...init, headers: { authorization: `Bearer ${token}`, accept: "application/json", ...(init.headers ?? {}) } }); }
  return {
    kind: options.kind ?? "forge",
    async health(path = "/") { const response = await call(path); return { ok: response.ok, status: response.status }; },
    async dispatch(spec) { if (!spec?.path || !spec.ref) throw new TypeError("forge dispatch requires path and ref"); const response = await call(spec.path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref: spec.ref, inputs: spec.inputs ?? {} }) }); return { accepted: response.ok, status: response.status, body: response.json ? await response.json() : undefined }; },
    async upload(spec) { if (!spec?.path || !spec.data) throw new TypeError("forge upload requires path and data"); const response = await call(spec.path, { method: "PUT", headers: { "content-type": spec.contenttype ?? "application/octet-stream" }, body: spec.data }); return { accepted: response.ok, status: response.status }; }
  };
}
