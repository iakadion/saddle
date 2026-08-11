// Example: the same engine contract runs locally without network, credentials or a remote provider.
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InMemoryEventSink, LocalMemoryBridge, LocalStorageAdapter, InProcessRunnerProvider, RunnerScheduler, SaddleEngine } from "../src/index.js";

const root = await mkdtemp(join(tmpdir(), "saddle-example-"));
const events = new InMemoryEventSink();
const engine = new SaddleEngine({
  storage: new LocalStorageAdapter(root),
  memory: new LocalMemoryBridge(),
  scheduler: new RunnerScheduler([new InProcessRunnerProvider()]),
  events,
});

const result = await engine.run({ name: "local-example", input: { source: "example" }, outputKey: "results/example.json" }, ({ job }) => ({ jobId: job.id, ok: true }));
console.log({ jobId: result.job.id, artifact: result.artifact.key, eventCount: events.all().length });
