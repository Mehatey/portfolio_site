import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeKey } from "../core/trace.js";

test("navigation keys are retained", () => {
  assert.equal(sanitizeKey("Tab"), "Tab");
  assert.equal(sanitizeKey("Tab", true), "Shift+Tab");
  assert.equal(sanitizeKey(" "), "Space");
});

test("typed characters and values are rejected", () => {
  for (const key of ["a", "7", "@", "Backspace", "Delete"]) assert.equal(sanitizeKey(key), null);
});
