/**
 * package surface tests import every declared export target and catch accidental runtime coupling.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

test("imports every declared package export target in Node", async () => {
  const root = dirname(new URL(import.meta.url).pathname);
  const packagejson = JSON.parse(await readFile(resolve(root, "../package.json"), "utf8"));
  for (const target of Object.values(packagejson.exports)) {
    assert.equal(typeof target, "string");
    await import(pathToFileURL(resolve(root, "..", target)).href);
  }
});
