import assert from "node:assert/strict";
import test from "node:test";

import {
  ONE_BRAND_THEME_SCHEMA_VERSION,
  compileOneBrandTheme,
  exportThemeCss,
} from "../src/index.js";

test("compileOneBrandTheme preserves locked inputs and produces an accessible theme", () => {
  const theme = compileOneBrandTheme({ brand: "#9D3F2D", canvas: "#F3EFE7" });

  assert.equal(theme.schemaVersion, ONE_BRAND_THEME_SCHEMA_VERSION);
  assert.equal(theme.algorithm, "srgb-v0.1");
  assert.equal(theme.tokens.primary, "#9d3f2d");
  assert.equal(theme.tokens.canvas, "#f3efe7");
  assert.equal(theme.allRequiredPairsPass, true);
  assert.ok(theme.audits.length >= 8);
  assert.ok(theme.audits.every((audit) => audit.passes));
});

test("compileOneBrandTheme is deterministic", () => {
  const request = { brand: "#369", canvas: "#fff" };
  assert.deepEqual(compileOneBrandTheme(request), compileOneBrandTheme(request));
});

test("compiler keeps required pairs accessible across varied locked inputs", () => {
  const colors = ["#000000", "#ffffff", "#777777", "#ffcc00", "#2463eb", "#c026d3"];
  for (const brand of colors) {
    for (const canvas of colors) {
      const theme = compileOneBrandTheme({ brand, canvas });
      assert.equal(
        theme.allRequiredPairsPass,
        true,
        `${brand} on ${canvas}: ${theme.audits.filter((audit) => !audit.passes).map((audit) => audit.id).join(", ")}`,
      );
    }
  }
});

test("theme includes inspectable provenance for every token", () => {
  const theme = compileOneBrandTheme({ brand: "#9d3f2d" });
  assert.deepEqual(
    theme.provenance.map((entry) => entry.token).sort(),
    Object.keys(theme.tokens).sort(),
  );
});

test("exportThemeCss emits implementation-ready custom properties", () => {
  const css = exportThemeCss(compileOneBrandTheme({ brand: "#9d3f2d" }));
  assert.match(css, /^:root \{/);
  assert.match(css, /--color-primary: #9d3f2d;/);
  assert.match(css, /--color-text-muted: #[0-9a-f]{6};/);
  assert.match(css, /--color-focus-ring: #[0-9a-f]{6};/);
  assert.match(css, /\n}$/);
});

test("compileOneBrandTheme rejects invalid inputs", () => {
  assert.throws(() => compileOneBrandTheme({ brand: "orange" }), /Invalid hexadecimal color/);
  assert.throws(
    () => compileOneBrandTheme({ brand: "#123456", canvas: "transparent" }),
    /Invalid hexadecimal color/,
  );
});
