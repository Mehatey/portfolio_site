import test from "node:test";
import assert from "node:assert/strict";
import { clampLens, intentIndexFromDelta } from "../core/geometry.js";
import { modelState, runIntent } from "../core/engine.js";

test("pointer direction selects each spatial intent", () => {
  assert.equal(intentIndexFromDelta(0, -100), 0);
  assert.equal(intentIndexFromDelta(100, 0), 1);
  assert.equal(intentIndexFromDelta(0, 100), 2);
  assert.equal(intentIndexFromDelta(-100, 0), 3);
});

test("answer lens remains inside the viewport", () => {
  assert.deepEqual(clampLens({ x: 990, y: 790 }, { width: 1000, height: 800 }), { x: 596, y: 537 });
  assert.deepEqual(clampLens({ x: 0, y: 0 }, { width: 1000, height: 800 }), { x: 28, y: 74 });
});

test("non-Chrome environments use an honest semantic fallback", async () => {
  assert.equal(modelState().state, "fallback");
  const result = await runIntent({ kind: "message", label: "Customer asks for an arrival time", detail: "Order delayed 31 minutes" }, "draft");
  assert.equal(result.source, "Curated semantic fallback");
  assert.match(result.text, /4:10/);
});
