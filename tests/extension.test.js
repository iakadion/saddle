/**
 * extension tests prove protocol and routing without Chrome, credentials or network access.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { createcommand, createerror, createsnapshot, isfreshsnapshot } from "../extension/protocol.js";
import { createworkerrouter } from "../extension/serviceworker.js";
import { extensionpermissions, permissionpolicy, requestpermission } from "../extension/permissions.js";
import { buildextension } from "../extension/build.js";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import "../extension/content.js";

test("creates versioned extension commands and correlated responses", async () => {
  const command = createcommand("snapshot", { tabid: 7 }, { id: "request1" });
  assert.deepEqual(command, { version: 1, type: "command", id: "request1", command: "snapshot", payload: { tabid: 7 } });
  const error = createerror(command, new Error("stale page"), { code: "stale_snapshot" });
  assert.equal(error.requestid, "request1");
  assert.equal(error.error.code, "stale_snapshot");
});

test("creates snapshots and rejects stale references by identity", () => {
  const snapshot = createsnapshot({ snapshotid: "snap1", url: "https://example.com", elements: [{ ref: "e1", role: "button", name: "Run" }] });
  assert.equal(snapshot.elements[0].ref, "e1");
  assert.equal(isfreshsnapshot("snap1", snapshot.snapshotid), true);
  assert.equal(isfreshsnapshot("snap0", snapshot.snapshotid), false);
});

test("routes commands through scripting and tabs while persisting snapshot state", async () => {
  const calls = [];
  const router = createworkerrouter({
    scripting: { async executeScript(input) { calls.push(["script", input]); } },
    tabs: { async sendMessage(tabid, message) { calls.push(["message", tabid, message.command]); return { type: "response", payload: { snapshotid: "snap2" } }; } },
    storage: { async set(value) { calls.push(["set", value]); }, async get() { return { saddleextensionstate: { snapshotid: "snap1" } }; } }
  });
  const response = await router.handle(createcommand("snapshot", { tabid: 9 }));
  assert.equal(response.payload.snapshotid, "snap2");
  assert.deepEqual(calls, [["script", { target: { tabId: 9 }, files: ["content.js"] }], ["message", 9, "snapshot"], ["set", { saddleextensionstate: { tabid: 9, snapshotid: "snap2", updatedat: calls[2][1].saddleextensionstate.updatedat } }]]);
  assert.deepEqual(await router.readstate(), { snapshotid: "snap1" });
});

test("content bridge returns bounded snapshots and executes only referenced clicks", () => {
  let clicked = false;
  const element = { tagName: "BUTTON", innerText: "Run", getAttribute(name) { return name === "role" ? "button" : null; }, click() { clicked = true; } };
  const documentref = { location: { href: "https://example.com" }, title: "Example", body: { innerText: "Visible content" }, querySelectorAll() { return [element]; } };
  const bridge = globalThis.saddlecontent.createbridge(documentref, () => 100);
  const snapshot = bridge.snapshotpage();
  assert.equal(snapshot.elements[0].ref, "e1");
  const result = bridge.handle(createcommand("clickref", { ref: "e1", snapshotid: snapshot.snapshotid }));
  assert.equal(result.clicked, true);
  assert.equal(clicked, true);
  assert.throws(() => bridge.handle(createcommand("clickref", { ref: "e1", snapshotid: "stale" })), (error) => error.code === "stale_snapshot");
});

test("keeps extension permissions minimal and optional escalation caller-owned", async () => {
  const policy = permissionpolicy({ optional: ["activeTab"] });
  assert.deepEqual(policy.hostpermissions, []);
  assert.equal(policy.allows("storage"), true);
  assert.deepEqual(policy.missing(["storage", "scripting"]), []);
  assert.equal(extensionpermissions.includes("scripting"), true);
  assert.deepEqual(await requestpermission(policy, "activeTab", async () => true), { permission: "activeTab", granted: true });
  await assert.rejects(() => requestpermission(policy, "storage", async () => true), /not optional/);
});

test("builds a versioned unpacked extension artifact without mutating the source manifest", async () => {
  const output = await mkdtemp(join(tmpdir(), "saddle-extension-"));
  try {
    const result = await buildextension({ output, version: "1.8.1" });
    const manifest = JSON.parse(await readFile(join(output, "manifest.json"), "utf8"));
    assert.equal(result.manifest.version, "1.8.1");
    assert.equal(manifest.version, "1.8.1");
    assert.equal(manifest.permissions.includes("storage"), true);
    assert.equal(manifest.host_permissions, undefined);
  } finally {
    await rm(output, { force: true, recursive: true });
  }
});
