/**
 * release assets create deterministic checksums, SBOM data and provenance statements.
 * The adapter reads caller-selected artifacts and never publishes or handles credentials.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const modulepath = dirname(fileURLToPath(import.meta.url));
const moduleparts = modulepath.split(sep);
const rootpath = moduleparts.at(-1) === "release" && moduleparts.at(-2) === "dist" ? resolve(modulepath, "..", "..") : resolve(modulepath, "..");

/** Builds deterministic release metadata files for caller-selected artifacts. */
export async function createassets(options = {}) {
  const packagefile = resolve(options.packagefile ?? join(rootpath, "package.json"));
  const lockfile = resolve(options.lockfile ?? join(rootpath, "package-lock.json"));
  const output = resolve(options.output ?? join(rootpath, "build", "release"));
  const artifactroot = resolve(options.artifactroot ?? rootpath);
  const packagejson = JSON.parse(await readFile(packagefile, "utf8"));
  const lockjson = JSON.parse(await readFile(lockfile, "utf8"));
  const artifacts = [...new Set((options.artifacts ?? []).map((artifact) => resolve(String(artifact))))].sort();
  const version = String(options.version ?? packagejson.version);
  const surface = normalizeSurface(options.surface ?? "library");
  const subjects = await Promise.all(artifacts.map(async (artifact) => {
    const name = relative(artifactroot, artifact).replaceAll("\\", "/");
    validateArtifactName(basename(name));
    return { name, digest: await sha256(artifact) };
  }));
  await mkdir(output, { recursive: true });
  const checksums = `${subjects.map((subject) => `${subject.digest}  ${subject.name}`).join("\n")}${subjects.length ? "\n" : ""}`;
  const sbom = createsbom(packagejson, lockjson);
  const provenance = createprovenance(packagejson, subjects, { ...options, version });
  const manifest = { name: String(packagejson.name), version, surface, files: subjects.map((subject) => basename(subject.name)), signing: String(options.signing ?? "caller-owned") };
  const files = {
    checksums: join(output, `sha256.${surface}.${version}`),
    manifest: join(output, `manifest.${surface}.${version}.json`),
    sbom: join(output, `sbom.${surface}.${version}.cdx.json`),
    provenance: join(output, `provenance.${surface}.${version}.intoto.jsonl`)
  };
  await writeFile(files.checksums, checksums);
  await writeFile(files.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(files.sbom, `${JSON.stringify(sbom, null, 2)}\n`);
  await writeFile(files.provenance, `${JSON.stringify(provenance)}\n`);
  return { output, files, subjects, sbom, provenance };
}

/** Creates a compact CycloneDX component list from the root lockfile dependencies. */
export function createsbom(packagejson, lockjson = {}) {
  const root = lockjson.packages?.[""] ?? {};
  const dependencies = { ...(root.dependencies ?? {}), ...(root.devDependencies ?? {}) };
  const components = Object.keys(dependencies).map((name) => {
    const entry = lockjson.packages?.[`node_modules/${name}`] ?? {};
    const version = String(entry.version ?? dependencies[name]).replace(/^[^0-9]*/, "");
    return { "bom-ref": `pkg:npm/${name}@${version}`, name, version, purl: `pkg:npm/${name}@${version}`, scope: root.devDependencies?.[name] ? "optional" : "required", type: "library" };
  }).sort((left, right) => left.name.localeCompare(right.name));
  return { bomFormat: "CycloneDX", specVersion: "1.5", serialNumber: `urn:uuid:${stableuuid(`${packagejson.name}@${packagejson.version}`)}`, version: 1, metadata: { component: { type: "application", name: String(packagejson.name), version: String(packagejson.version) } }, components };
}

/** Creates an in-toto statement whose subjects are the caller-selected release artifacts. */
export function createprovenance(packagejson, subjects = [], options = {}) {
  const normalized = subjects.map((subject) => ({ name: String(subject.name), digest: { sha256: String(subject.digest) } })).sort((left, right) => left.name.localeCompare(right.name));
  return { _type: "https://in-toto.io/Statement/v1", subject: normalized, predicateType: "https://slsa.dev/provenance/v1", predicate: { buildDefinition: { buildType: String(options.buildtype ?? "caller-defined"), externalParameters: { package: String(packagejson.name), version: String(options.version ?? packagejson.version) }, internalParameters: {} }, runDetails: { builder: { id: String(options.builder ?? "caller-defined") }, metadata: { invocationId: stableuuid(`${packagejson.name}@${options.version ?? packagejson.version}:${normalized.map((subject) => subject.name).join(",")}`) } } } };
}

async function sha256(path) { const hash = createHash("sha256"); hash.update(await readFile(path)); return hash.digest("hex"); }

function stableuuid(value) { const hex = createHash("sha256").update(String(value)).digest("hex").slice(0, 32); return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${(8 + (Number.parseInt(hex.slice(16, 17), 16) % 4).toString(16))}${hex.slice(17, 20)}-${hex.slice(20)}`; }

/** Normalizes the public release surface used in metadata filenames. */
function normalizeSurface(value) { const normalized = String(value).trim().toLowerCase(); if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(normalized)) throw new TypeError(`invalid release surface: ${value}`); return normalized; }

/** Rejects helper binaries and ambiguous public filenames before metadata generation. */
function validateArtifactName(value) { if (value.includes("_") || /build[-_]script[-_]build|saddle[-_]desktop/i.test(value)) throw new TypeError(`forbidden release artifact filename: ${value}`); }

function parsearguments(argumentslist) {
  const options = { artifacts: [] };
  for (let index = 0; index < argumentslist.length; index += 1) {
    const argument = argumentslist[index];
    if (argument === "--output") options.output = argumentslist[++index];
    else if (argument === "--version") options.version = argumentslist[++index];
    else if (argument === "--surface") options.surface = argumentslist[++index];
    else if (argument === "--signing") options.signing = argumentslist[++index];
    else if (argument === "--artifact") options.artifacts.push(argumentslist[++index]);
    else if (argument === "--build-type") options.buildtype = argumentslist[++index];
    else if (argument === "--builder") options.builder = argumentslist[++index];
    else throw new TypeError(`unsupported release asset argument: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) createassets(parsearguments(process.argv.slice(2))).then(({ output }) => { console.log(`release assets: ${output}`); }).catch((error) => { console.error(error.message); process.exitCode = 1; });
