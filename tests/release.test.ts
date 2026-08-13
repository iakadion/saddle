/**
 * release asset tests prove deterministic metadata without publishing or external credentials.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createassets } from "../release/assets.js";

test("creates reproducible checksums, SBOM and provenance subjects", async () => {
  const directory = await mkdtemp(join(tmpdir(), "saddle-release-"));
  try {
    const artifact = join(directory, "saddle.tgz");
    const output = join(directory, "assets");
    await writeFile(artifact, "artifact payload\n");
    const packagefile = join(directory, "package.json");
    const lockfile = join(directory, "package-lock.json");
    await writeFile(packagefile, JSON.stringify({ name: "@wenathlan/example", version: "1.0.0" }));
    await writeFile(lockfile, JSON.stringify({ packages: { "": { dependencies: { exampledep: "1.2.3" }, devDependencies: { testdep: "2.0.0" } }, "node_modules/exampledep": { version: "1.2.3" }, "node_modules/testdep": { version: "2.0.0" } } }));
    const first = await createassets({ packagefile, lockfile, output, artifactroot: directory, artifacts: [artifact], version: "1.0.0", surface: "library", buildtype: "test-build", builder: "test-builder" });
    const checksums = await readFile(first.files.checksums, "utf8");
    const sbom = JSON.parse(await readFile(first.files.sbom, "utf8"));
    const provenance = JSON.parse(await readFile(first.files.provenance, "utf8"));
    assert.match(checksums, /saddle\.tgz\s*$/);
    assert.match(first.files.checksums, /sha256\.library\.1\.0\.0$/);
    assert.match(first.files.manifest, /manifest\.library\.1\.0\.0\.json$/);
    assert.equal(sbom.bomFormat, "CycloneDX");
    assert.deepEqual(sbom.components.map((component) => component.name), ["exampledep", "testdep"]);
    assert.equal(provenance.subject[0].digest.sha256.length, 64);
    const second = await createassets({ packagefile, lockfile, output, artifactroot: directory, artifacts: [artifact], version: "1.0.0", surface: "library", buildtype: "test-build", builder: "test-builder" });
    assert.equal(await readFile(second.files.checksums, "utf8"), checksums);
    assert.equal(await readFile(second.files.sbom, "utf8"), await readFile(first.files.sbom, "utf8"));
    assert.equal(await readFile(second.files.provenance, "utf8"), await readFile(first.files.provenance, "utf8"));
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("rejects helper binaries and underscore-based public names", async () => {
  const directory = await mkdtemp(join(tmpdir(), "saddle-release-invalid-"));
  try {
    const packagefile = join(directory, "package.json");
    const lockfile = join(directory, "package-lock.json");
    await writeFile(packagefile, JSON.stringify({ name: "@wenathlan/example", version: "1.0.0" }));
    await writeFile(lockfile, JSON.stringify({ packages: { "": {} } }));
    const helper = join(directory, "build_script_build.exe");
    await writeFile(helper, "helper\n");
    await assert.rejects(createassets({ packagefile, lockfile, output: join(directory, "assets"), artifactroot: directory, artifacts: [helper], version: "1.0.0", surface: "desktop" }), /forbidden release artifact filename/);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
