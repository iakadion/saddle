/**
 * local tests prove the core contract without network or credentials.
 */
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { eventbus } from "../core/events.js";
import { validationerror } from "../core/errors.js";
import { localmemory } from "../memory/bridge.js";
import { inprocess } from "../runners/inprocess.js";
import { scheduler } from "../runners/scheduler.js";
import { engine } from "../runtime/engine.js";
import { localstorage } from "../storage/local.js";
import { chunkedstorage } from "../storage/chunked.js";
import { validatesession } from "../domain/sessions.js";
import { sessionstore } from "../sessions/store.js";
import { externalmemory, internalmemory, vectorizedmemory } from "../memory/modes.js";
import { modeprofile } from "../modes/modes.js";
import { transport } from "../adapters/transport.js";
import { githubadapter } from "../adapters/github.js";
import { memorypersistence } from "../persistence/memory.js";
import { prismaschema, schemasql } from "../persistence/schema.js";
import { jobqueue } from "../queue/queue.js";
import { saga } from "../queue/saga.js";
import { workflowdispatch } from "../dispatch/workflow.js";
import { replay } from "../sessions/replay.js";
import { robotsallowed, robotsrules } from "../scrape/robots.js";
import { extracthtml } from "../scrape/extract.js";
import { scraper } from "../scrape/scraper.js";
import { distributionmanifest, binaryplan, containerplan } from "../packager/manifest.js";
import { forgejoadapter } from "../adapters/forgejo.js";
import { parsecommand } from "../bot/commands.js";
import { saddlebot } from "../bot/bot.js";
import { jsonencode, jsondecode } from "../protocol/json.js";
import { ndjsonencode, ndjsondecode } from "../protocol/ndjson.js";
import { sseencode, ssedecode } from "../protocol/sse.js";
import { blockstream } from "../protocol/blocks.js";
import { sqlpersistence, mysql2persistence } from "../persistence/sql.js";
import { drizzlepersistence } from "../persistence/drizzle.js";
import { prismapersistence } from "../persistence/prisma.js";
import { workflowmanifest } from "../workflow/manifest.js";
import { githubworkflow, gitlabworkflow, woodpeckerworkflow } from "../workflow/templates.js";
import { workflowregistry } from "../workflow/registry.js";
import { memoryengine } from "../memory/engine.js";
import { targetfactory, targeturi } from "../memory/targets.js";
import { normalizeurl } from "../crawl/normalize.js";
import { crawl } from "../crawl/crawler.js";
import { saddleservice } from "../api/service.js";
import { persistentqueue as crawlqueue } from "../crawl/persistent.js";
import { filesessions } from "../sessions/file.js";
import { extractwithschema } from "../scrape/schema.js";
import { mcpserver } from "../mcp/server.js";
import { runtimename, runtimefeatures } from "../runtime/detect.js";
import { deadline } from "../runtime/abort.js";
import { publishplan, registrymanifest } from "../packager/publish.js";
import { fingerprintfor, fingerprintvalidate } from "../browser/fingerprint.js";
import { browsersession } from "../browser/session.js";
import { proxypool } from "../proxy/pool.js";
import { captchacontract } from "../captcha/contract.js";
import { evidence } from "../captcha/evidence.js";
import { captchaguard } from "../captcha/guard.js";
import { estimatetokens, fitscontext, tokenbudget } from "../ai/tokens.js";
import { chunkmarkdown } from "../ai/chunk.js";
import { ragmanifest, vectorrecord } from "../ai/rag.js";
import { llmstxt, llmsfull } from "../ai/llmstxt.js";
import { webhooksig, webhookverify } from "../webhook/signature.js";
import { webhookreceiver } from "../webhook/receiver.js";
import { surfacemanifest, surfacebundle } from "../surfaces/manifest.js";
import { n8nnode, n8nexecute } from "../surfaces/n8n.js";
import { scrapeurl, scrapehtml, serializeresult, formatforagent, batchscrape } from "../library/public.js";
import { browseragent } from "../browser/agent.js";
import { actionbatch, actionfailure, actionresult } from "../browser/actions.js";
import { browsercontext } from "../browser/context.js";
import { actionrecorder } from "../browser/recorder.js";
import { assertfreshsnapshot, pagesnapshot, snapshotdiff, snapshotref } from "../browser/snapshot.js";
import { webscrapeerror, classifyerror } from "../errors/taxonomy.js";
import { retrypolicy } from "../retry/policy.js";
import { circuitbreaker } from "../retry/circuit.js";
import { nodeserver } from "../server/node.js";
import { githubcontents } from "../storage/githubcontents.js";
import { filehosting } from "../storage/filehosting.js";
import { modecatalog, operationmodes, validatemode } from "../modes/matrix.js";
import { resolvemode, withmode } from "../modes/resolve.js";
import { binaryplan as portablebinaryplan, binarymanifest, buildbinary } from "../binary/build.js";
import { targetcatalog, targetmanifest } from "../surfaces/targets.js";
import { persistentqueue } from "../queue/persistent.js";
import { migrationplan, latestmigration } from "../persistence/migrations.js";
import { mcptransport } from "../mcp/transport.js";
import { ispublicurl } from "../api/security.js";

