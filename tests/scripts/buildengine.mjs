/**
 * Cleans and builds the root TypeScript engine into ignored dist output.
 */
import { rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";

await rm("dist", { recursive: true, force: true });
const compiler = process.platform === "win32" ? "tsc.cmd" : "tsc";
execFileSync(compiler, ["--project", "tsconfig.json"], { stdio: "inherit" });
