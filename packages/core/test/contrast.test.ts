import assert from "node:assert/strict";
import test from "node:test";

import { auditPair, contrastRatio, relativeLuminance } from "../src/index.js";

test("black and white have the maximum WCAG contrast ratio", () => {
  assert.equal(contrastRatio("#000", "#fff"), 21);
});

test("relative luminance normalizes three-digit hex colors", () => {
  assert.equal(relativeLuminance("#fff"), 1);
  assert.equal(relativeLuminance("#000"), 0);
});

test("auditPair reports WCAG AA thresholds", () => {
  assert.deepEqual(auditPair("#1c1a17", "#f3efe7"), {
    foreground: "#1c1a17",
    background: "#f3efe7",
    ratio: 15.13,
    normalText: true,
    largeText: true,
    nonText: true,
  });
});

test("invalid colors are rejected", () => {
  assert.throws(() => contrastRatio("red", "#fff"), /Invalid hexadecimal color/);
});

test("auditPair truncates the displayed ratio instead of rounding up", () => {
  // Exact ratio is about 4.4961:1, just below the 4.5:1 AA threshold.
  const result = auditPair("#6363f8", "#ffffff");
  assert.equal(result.ratio, 4.49);
  assert.equal(result.normalText, false);
});

test("a displayed ratio never meets a threshold its boolean fails", () => {
  for (let value = 0x50; value <= 0x90; value += 1) {
    const hex = value.toString(16).padStart(2, "0");
    const result = auditPair(`#${hex}${hex}${hex}`, "#ffffff");
    if (!result.normalText) assert.ok(result.ratio < 4.5, `#${hex}${hex}${hex} shows ${result.ratio}`);
    if (!result.largeText) assert.ok(result.ratio < 3, `#${hex}${hex}${hex} shows ${result.ratio}`);
  }
});