test("runs a job through prepare process sync and commit", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddletest"));
  const events = eventbus();
  const run = engine({ storage: localstorage(root), memory: localmemory(), scheduler: scheduler([inprocess()]), events });
  const result = await run.run({ name: "testjob", input: { value: 42 }, outputkey: "results/test.json" }, ({ job }) => ({ job: job.id, result: "ok" }));
  const stored = await localstorage(root).get("results/test.json");
  assert.equal(result.job.status, "completed");
  assert.equal(result.artifact.key, "results/test.json");
  assert.equal(new TextDecoder().decode(stored).includes('"result":"ok"'), true);
  assert.deepEqual(events.all().map((event) => event.type), ["jobqueued", "jobpreparing", "runnerselected", "jobrunning", "jobsyncing", "storagecommitted", "jobcompleted"]);
});

test("selects the first available provider by priority", async () => {
  const first = inprocess({ id: "first", priority: 0 });
  const second = inprocess({ id: "second", priority: 1 });
  first.setavailable(false);
  const selected = await scheduler([second, first]).select({ id: "job1" });
  assert.equal(selected.descriptor().id, "second");
});

test("rejects negative session event time", () => {
  assert.throws(() => validatesession({ version: 1, id: "session1", agentname: "test", originurl: "https://example.com", seed: "seed", status: "closed", startedat: 1, events: [{ t: -1, type: "move" }] }), (error) => error.code === "INVALID_INPUT");
});

test("rejects traversal storage keys", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlestorage"));
  await assert.rejects(() => localstorage(root).put({ key: "../escape", data: new Uint8Array([1]) }), (error) => error.code === "INVALID_INPUT");
});

test("stores and rebuilds chunked artifacts", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlechunks"));
  const storage = chunkedstorage(localstorage(root), { chunkbytes: 3 });
  const input = new TextEncoder().encode("saddle engine");
  const manifest = await storage.put({ key: "large/data", data: input, contenttype: "text/plain" });
  const rebuilt = await storage.get("large/data");
  assert.equal(manifest.chunks.length, 5);
  assert.equal(new TextDecoder().decode(rebuilt), "saddle engine");
});

test("persists a session as jsonl", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlesessions"));
  const store = sessionstore(root);
  const session = { version: 1, id: "session1", agentname: "engine", originurl: "https://example.com", seed: "seed", status: "recording", startedat: 1, events: [{ t: 0, type: "move", x: 1, y: 2 }] };
  await store.append(session);
  const records = await store.read("session1");
  assert.equal(records.length, 1);
  assert.equal(records[0].events[0].type, "move");
});

test("supports internal external vectorized and library memory choices", async () => {
  const internal = internalmemory();
  await internal.put("message", "saddle");
  assert.equal(new TextDecoder().decode(await internal.get("message")), "saddle");
  const external = externalmemory(localstorage(await mkdtemp(join(tmpdir(), "saddleexternal"))));
  await external.put("message.bin", "saddle");
  assert.equal(new TextDecoder().decode(await external.get("message.bin")), "saddle");
  const vector = vectorizedmemory();
  await vector.put("one", [1, 3]);
  await vector.put("two", [3, 5]);
  assert.deepEqual(await vector.average(["one", "two"]), [2, 4]);
});

test("describes paired operation modes", () => {
  const modes = modeprofile({ enabled: ["library", "browser"], paired: ["browser"] });
  assert.equal(modes.library.enabled, true);
  assert.equal(modes.browser.paired, true);
  assert.equal(modes.cli.enabled, false);
});

