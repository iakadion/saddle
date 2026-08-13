/**
 * Release verification checks artifact digests, manifest consistency and
 * explicit signing state without contacting a registry or a provider.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const modulepath = dirname(fileURLToPath(import.meta.url));
const rootpath = resolve(modulepath, "..");
const signingstatuses = new Set([
  "unsigned",
  "ci-test-key",
  "caller-owned",
  "caller-configured",
  "notarized",
  "signpath-foundation",
  "provider-verified",
]);

/** Verifies a release checksum file and its correlated public manifest. */
export async function verifyassets(options = {}) {
  const checksumsfile = resolve(String(options.checksums ?? ""));
  const manifestfile = resolve(String(options.manifest ?? ""));
  if (!options.checksums || !options.manifest) throw new TypeError("checksums and manifest are required");
  const artifactroot = resolve(String(options.artifactroot ?? dirname(checksumsfile)));
  const manifest = JSON.parse(await readFile(manifestfile, "utf8"));
  const expectedversion = options.version === undefined ? undefined : String(options.version);
  const version = String(manifest.version ?? "");
  if (!version) throw new TypeError("release manifest version is required");
  if (expectedversion && expectedversion !== version) throw new Error(`release version mismatch: expected ${expectedversion}, received ${version}`);
  const signing = String(manifest.signing ?? "");
  if (!signingstatuses.has(signing)) throw new Error(`unknown release signing status: ${signing || "empty"}`);
  const checksums = parsechecksums(await readFile(checksumsfile, "utf8"));
  const manifestfiles = normalizefiles(manifest.files);
  const checksumfiles = [...checksums.keys()].sort();
  if (manifestfiles.length !== checksumfiles.length || manifestfiles.some((name, index) => name !== checksumfiles[index])) throw new Error("release manifest files do not match checksum entries");
  const verified = [];
  for (const name of checksumfiles) {
    const artifact = safepath(artifactroot, name);
    const digest = await sha256(artifact);
    const expected = checksums.get(name);
    if (digest !== expected) throw new Error(`checksum mismatch: ${name}`);
    verified.push({ name, digest });
  }
  return { valid: true, version, signing, files: verified };
}

/** Parses sha256sum output while accepting binary filenames with spaces. */
function parsechecksums(value) {
  const entries = new Map();
  for (const line of String(value).split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = line.match(/^([a-f0-9]{64})\s+[ *](.+)$/i);
    if (!match) throw new TypeError(`invalid checksum line: ${line}`);
    const name = basename(match[2]);
    if (entries.has(name)) throw new Error(`duplicate checksum entry: ${name}`);
    entries.set(name, match[1].toLowerCase());
  }
  return entries;
}

/** Normalizes and validates the manifest file list. */
function normalizefiles(value) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new TypeError("release manifest files must be a string array");
  const names = value.map((item) => basename(item));
  if (new Set(names).size !== names.length) throw new Error("duplicate release manifest file");
  return names.sort();
}

/** Rejects absolute paths and path traversal outside the selected artifact root. */
function safepath(root, name) {
  const artifact = resolve(root, name);
  const boundary = relative(root, artifact);
  if (isAbsolute(boundary) || boundary === ".." || boundary.startsWith(`..${sep}`)) throw new Error(`release artifact escapes root: ${name}`);
  return artifact;
}

/** Computes a SHA-256 digest with the Node.js standard library. */
async function sha256(path) {
  const hash = createHash("sha256");
  hash.update(await readFile(path));
  return hash.digest("hex");
}

/** Parses the standalone verification command used by release automation. */
function parsearguments(argumentslist) {
  const options = { artifactroot: rootpath };
  for (let index = 0; index < argumentslist.length; index += 1) {
    const argument = argumentslist[index];
    if (argument === "--checksums") options.checksums = argumentslist[++index];
    else if (argument === "--manifest") options.manifest = argumentslist[++index];
    else if (argument === "--root") options.artifactroot = argumentslist[++index];
    else if (argument === "--version") options.version = argumentslist[++index];
    else throw new TypeError(`unsupported release verification argument: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) verifyassets(parsearguments(process.argv.slice(2))).then((result) => { console.log(JSON.stringify(result)); }).catch((error) => { console.error(error.message); process.exitCode = 1; });
