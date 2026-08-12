/**
 * saddle service exposes universal routes without choosing hono fastify express or another server.
 */
import { crawl } from "../crawl/crawler.js";
import { ratelimiter } from "./rate.js";
import { errorresponse, jsonresponse, sseresponse } from "./http.js";
import { assertpublicurl } from "./security.js";
import { authorize } from "./auth.js";
import { requestcontext, successpayload } from "./contracts.js";

export function saddleservice(options = {}) {
  if (typeof options.scrape !== "function") throw new TypeError("service requires scrape");
  const limit = options.ratelimiter ?? ratelimiter();
  const jobs = new Map();
  async function handle(request) {
    const url = new URL(request.url ?? request);
    const context = requestcontext(request, { path: url.pathname });
    const input = request.json ? await request.clone().json().catch(() => ({})) : request.body ?? {};
    let principal;
    try { principal = await authorize(request, { verify: options.verify }); } catch (error) { return errorresponse(error.code ?? "UNAUTHORIZED", error.message, { status: 401, requestid: context.requestid }); }
    const rate = limit.check({ user: request.headers?.get?.("x-api-key") ?? "anonymous", domain: url.hostname });
    if (!rate.allowed) return errorresponse("RATE_LIMITED", "request rate limit exceeded", { status: 429, retryafter: rate.retryafter, requestid: context.requestid });
    try {
      if (url.pathname === "/health" && request.method === "GET") return jsonresponse({ healthy: true, jobs: jobs.size, principal: principal.subject }, { headers: { "x-request-id": context.requestid } });
      if (url.pathname === "/v1/event" && request.method === "GET") return sseresponse([{ event: "health", data: { healthy: true } }]);
      if (url.pathname === "/v1/scrape" && request.method === "POST") { assertpublicurl(input.url, options.security); const result = await options.scrape(input.url, input); return jsonresponse(options.envelope ? successpayload(result, context) : result, { headers: { "x-request-id": context.requestid } }); }
      if (url.pathname === "/v1/crawl" && request.method === "POST") { assertpublicurl(input.url, options.security); const result = await crawl(input.url, { ...input, scrape: (target) => options.scrape(target, input) }); return jsonresponse(result); }
      if (url.pathname === "/v1/batch" && request.method === "POST") { const results = []; for (const item of input.urls ?? []) { assertpublicurl(item, options.security); results.push(await options.scrape(item, input)); } return jsonresponse({ results, completed: results.length, total: input.urls?.length ?? 0 }); }
      if (url.pathname === "/v1/scrape/async" && request.method === "POST") { assertpublicurl(input.url, options.security); const id = `task${Date.now().toString(36)}${jobs.size}`; jobs.set(id, { id, status: "queued" }); Promise.resolve(options.scrape(input.url, input)).then((result) => jobs.set(id, { id, status: "completed", result }), (error) => jobs.set(id, { id, status: "failed", error: error.message })); return jsonresponse({ id, status: "queued" }, { status: 202 }); }
      const match = url.pathname.match(/^\/v1\/scrape\/([^/]+)$/);
      if (match && request.method === "GET") return jobs.has(match[1]) ? jsonresponse(jobs.get(match[1])) : errorresponse("NOT_FOUND", "task not found", { status: 404 });
      return errorresponse("NOT_FOUND", "route not found", { status: 404 });
    } catch (error) { return errorresponse(error.code ?? "REQUEST_FAILED", error.message, { status: error.code === "UNAUTHORIZED" ? 401 : 500, requestid: context.requestid }); }
  }
  return { handle, jobs };
}
