import assert from "node:assert/strict";
import test from "node:test";

import { auditContrastTool, compileThemeTool } from "../dist/tools.js";

test("compileThemeTool delegates to the shared deterministic compiler", () => {
  const result = compileThemeTool({ brand: "#369", canvas: "#fff" });

  assert.equal(result.kind, "theme");
  assert.equal(result.theme.tokens.primary, "#336699");
  assert.equal(result.theme.tokens.canvas, "#ffffff");
  assert.equal(result.theme.allRequiredPairsPass, true);
  assert.match(result.css, /--color-primary: #336699;/);
});

test("compileThemeTool can omit CSS without changing the theme", () => {
  const withCss = compileThemeTool({ brand: "#9d3f2d" });
  const withoutCss = compileThemeTool({ brand: "#9d3f2d", includeCss: false });

  assert.deepEqual(withoutCss.theme, withCss.theme);
  assert.equal("css" in withoutCss, false);
});

test("auditContrastTool reports WCAG thresholds for the exact pair", () => {
  const result = auditContrastTool({ foreground: "#000", background: "#fff" });

  assert.deepEqual(result, {
    kind: "contrast",
    audit: {
      foreground: "#000000",
      background: "#ffffff",
      ratio: 21,
      normalText: true,
      largeText: true,
      nonText: true,
    },
  });
});

test("tool adapters reject non-hex inputs", () => {
  assert.throws(() => compileThemeTool({ brand: "blue" }), /Invalid hexadecimal color/);
  assert.throws(
    () => auditContrastTool({ foreground: "transparent", background: "#fff" }),
    /Invalid hexadecimal color/,
  );
});
