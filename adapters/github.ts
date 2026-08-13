/**
 * github adapter uses caller supplied credentials and base url configuration.
 */
import { transport } from "./transport.js";

export function githubadapter(options = {}) {
  if (!options.baseurl || typeof options.token !== "function") throw new TypeError("github adapter requires baseurl and token function");
  const client = transport({ fetcher: options.fetcher, attempts: options.attempts, timeout: options.timeout });
  async function call(path, init = {}) {
    const token = await options.token();
    const headers = { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "x-github-api-version": options.apiversion ?? "2022-11-28", ...(init.headers ?? {}) };
    return client.request(new URL(path, options.baseurl), { ...init, headers });
  }
  return {
    async health() { const response = await call("/rate_limit"); return { ok: response.ok, status: response.status }; },
    async dispatch(owner, repository, workflow, input = {}) { const response = await call(`/repos/${owner}/${repository}/actions/workflows/${workflow}/dispatches`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref: input.ref ?? "main", inputs: input.inputs ?? {} }) }); return { accepted: response.status === 204, status: response.status }; },
    async run(owner, repository, runid) { const response = await call(`/repos/${owner}/${repository}/actions/runs/${runid}`); return response.json(); }
  };
}
