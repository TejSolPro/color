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
    ratio: 15.14,
    normalText: true,
    largeText: true,
    nonText: true,
  });
});

test("invalid colors are rejected", () => {
  assert.throws(() => contrastRatio("red", "#fff"), /Invalid hexadecimal color/);
});