test("retries transient transport responses", async () => {
  let calls = 0;
  const client = transport({ attempts: 2, backoff: 0, fetcher: async () => { calls += 1; return calls === 1 ? { ok: false, status: 503 } : { ok: true, status: 200 }; } });
  const response = await client.request("https://example.com/health");
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

test("github adapter keeps endpoint and token injectable", async () => {
  let request;
  const adapter = githubadapter({ baseurl: "https://api.example.com/", token: async () => "token", fetcher: async (url, init) => { request = { url: String(url), init }; return { ok: true, status: 204, json: async () => ({ ok: true }) }; } });
  const result = await adapter.dispatch("owner", "repo", "workflow", { ref: "main", inputs: { jobid: "job1" } });
  assert.equal(result.accepted, true);
  assert.equal(request.init.headers.authorization, "Bearer token");
  assert.equal(request.url.includes("actions/workflows/workflow/dispatches"), true);
});

test("provides neutral persistence schemas and memory persistence", async () => {
  const persistence = memorypersistence();
  await persistence.savejob({ id: "job1", status: "queued", name: "test", priority: 0 });
  await persistence.updatejob("job1", { status: "running" });
  await persistence.saveevent({ id: "event1", jobid: "job1", type: "jobrunning", at: 1, data: {} });
  assert.equal((await persistence.getjob("job1")).status, "running");
  assert.equal((await persistence.listevents("job1")).length, 1);
  assert.equal(schemasql({ dialect: "mysql" }).length, 6);
  assert.equal(prismaschema().includes("model job"), true);
});

test("queues retryable jobs and keeps idempotent results", async () => {
  let attempts = 0;
  const queue = jobqueue({ concurrency: 1, maxattempts: 2, backoff: 0 });
  const handler = async () => { attempts += 1; if (attempts === 1) throw { retryable: true }; return "done"; };
  const first = await queue.add({ value: 1 }, handler, { key: "same" });
  const second = await queue.add({ value: 1 }, handler, { key: "same" });
  assert.equal(first, "done");
  assert.equal(second, "done");
  assert.equal(attempts, 2);
});

test("runs saga compensations in reverse order", async () => {
  const steps = [];
  await assert.rejects(() => saga([{ run: async () => { steps.push("one"); return 1; }, compensate: async () => steps.push("undoone") }, { run: async () => { steps.push("two"); throw new Error("stop"); }, compensate: async () => steps.push("undotwo") }]), /stop/);
  assert.deepEqual(steps, ["one", "two", "undoone"]);
});

test("dispatches a workflow once for an idempotency key", async () => {
  let calls = 0;
  const dispatch = workflowdispatch({ dispatch: async () => { calls += 1; return { accepted: true, status: 204 }; } });
  const spec = { owner: "owner", repository: "repo", workflow: "ci", ref: "main", inputs: { jobid: "job1" }, requestid: "request1" };
  const first = await dispatch.submit(spec);
  const second = await dispatch.submit(spec);
  assert.equal(first.requestid, second.requestid);
  assert.equal(calls, 1);
});

test("replays validated events through an injected browser adapter", async () => {
  const calls = [];
  const adapter = { move: async () => calls.push("move"), click: async () => calls.push("click"), drag: async () => calls.push("drag"), scroll: async () => calls.push("scroll"), key: async () => calls.push("key") };
  const result = await replay({ events: [{ t: 0, type: "move" }, { t: 0, type: "click" }, { t: 0, type: "key" }] }, adapter);
  assert.deepEqual(calls, ["move", "click", "key"]);
  assert.equal(result.events, 3);
});

test("enforces robots rules and extracts structured html", () => {
  const rules = robotsrules("user-agent: *\ndisallow: /private\nallow: /private/public");
  assert.equal(robotsallowed(rules, "https://example.com/private/data"), false);
  assert.equal(robotsallowed(rules, "https://example.com/private/public"), true);
  const result = extracthtml("<html><head><title>Test</title><meta name=\"description\" content=\"A page\"></head><body><a href=\"/next\">Next</a><p>Hello world</p></body></html>", "https://example.com/");
  assert.equal(result.title, "Test");
  assert.equal(result.description, "A page");
  assert.equal(result.links[0], "https://example.com/next");
  assert.equal(result.text.includes("Hello world"), true);
});

test("scrapes with robots and cache through injected transport", async () => {
  let calls = 0;
  const result = scraper({ fetcher: async (url) => { calls += 1; return { ok: true, status: 200, text: async () => url.endsWith("robots.txt") ? "user-agent: *\nallow: /" : "<title>Cached</title>" }; }, cacheoptions: { ttl: 1000 } });
  const first = await result.scrape("https://example.com/page");
  const second = await result.scrape("https://example.com/page");
  assert.equal(first.title, "Cached");
  assert.equal(second.title, "Cached");
  assert.equal(calls, 2);
});

test("builds open distribution plans", () => {
  const manifest = distributionmanifest({ name: "saddle", version: "0.2.0", entry: "cli/main.js" });
  const binary = binaryplan(manifest, { tool: "node" });
  const container = containerplan(manifest, { base: "node:22-alpine" });
  assert.equal(binary.entry, "cli/main.js");
  assert.equal(container.dockerfile.includes("from node:22-alpine"), true);
  assert.equal(container.dockerfile.includes("expose"), false);
});

test("keeps multiforge adapters injectable", async () => {
  const adapter = forgejoadapter({ baseurl: "https://forge.example.com/", token: async () => "token", fetcher: async (_url, init) => ({ ok: true, status: 200, json: async () => ({ authorization: init.headers.authorization }) }) });
  const result = await adapter.dispatch({ path: "/api/workflow", ref: "main", inputs: { jobid: "job1" } });
  assert.equal(result.accepted, true);
  assert.equal(result.body.authorization, "Bearer token");
});

test("parses bot commands and executes through a platform adapter", async () => {
  const parsed = parsecommand("deploy --platform forge --ref main");
  assert.deepEqual(parsed, { command: "deploy", flags: { platform: "forge", ref: "main" } });
  const bot = saddlebot({ adapters: { forge: { executebot: async (input) => input } } });
  await bot.start();
  const result = await bot.executecommand("deploy --platform forge --ref main");
  assert.equal(result.command, "deploy");
  assert.equal(bot.getstatus().status, "running");
  await bot.stop();
});

test("serializes json ndjson sse and bounded blocks", async () => {
  assert.deepEqual(jsondecode(jsonencode({ ok: true })), { ok: true });
  const encoded = [];
  for await (const line of ndjsonencode([{ id: 1 }, { id: 2 }])) encoded.push(line);
  const decoded = [];
  for await (const item of ndjsondecode(encoded)) decoded.push(item);
  assert.deepEqual(decoded, [{ id: 1 }, { id: 2 }]);
  const event = sseencode({ id: "event1", event: "job", data: { ok: true } });
  assert.deepEqual(ssedecode(event), { id: "event1", event: "job", data: { ok: true } });
  const blocks = [];
  for await (const block of blockstream(new TextEncoder().encode("abcdef"), { blockbytes: 2 })) blocks.push(block);
  assert.equal(blocks.length, 3);
  assert.equal(blocks.at(-1).final, true);
  assert.equal(new TextDecoder().decode(blocks[1].data), "cd");
});

test("exposes sql and mysql2 persistence through an injected query", async () => {
  const calls = [];
  const query = async (statement, values) => { calls.push({ statement, values }); if (statement.startsWith("select * from jobs where id")) return [[{ id: "job1", name: "test", status: "queued", priority: 0, input: "{}" }], []]; return [{ affectedRows: 1 }, []]; };
  const sql = sqlpersistence({ query });
  await sql.savejob({ id: "job1", name: "test", status: "queued", priority: 0, input: {} });
  assert.equal((await sql.getjob("job1")).id, "job1");
  assert.equal(calls.length, 2);
  const mysql = mysql2persistence({ execute: query });
  await mysql.saveevent({ id: "event1", jobid: "job1", type: "jobqueued", at: 1, data: {} });
  assert.equal(calls.length, 3);
});

test("accepts drizzle repositories and prisma delegates", async () => {
  const names = ["savejob", "getjob", "updatejob", "listjobs", "saveevent", "listevents", "savesession", "readsession", "saveartifact", "getartifact", "savechunk", "getchunks"];
  const repository = Object.fromEntries(names.map((name) => [name, async (...args) => ({ name, args })]));
  assert.equal((await drizzlepersistence(repository).getjob("job1")).name, "getjob");
  const delegate = { upsert: async (value) => value, findUnique: async (value) => value, update: async (value) => value, findMany: async (value) => value, create: async (value) => value };
  const prisma = prismapersistence({ job: delegate, event: delegate, session: delegate, artifact: delegate, chunk: delegate });
  assert.equal((await prisma.getjob("job1")).where.id, "job1");
});

test("renders multiforge workflow manifests", () => {
  const manifest = workflowmanifest({ name: "process", command: "npm test", platforms: ["github", "gitlab"] });
  const registry = workflowregistry();
  registry.register(manifest);
  assert.equal(registry.render("process", "github").includes("workflow_dispatch"), true);
  assert.equal(gitlabworkflow(manifest).includes("image: node:22"), true);
  assert.equal(woodpeckerworkflow(manifest).includes("npm test"), true);
});

test("loads from the first backend and persists to all backends", async () => {
  const first = new Map();
  const second = new Map();
  const backend = (values) => ({ get: async (key) => values.get(key) ?? null, put: async (key, value) => values.set(key, value), delete: async (key) => values.delete(key) });
  first.set("known", { data: new TextEncoder().encode("value"), contenttype: "text/plain" });
  const memory = memoryengine({ backends: [backend(first), backend(second)] });
  const loaded = await memory.load("known");
  assert.equal(new TextDecoder().decode(loaded.buffer), "value");
  await memory.persist("new", "saddle");
  assert.equal(new TextDecoder().decode(second.get("new").data), "saddle");
  assert.equal((await memory.safeload("missing")).success, false);
});

test("builds open memory targets and transforms", () => {
  const target = targetfactory("github", { owner: "owner", repo: "repo", path: "file.bin" });
  assert.equal(targeturi(target), "github://owner/repo/file.bin");
  const compute = memoryengine().transformtocompute("saddle");
  const result = memoryengine().transformtostorage(compute);
  assert.equal(result.mimetype, "application/octet-stream");
  assert.equal(result.payload.byteLength, 6);
});

test("crawls breadth first with normalized same domain links", async () => {
  const pages = { "https://example.com/": { url: "https://example.com/", title: "home", links: ["https://example.com/next?utm_source=x", "https://other.example/skip"] }, "https://example.com/next": { url: "https://example.com/next", title: "next", links: [] } };
  const result = await crawl("https://example.com/?utm_source=test", { maxdepth: 1, maxpages: 3, samedomain: true, scrape: async (url) => pages[url] });
  assert.equal(normalizeurl("https://example.com/next?utm_source=x"), "https://example.com/next");
  assert.equal(result.results.length, 2);
  assert.equal(result.results[1].title, "next");
});

test("serves universal api routes with web request response objects", async () => {
  const service = saddleservice({ scrape: async (url) => ({ url, links: [] }) });
  const health = await service.handle(new Request("https://api.example.com/health"));
  assert.equal((await health.json()).healthy, true);
  const scrape = await service.handle(new Request("https://api.example.com/v1/scrape", { method: "POST", body: JSON.stringify({ url: "https://example.com" }), headers: { "content-type": "application/json" } }));
  assert.equal((await scrape.json()).url, "https://example.com");
  const stream = await service.handle(new Request("https://api.example.com/v1/event"));
  assert.equal(stream.headers.get("content-type").startsWith("text/event-stream"), true);
});

test("restores persistent crawl queue and completes entries", async () => {
  const saved = new Map();
  const store = { list: async () => [...saved.values()], save: async (item) => saved.set(item.url, item), update: async (key, item) => saved.set(key, item) };
  const queue = crawlqueue({ store });
  await queue.add({ url: "https://example.com", depth: 0 });
  const item = await queue.next();
  await queue.complete(item.url);
  const restored = crawlqueue({ store });
  await restored.restore();
  assert.equal(restored.list().length, 0);
});

test("saves and loads a validated session file", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddle-session-file"));
  const store = filesessions(root);
  const session = { version: 1, id: "sessionfile", agentname: "test", originurl: "https://example.com", seed: "seed", status: "closed", startedat: 1, events: [] };
  await store.save(session);
  assert.equal((await store.load("sessionfile")).id, "sessionfile");
});

test("extracts fields from a safe schema and serves MCP tools", async () => {
  const html = "<title>Saddle</title><h1>Engine</h1><a href=\"/docs\">Docs</a>";
  const extracted = extractwithschema(html, { title: "title", heading: { selector: "h1" } }, "https://example.com");
  assert.equal(extracted.title, "Saddle");
  assert.equal(extracted.heading, "Engine");
  const server = mcpserver({ scrape: async (url) => ({ url, links: [] }) });
  const response = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "scrape", arguments: { url: "https://example.com" } } });
  assert.equal(response.result.content[0].type, "text");
});

