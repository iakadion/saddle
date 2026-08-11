#!/usr/bin/env node
/**
 * the cli keeps local execution explicit and leaves remote dispatch to adapters.
 */
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { argv } from "node:process";
import { eventbus } from "../core/events.js";
import { localmemory } from "../memory/bridge.js";
import { inprocess } from "../runners/inprocess.js";
import { scheduler } from "../runners/scheduler.js";
import { engine } from "../runtime/engine.js";
import { localstorage } from "../storage/local.js";

export async function main(args = argv.slice(2)) {
  const command = args[0] ?? "help";
  if (["help", "--help", "-h"].includes(command)) { console.log("saddle <command>\n\ncommands\n  help\n  runexample"); return; }
  if (command === "runexample") {
    const root = await mkdtemp(join(tmpdir(), "saddlecli"));
    const events = eventbus();
    const run = engine({ storage: localstorage(root), memory: localmemory(), scheduler: scheduler([inprocess()]), events });
    const result = await run.run({ name: "cliexample", input: { hello: "saddle" } }, ({ job }) => ({ jobid: job.id, ok: true, message: "storage to working set to result" }));
    console.log(JSON.stringify({ jobid: result.job.id, artifact: result.artifact, events: events.all().length }, null, 2));
    return;
  }
  throw new Error(`unknown command: ${command}`);
}

if (import.meta.url === `file://${argv[1]}`) main().catch((error) => { console.error(error); process.exitCode = 1; });
