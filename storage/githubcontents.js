/**
 * github contents storage maps artifacts to repository files through an injected token.
 */
import { collectbytes, sha256 } from "./checksum.js";
import { storageadapter } from "./adapter.js";

export function githubcontents(options = {}) {
  if (!options.baseurl || !options.owner || !options.repo || typeof options.token !== "function") throw new TypeError("github contents requires baseurl owner repo and token");
  const fetcher = options.fetcher ?? fetch;
  async function request(method, key, body) { const token = await options.token(); const response = await fetcher(new URL(`/repos/${options.owner}/${options.repo}/contents/${key}`, options.baseurl), { method, headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); if (!response.ok) throw new Error(`github contents request failed with ${response.status}`); return response; }
  return storageadapter({
    async put(input) { const data = await collectbytes(input.data); let sha; try { sha = (await (await request("GET", input.key)).json()).sha; } catch {} const response = await request("PUT", input.key, { message: input.message ?? `saddle write ${input.key}`, content: Buffer.from(data).toString("base64"), branch: options.branch ?? "main", sha }); const result = await response.json(); return { key: input.key, sizebytes: data.byteLength, sha256: sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: Date.now(), metadata: { url: result.content?.download_url, commit: result.commit?.sha, ...(input.metadata ?? {}) } }; },
    async get(key) { const result = await (await request("GET", key)).json(); return new Uint8Array(Buffer.from(result.content.replaceAll("\n", ""), "base64")); },
    async head(key) { try { const result = await (await request("GET", key)).json(); return { key, sizebytes: result.size, sha256: result.sha ?? "", contenttype: "application/octet-stream", createdat: Date.now(), metadata: { url: result.download_url } }; } catch { return null; } },
    async delete(key) { const result = await (await request("GET", key)).json(); await request("DELETE", key, { message: `saddle delete ${key}`, sha: result.sha, branch: options.branch ?? "main" }); },
    async list(prefix = "") { const result = await (await request("GET", prefix)).json(); return (Array.isArray(result) ? result : []).filter((item) => item.type === "file").map((item) => ({ key: item.path, sizebytes: item.size, sha256: item.sha, contenttype: "application/octet-stream", createdat: Date.now(), metadata: { url: item.download_url } })); }
  });
}