test("detects universal runtime capabilities and creates a deadline", () => {
  assert.equal(runtimename({ process: { versions: { node: "22" } } }), "node");
  assert.equal(runtimefeatures({ fetch: () => undefined, ReadableStream, WritableStream }).fetch, true);
  const timer = deadline(1000);
  assert.equal(timer.signal.aborted, false);
  timer.cancel();
});

test("creates registry and CDN publication plans without publishing", () => {
  const manifest = { name: "@devthink/saddle", version: "0.2.0" };
  const plan = publishplan(manifest, { repository: "iakadion/saddle" });
  assert.equal(plan.package.command, "npm publish --access public");
  assert.equal(plan.cdn[0].url.includes("jsdelivr"), true);
  assert.equal(registrymanifest(manifest).surfaces.includes("container"), true);
});

test("keeps a coherent browser fingerprint bound to a session", () => {
  const fingerprint = fingerprintfor("session1");
  assert.equal(fingerprintvalidate(fingerprint), true);
  const session = browsersession({ id: "session1", fingerprint, proxy: { id: "proxy1" } });
  session.record({ t: 0, type: "move", x: 1, y: 2 });
  assert.equal(session.manifest().proxy, "proxy1");
  assert.equal(session.events().length, 1);
});

test("rotates proxy entries by usage and moves repeated failures to graveyard", () => {
  const pool = proxypool({ proxies: [{ id: "proxy1" }, { id: "proxy2" }], failurethreshold: 2, recoverytime: 100000 });
  const first = pool.choose();
  pool.report(first.id, { ok: false });
  pool.report(first.id, { ok: false });
  assert.equal(pool.list().find((item) => item.id === first.id).status, "graveyard");
  assert.notEqual(pool.choose().id, first.id);
});

