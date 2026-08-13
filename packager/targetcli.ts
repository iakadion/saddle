/**
 * target manifest CLI writes declarative target plans for CI artifact jobs.
 * It never invokes a desktop, mobile, store or signing toolchain.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { targetplan } from "./manifest.js";

/** Reads the distribution manifest and writes one target plan. */
export async function writeTargetPlan(target: string, format = target, output = "build/targets") {
  const packagejson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
  const manifest = { name: packagejson.name, version: packagejson.version, entry: "dist/index.js" };
  const plan = targetplan(manifest, target, { format });
  await mkdir(resolve(output), { recursive: true });
  const filename = resolve(output, `${target}-${format}.json`);
  await writeFile(filename, `${JSON.stringify(plan, null, 2)}\n`);
  return filename;
}

if (process.argv[1]?.endsWith("targetcli.js") || process.argv[1]?.endsWith("targetcli.ts")) {
  const [, , target = "library", format = target, output = "build/targets"] = process.argv;
  writeTargetPlan(target, format, output).then((filename) => console.log(`target plan: ${filename}`)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
