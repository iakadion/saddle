#!/usr/bin/env node
// CLI surface: explicit commands keep local execution separate from future remote dispatch.
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { InMemoryEventSink } from "../core/events.js";
import { LocalMemoryBridge } from "../memory/bridge.js";
import { InProcessRunnerProvider } from "../runners/in-process.js";
import { RunnerScheduler } from "../runners/scheduler.js";
import { SaddleEngine } from "../runtime/engine.js";
import { LocalStorageAdapter } from "../storage/local.js";
export async function main(args = process.argv.slice(2)): Promise<void> {
  const [command = "help"] = args;
  if (command === "help" || command === "--help" || command === "-h") { console.log("saddle <command>\n\nCommands:\n  help         Show this help\n  run-example  Execute a deterministic local job"); return; }
  if (command === "run-example") { const root = await mkdtemp(join(tmpdir(), "saddle-cli-")); const events = new InMemoryEventSink(); const engine = new SaddleEngine({ storage: new LocalStorageAdapter(root), memory: new LocalMemoryBridge(), scheduler: new RunnerScheduler([new InProcessRunnerProvider()]), events }); const result = await engine.run({ name: "cli-example", input: { hello: "saddle" } }, ({ job }) => ({ jobId: job.id, ok: true, message: "storage → working set → result" })); console.log(JSON.stringify({ job: result.job.id, artifact: result.artifact, events: events.all().length }, null, 2)); return; }
  throw new Error(`Unknown command: ${command}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }); }
