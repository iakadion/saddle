/**
 * extension build adapter creates a versioned, unpacked Manifest V3 artifact for release packaging.
 */

import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const modulepath = resolve(dirname(fileURLToPath(import.meta.url)));
const rootpath = existsSync(resolve(modulepath, "..", "..", "package.json")) ? resolve(modulepath, "..", "..") : resolve(modulepath, "..");
const entries = ["manifest.json", "worker.js", "serviceworker.js", "content.js", "pagebridge.js", "popup.js", "popup.html", "popup.css", "protocol.js", "permissions.js"];

function parsearguments(argumentslist) {
  const options = {};
  for (let index = 0; index < argumentslist.length; index += 1) {
    const argument = argumentslist[index];
    if (argument === "--version") options.version = argumentslist[++index];
    else if (argument === "--output") options.output = argumentslist[++index];
    else throw new TypeError(`unsupported extension build argument: ${argument}`);
  }
  return options;
}

function validversion(version) {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(String(version ?? ""));
}

/** Resolves a source asset while emitting the stable browser `.js` filename. */
async function resolveentry(entry) {
  const javascript = resolve(rootpath, "extension", entry);
  try { await access(javascript); return javascript; } catch { return resolve(rootpath, "extension", entry.replace(/\.js$/, ".ts")); }
}

/** Builds the extension into an isolated directory and returns its manifest. */
export async function buildextension(options = {}) {
  const packagefile = JSON.parse(await readFile(resolve(rootpath, "package.json"), "utf8"));
  const version = String(options.version ?? packagefile.version);
  if (!validversion(version)) throw new TypeError(`invalid extension version: ${version}`);
  const output = resolve(process.cwd(), options.output ?? "build/extension");
  await rm(output, { force: true, recursive: true });
  await mkdir(output, { recursive: true });
  const manifest = JSON.parse(await readFile(resolve(rootpath, "extension/manifest.json"), "utf8"));
  manifest.version = version;
  for (const entry of entries) {
    const source = await resolveentry(entry);
    const destination = resolve(output, entry);
    if (entry === "manifest.json") await writeFile(destination, `${JSON.stringify(manifest, null, 2)}\n`);
    else await cp(source, destination);
  }
  return { output, manifest };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildextension(parsearguments(process.argv.slice(2))).then(({ output }) => { console.log(`extension artifact: ${output}`); }).catch((error) => { console.error(error.message); process.exitCode = 1; });