test("keeps captcha solving explicit and evidence auditable", async () => {
  const contract = captchacontract({ detect: async () => ({ kind: "hcaptcha", detected: true, sitekey: "site" }), solve: async () => ({ passed: true, solver: "external", token: "token" }) });
  const guard = captchaguard({ contract });
  const check = await guard.check({ url: "https://example.com" });
  assert.equal(check.allowed, false);
  assert.equal(check.action, "reviewrequired");
  const solved = await contract.solve({ kind: "hcaptcha" });
  assert.equal(contract.assert(solved).passed, true);
  assert.equal(evidence({ kind: "hcaptcha", passed: true, data: "proof" }).sha256.length, 64);
});

test("chunks markdown and builds a deduplicated rag manifest", async () => {
  const markdown = "# Intro\n\nSaddle engine content.\n\n## Detail\n\nMore content.";
  const chunks = chunkmarkdown(markdown, { maxtokens: 20 });
  assert.equal(chunks[0].headingpath[0], "Intro");
  const manifest = await ragmanifest({ source: "https://example.com/doc", chunks: [...chunks, ...chunks], embeddingmodel: "test" });
  assert.equal(manifest.chunks.length, chunks.length);
  assert.equal(vectorrecord(manifest.chunks[0], [0.1, 0.2]).vector.length, 2);
});

