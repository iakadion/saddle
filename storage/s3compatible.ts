/**
 * s3 compatible storage stays open by accepting a caller supplied signer.
 * List operations use the S3 ListObjectsV2 contract without owning credentials.
 */
import { storageadapter } from "./adapter.js";

/** Creates an S3-compatible adapter with signed CRUD and paginated listing. */
export function s3compatible(options = {}) {
  if (!options.endpoint || !options.bucket || typeof options.sign !== "function") throw new TypeError("s3 compatible storage requires endpoint bucket and sign");
  const endpoint = new URL(options.endpoint);
  const fetcher = options.fetcher ?? fetch;

  async function request(method, key, body, query = {}) {
    const signed = await options.sign({ method, endpoint, bucket: options.bucket, key, query, body });
    const url = new URL(signed.url, endpoint);
    if (!url.search && Object.keys(query).length) for (const [name, value] of Object.entries(query)) url.searchParams.set(name, String(value));
    const response = await fetcher(url, { method, headers: signed.headers, body });
    if (!response.ok) throw new Error(`storage request failed with ${response.status}`);
    return response;
  }

  return storageadapter({
    async put(input) { const data = await (input.data instanceof Uint8Array ? input.data : (await import("./checksum.js")).collectbytes(input.data)); await request("PUT", input.key, data); return { key: input.key, sizebytes: data.byteLength, sha256: (await import("./checksum.js")).sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: Date.now(), metadata: { ...(input.metadata ?? {}) } }; },
    async get(key) { const response = await request("GET", key); return new Uint8Array(await response.arrayBuffer()); },
    async head(key) { try { const response = await request("HEAD", key); return { key, sizebytes: Number(response.headers.get("content-length") ?? 0), sha256: response.headers.get("etag") ?? "", contenttype: response.headers.get("content-type") ?? "application/octet-stream", createdat: Date.now(), metadata: {} }; } catch { return null; } },
    async delete(key) { await request("DELETE", key); },
    async list(prefix = "", listoptions = {}) {
      const maxkeys = Math.max(1, Math.min(1000, Number(listoptions.maxkeys ?? options.maxkeys ?? 1000)));
      const maxpages = Math.max(1, Number(listoptions.maxpages ?? options.maxpages ?? 100));
      const entries = [];
      let continuation = listoptions.continuationToken;
      for (let page = 0; page < maxpages; page += 1) {
        const query = { "list-type": "2", prefix, "max-keys": maxkeys };
        if (continuation) query["continuation-token"] = continuation;
        const response = await request("GET", "", undefined, query);
        const parsed = parseListXml(await response.text());
        entries.push(...parsed.entries);
        if (!parsed.truncated || !parsed.nextToken) return entries;
        if (parsed.nextToken === continuation) throw new Error("s3 list continuation token did not advance");
        continuation = parsed.nextToken;
      }
      return entries;
    },
  });
}

function parseListXml(xml) {
  const entries = [];
  for (const block of xml.match(/<Contents\b[\s\S]*?<\/Contents>/gi) ?? []) {
    const key = xmlvalue(block, "Key");
    if (!key) continue;
    const etag = xmlvalue(block, "ETag");
    entries.push({ key, sizebytes: Number(xmlvalue(block, "Size") ?? 0), sha256: etag?.replace(/^"|"$/g, "") ?? "", contenttype: "application/octet-stream", createdat: Date.now(), metadata: { etag, lastmodified: xmlvalue(block, "LastModified"), storageclass: xmlvalue(block, "StorageClass") } });
  }
  const truncated = xmlvalue(xml, "IsTruncated") === "true";
  return { entries, truncated, nextToken: xmlvalue(xml, "NextContinuationToken") };
}

function xmlvalue(xml, name) { const match = String(xml).match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i")); return match ? decodexml(match[1].trim()) : undefined; }
function decodexml(value) { return String(value).replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'"); }
