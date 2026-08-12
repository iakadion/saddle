/**
 * package surface tests import every declared export target and catch accidental runtime coupling.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const transportneutral = ["index.js", "storage/index.js", "runners/scheduler.js", "domain/sessions.js", "modes/resolve.js", "modes/matrix.js", "browser/index.js", "bot/bot.js", "captcha/contract.js", "deploy/index.js", "extension/index.js", "core/hash.js", "runtime/worker.js"];

test("imports every declared package export target in Node", async () => {
  const root = dirname(new URL(import.meta.url).pathname);
  const packagejson = JSON.parse(await readFile(resolve(root, "../package.json"), "utf8"));
  for (const target of Object.values(packagejson.exports)) {
    assert.equal(typeof target, "string");
    await import(pathToFileURL(resolve(root, "..", target)).href);
  }
});

test("keeps transport-neutral export graphs free of Node-only imports", async () => {
  const root = dirname(new URL(import.meta.url).pathname);
  const seen = new Set();
  const pending = transportneutral.map((entry) => resolve(root, "..", entry));
  while (pending.length) {
    const filename = pending.pop();
    if (seen.has(filename)) continue;
    seen.add(filename);
    const source = await readFile(filename, "utf8");
    assert.doesNotMatch(source, /from\s+["']node:/, `${filename} imports a Node-only module`);
    for (const match of source.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (!specifier.startsWith(".")) continue;
      const child = resolve(dirname(filename), specifier);
      pending.push(child.endsWith(".js") ? child : `${child}.js`);
    }
  }
  assert.equal(seen.has(resolve(root, "..", "index.js")), true);
  assert.equal(seen.has(resolve(root, "..", "extension/index.js")), true);
});
