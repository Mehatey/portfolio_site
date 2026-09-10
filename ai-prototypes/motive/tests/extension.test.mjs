import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const extensionUrl = new URL("../extension/", import.meta.url);

test("extension asks only for the current tab and script injection", async () => {
  const manifest = JSON.parse(await readFile(new URL("manifest.json", extensionUrl), "utf8"));
  assert.deepEqual(manifest.permissions, ["activeTab", "scripting"]);
  assert.equal(manifest.host_permissions, undefined);
});

test("extension bounds context and makes no network request", async () => {
  const source = await readFile(new URL("cursor.js", extensionUrl), "utf8");
  assert.match(source, /slice\(0, 280\)/);
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|WebSocket/);
  assert.match(source, /LanguageModel\.create/);
});