test("estimates token budgets and generates llms text", () => {
  assert.equal(estimatetokens("1234"), 1);
  assert.equal(fitscontext("1234", 1), true);
  assert.equal(tokenbudget("12345678", { context: 1 }).fits, false);
  const pages = [{ title: "Docs", url: "https://example.com/docs", description: "API docs", content: "Saddle API" }];
  assert.equal(llmstxt({ title: "Saddle", pages }).includes("https://example.com/docs"), true);
  assert.equal(llmsfull({ pages }).includes("Saddle API"), true);
});

test("verifies signed webhooks and drops duplicate deliveries", async () => {
  let calls = 0;
  const body = JSON.stringify({ event: "push" });
  const signature = webhooksig(body, "secret");
  assert.equal(webhookverify(body, signature, "secret"), true);
  const receiver = webhookreceiver({ secret: "secret", handle: async () => { calls += 1; return { ok: true }; } });
  assert.equal((await receiver.receive({ body, signature, deliveryid: "delivery1", event: "push" })).accepted, true);
  assert.equal((await receiver.receive({ body, signature, deliveryid: "delivery1", event: "push" })).duplicate, true);
  assert.equal(calls, 1);
});

test("creates packaging surfaces for n8n and browser targets", async () => {
  const manifest = surfacemanifest({ target: "n8n", capabilities: ["scrape"] });
  assert.equal(surfacebundle(manifest).install, "n8n import");
  const node = n8nnode({ name: "saddle" });
  const output = await n8nexecute(node, { command: "status" }, async ({ input }) => input.command);
  assert.equal(output, "status");
});

