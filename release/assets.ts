/**
 * release assets create deterministic checksums, SBOM data and provenance statements.
 * The adapter reads caller-selected artifacts and never publishes or handles credentials.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootpath = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Builds deterministic release metadata files for caller-selected artifacts. */
export async function createassets(options = {}) {
  const packagefile = resolve(options.packagefile ?? join(rootpath, "package.json"));
  const lockfile = resolve(options.lockfile ?? join(rootpath, "package-lock.json"));
  const output = resolve(options.output ?? join(rootpath, "build", "release"));
  const artifactroot = resolve(options.artifactroot ?? rootpath);
  const packagejson = JSON.parse(await readFile(packagefile, "utf8"));
  const lockjson = JSON.parse(await readFile(lockfile, "utf8"));
  const artifacts = [...new Set((options.artifacts ?? []).map((artifact) => resolve(String(artifact))))].sort();
  const subjects = await Promise.all(artifacts.map(async (artifact) => ({ name: relative(artifactroot, artifact).replaceAll("\\", "/"), digest: await sha256(artifact) })));
  await mkdir(output, { recursive: true });
  const checksums = `${subjects.map((subject) => `${subject.digest}  ${subject.name}`).join("\n")}${subjects.length ? "\n" : ""}`;
  const sbom = createsbom(packagejson, lockjson);
  const provenance = createprovenance(packagejson, subjects, options);
  const files = { checksums: join(output, "SHA256SUMS"), sbom: join(output, "sbom.cdx.json"), provenance: join(output, "provenance.intoto.jsonl") };
  await writeFile(files.checksums, checksums);
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

function parsearguments(argumentslist) {
  const options = { artifacts: [] };
  for (let index = 0; index < argumentslist.length; index += 1) {
    const argument = argumentslist[index];
    if (argument === "--output") options.output = argumentslist[++index];
    else if (argument === "--version") options.version = argumentslist[++index];
    else if (argument === "--artifact") options.artifacts.push(argumentslist[++index]);
    else if (argument === "--build-type") options.buildtype = argumentslist[++index];
    else if (argument === "--builder") options.builder = argumentslist[++index];
    else throw new TypeError(`unsupported release asset argument: ${argument}`);
  }
  return options;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) createassets(parsearguments(process.argv.slice(2))).then(({ output }) => { console.log(`release assets: ${output}`); }).catch((error) => { console.error(error.message); process.exitCode = 1; });
