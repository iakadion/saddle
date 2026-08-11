/**
 * local tests prove the core contract without network or credentials.
 */
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
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
  assert.equal(schemasql({ dialect: "mysql" }).length, 5);
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