test("exposes public scrape formats and batch progress", async () => {
  const fetcher = async () => ({ ok: true, status: 200, text: async () => "<title>Page</title><p>Content here.</p>" });
  const result = await scrapeurl("https://example.com", { fetcher, format: "markdown" });
  assert.equal(result.serialized.includes("# Page"), true);
  assert.equal(scrapehtml("<title>Page</title><p>Content</p>").content.includes("Content"), true);
  assert.equal(serializeresult(result, { format: "text" }).includes("Content"), true);
  assert.equal(formatforagent(result).chunks.length > 0, true);
  let progress;
  assert.equal((await batchscrape({ urls: ["https://example.com", "https://example.com/two"], fetcher, onprogress: (value) => { progress = value; } })).length, 2);
  assert.equal(progress.completed, 2);
});

test("delegates browser agent methods to an injected adapter", async () => {
  const calls = [];
  const adapter = Object.fromEntries(["navigate", "click", "type", "screenshot", "html", "text", "title", "scrolltobottom", "executecommands"].map((name) => [name, async (value) => { calls.push(name); return value; }]));
  const agent = browseragent(adapter);
  await agent.navigate({ url: "https://example.com" });
  await agent.click("#button");
  assert.deepEqual(calls.slice(0, 2), ["navigate", "click"]);
});

test("classifies errors and retries only transient failures", async () => {
  const error = webscrapeerror("ratelimited", "slow down");
  assert.equal(error.code, "E2001");
  assert.equal(classifyerror(new Error("timeout")).retryable, true);
  let attempts = 0;
  const result = await retrypolicy({ maxattempts: 2, base: 0 }).run(async () => { attempts += 1; if (attempts === 1) throw webscrapeerror("timeout", "retry"); return "ok"; });
  assert.equal(result, "ok");
  assert.equal(attempts, 2);
});

test("opens and resets a circuit breaker", async () => {
  const breaker = circuitbreaker({ failurethreshold: 2, resettimeout: 100000 });
  await assert.rejects(() => breaker.execute(async () => { throw new Error("one"); }));
  await assert.rejects(() => breaker.execute(async () => { throw new Error("two"); }));
  assert.equal(breaker.status().state, "open");
  breaker.reset();
  assert.equal(breaker.status().state, "closed");
});

test("keeps node server host and port explicit", () => {
  assert.throws(() => nodeserver({ handle: async () => new Response("ok") }), /host and port/);
  const server = nodeserver({ host: "127.0.0.1", port: 4123, handle: async () => new Response("ok") });
  assert.equal(typeof server.listen, "function");
  assert.equal(typeof server.close, "function");
});

test("keeps remote storage adapters injectable", async () => {
  const calls = [];
  const responses = new Map();
  const fetcher = async (url, request = {}) => {
    calls.push({ url: String(url), method: request.method });
    if (request.method === "GET") return { ok: true, json: async () => responses.get(String(url)) ?? { content: Buffer.from("data").toString("base64"), size: 4, sha: "sha" } };
    return { ok: true, json: async () => ({ content: { download_url: "https://cdn.example/file" }, commit: { sha: "commit" } }) };
  };
  const github = githubcontents({ baseurl: "https://api.example", owner: "owner", repo: "repo", token: async () => "token", fetcher });
  const stored = await github.put({ key: "file.bin", data: new TextEncoder().encode("data") });
  assert.equal(stored.key, "file.bin");
  assert.equal(calls.some((call) => call.method === "PUT"), true);
  const requested = [];
  const remote = filehosting({ host: "https://files.example/", request: async (request) => { requested.push(request.method); return { data: new Uint8Array([1, 2]) }; } });
  await remote.put({ key: "file.bin", data: new Uint8Array([1, 2]) });
  await remote.get("file.bin");
  assert.deepEqual(requested, ["put", "get"]);
});

test("resolves open library and binary mode profiles", async () => {
  assert.equal(validatemode("execution", "binary"), true);
  assert.equal(operationmodes.includes("librarywithout"), true);
  assert.equal(modecatalog().axes.memory.includes("vectorized"), true);
  const profile = resolvemode({ execution: "browser", runtime: "browser", memory: "external", pair: "with" });
  assert.equal(profile.capabilities.browser, true);
  assert.equal(profile.capabilities.externalmemory, true);
  assert.equal(await withmode({ execution: "cli", memory: "physical" }, (value) => value.execution), "cli");
});

