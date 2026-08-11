/**
 * saddle service exposes universal routes without choosing hono fastify express or another server.
 */
import { crawl } from "../crawl/crawler.js";
import { ratelimiter } from "./rate.js";
import { errorresponse, jsonresponse, sseresponse } from "./http.js";

export function saddleservice(options = {}) {
  if (typeof options.scrape !== "function") throw new TypeError("service requires scrape");
  const limit = options.ratelimiter ?? ratelimiter();
  const jobs = new Map();
  async function handle(request) {
    const url = new URL(request.url ?? request);
    const input = request.json ? await request.clone().json().catch(() => ({})) : request.body ?? {};
    const rate = limit.check({ user: request.headers?.get?.("x-api-key") ?? "anonymous", domain: url.hostname });
    if (!rate.allowed) return errorresponse("RATE_LIMITED", "request rate limit exceeded", { status: 429, retryafter: rate.retryafter });
    try {
      if (url.pathname === "/health" && request.method === "GET") return jsonresponse({ healthy: true, jobs: jobs.size });
      if (url.pathname === "/v1/event" && request.method === "GET") return sseresponse([{ event: "health", data: { healthy: true } }]);
      if (url.pathname === "/v1/scrape" && request.method === "POST") { const result = await options.scrape(input.url, input); return jsonresponse(result); }
      if (url.pathname === "/v1/crawl" && request.method === "POST") { const result = await crawl(input.url, { ...input, scrape: (target) => options.scrape(target, input) }); return jsonresponse(result); }
      if (url.pathname === "/v1/batch" && request.method === "POST") { const results = []; for (const item of input.urls ?? []) results.push(await options.scrape(item, input)); return jsonresponse({ results, completed: results.length, total: input.urls?.length ?? 0 }); }
      if (url.pathname === "/v1/scrape/async" && request.method === "POST") { const id = `task${Date.now().toString(36)}${jobs.size}`; jobs.set(id, { id, status: "queued" }); Promise.resolve(options.scrape(input.url, input)).then((result) => jobs.set(id, { id, status: "completed", result }), (error) => jobs.set(id, { id, status: "failed", error: error.message })); return jsonresponse({ id, status: "queued" }, { status: 202 }); }
      const match = url.pathname.match(/^\/v1\/scrape\/([^/]+)$/);
      if (match && request.method === "GET") return jobs.has(match[1]) ? jsonresponse(jobs.get(match[1])) : errorresponse("NOT_FOUND", "task not found", { status: 404 });
      return errorresponse("NOT_FOUND", "route not found", { status: 404 });
    } catch (error) { return errorresponse("REQUEST_FAILED", error.message, { status: 500 }); }
  }
  return { handle, jobs };
}
