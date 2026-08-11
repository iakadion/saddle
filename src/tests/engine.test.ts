// Engine tests: local-only fixtures prove the contract without external credentials or network.
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { InMemoryEventSink } from "../core/events.js";
import { ValidationError } from "../core/errors.js";
import { LocalMemoryBridge } from "../memory/bridge.js";
import { InProcessRunnerProvider } from "../runners/in-process.js";
import { RunnerScheduler } from "../runners/scheduler.js";
import { SaddleEngine } from "../runtime/engine.js";
import { LocalStorageAdapter } from "../storage/local.js";
import { validateSessionRecord } from "../domain/sessions.js";
test("runs a job through prepare, process, sync and commit", async () => {
  const root = await mkdtemp(join(tmpdir(), "saddle-test-")); const events = new InMemoryEventSink(); const engine = new SaddleEngine({ storage: new LocalStorageAdapter(root), memory: new LocalMemoryBridge(), scheduler: new RunnerScheduler([new InProcessRunnerProvider()]), events });
  const result = await engine.run({ name: "test-job", input: { value: 42 }, outputKey: "results/test.json" }, ({ job }) => ({ job: job.id, result: "ok" })); const stored = await new LocalStorageAdapter(root).get("results/test.json");
  assert.equal(result.job.status, "completed"); assert.equal(result.artifact.key, "results/test.json"); assert.equal(new TextDecoder().decode(stored).includes('"result":"ok"'), true); assert.deepEqual(events.all().map((event) => event.type), ["job.queued", "job.preparing", "runner.selected", "job.running", "job.syncing", "storage.committed", "job.completed"]);
});
test("scheduler selects the first available provider by priority", async () => {
  const first = new InProcessRunnerProvider({ id: "first", priority: 0 }); const second = new InProcessRunnerProvider({ id: "second", priority: 1 }); first.setAvailable(false); const scheduler = new RunnerScheduler([second, first]); const selected = await scheduler.select({ id: "job_1", name: "select", input: undefined, priority: 0, outputKey: undefined, metadata: {}, status: "queued", createdAt: 0 }); assert.equal(selected.descriptor().id, "second");
});
test("session validation rejects negative event time", () => { assert.throws(() => validateSessionRecord({ version: 1, id: "sess_1", agentName: "test", originUrl: "https://example.com", seed: "seed", status: "closed", startedAt: 1, events: [{ t: -1, type: "move" }] }), ValidationError); });
test("local storage rejects traversal keys", async () => { const root = await mkdtemp(join(tmpdir(), "saddle-storage-")); const storage = new LocalStorageAdapter(root); await assert.rejects(() => storage.put({ key: "../escape", data: new Uint8Array([1]) }), ValidationError); });