test("plans binary builds and open platform targets", async () => {
  const plan = portablebinaryplan({ target: "wasm", entry: "index.js", externaldependencies: ["socket"] });
  assert.equal(binarymanifest(plan).reproducible, true);
  assert.equal(await buildbinary(plan, async (manifest) => manifest.target), "wasm");
  assert.equal(targetmanifest("desktopapp").capabilities.includes("file"), true);
  assert.equal(targetcatalog().extension.runtime, "browser");
});

test("restores a persistent queue and maps migration versions", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddlequeue"));
  const path = join(root, "queue.json");
  await writeFile(path, JSON.stringify({ version: 1, items: [{ id: "job1", payload: { ok: true }, status: "running", attempts: 1 }] }));
  const queue = persistentqueue({ path, maxattempts: 3 });
  assert.equal((await queue.list("queued")).length, 1);
  const item = await queue.claim();
  await queue.fail(item.id, { retryable: true, message: "temporary" });
  assert.equal((await queue.list("queued")).length, 1);
  await queue.complete(item.id, { ok: true });
  assert.equal((await queue.list("completed")).length, 1);
  assert.equal(latestmigration(), 3);
  assert.equal(migrationplan({ current: 1, dialect: "postgres" }).length, 2);
});

test("frames MCP JSONL and blocks private network targets", async () => {
  const server = mcpserver({ scrape: async (url) => ({ url }) });
  const transport = mcptransport(server);
  const line = await transport.handleline(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }));
  assert.equal(JSON.parse(line).result.tools.length > 0, true);
  const response = await transport.handlehttp(new Request("https://service.example/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) }));
  assert.equal(response.status, 200);
  assert.equal(ispublicurl("https://example.com"), true);
  assert.equal(ispublicurl("http://127.0.0.1"), false);
});

test("binds browser action references to fresh snapshots and reports diffs", () => {
  const first = pagesnapshot({ snapshotid: "snap1", tabid: "tab1", frameid: "main", url: "https://example.com", elements: [{ ref: "e1", role: "button", name: "Run" }] });
  const second = pagesnapshot({ snapshotid: "snap2", tabid: "tab1", frameid: "main", url: "https://example.com", elements: [{ ref: "e1", role: "button", name: "Running" }, { ref: "e2", role: "link", name: "Docs" }] });
  const reference = snapshotref(first, { ref: "e1" });
  assert.equal(assertfreshsnapshot(first, reference), true);
  assert.throws(() => assertfreshsnapshot(second, reference), (error) => error.code === "STALE_SNAPSHOT");
  const diff = snapshotdiff(first, second);
  assert.equal(diff.added[0].ref, "e2");
  assert.equal(diff.changed[0].name, "Running");
});

test("tracks browser tabs and frames without owning a browser", () => {
  const context = browsercontext({ sessionid: "session1" });
  context.opentab({ id: "tab1", url: "https://example.com", active: true });
  context.opentab({ id: "tab2", url: "https://example.org" });
  context.openframe("tab1", { id: "frame1", url: "https://example.com/frame" });
  assert.equal(context.activetab().id, "tab1");
  assert.equal(context.describe().tabs[0].frames[0].id, "frame1");
  context.setactive("tab2");
  assert.equal(context.activetab().id, "tab2");
  assert.equal(context.closetab("tab1"), true);
});

test("normalizes action results and continues or stops bounded batches", async () => {
  const adapter = { click: async (value) => `clicked:${value}`, type: async (value) => `typed:${value}` };
  const results = await actionbatch(adapter, [{ action: "click", value: "e1" }, { action: "missing", value: "e2" }, { action: "type", value: "ok" }]);
  assert.equal(results[0].ok, true);
  assert.equal(results[1].code, "UNSUPPORTED_ACTION");
  assert.equal(results[2].value, "typed:ok");
  assert.equal(actionresult("click", { value: "e1" }).ok, true);
  assert.equal(actionfailure("click", new Error("covered")).ok, false);
});

test("records snapshot boundaries and action provenance", () => {
  const recorder = actionrecorder({ startedat: 100 });
  recorder.snapshot({ snapshotid: "snap1", tabid: "tab1", frameid: "main" });
  recorder.action({ action: "click", payload: { ref: "e1" }, tabid: "tab1" });
  const manifest = recorder.manifest();
  assert.equal(manifest.eventcount, 2);
  assert.equal(manifest.events[1].snapshotid, "snap1");
  assert.equal(manifest.events[1].payload.ref, "e1");
});
