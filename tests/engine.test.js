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
