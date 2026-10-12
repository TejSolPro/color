import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const cli = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });

test("contrast prints a machine-readable audit", () => {
  const result = run("contrast", "#1c1a17", "#f3efe7");
  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout), {
    foreground: "#1c1a17",
    background: "#f3efe7",
    ratio: 15.13,
    normalText: true,
    largeText: true,
    nonText: true,
  });
});

test("missing arguments print usage and exit with code 1", () => {
  const result = run("contrast", "#000");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /solpro-color contrast <foreground> <background>/);
  assert.equal(result.stdout, "");
});

test("unknown commands print usage and exit with code 1", () => {
  const result = run("palette", "#000", "#fff");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
});

test("theme prints a versioned semantic theme as JSON", () => {
  const result = run("theme", "#9d3f2d", "--canvas", "#f3efe7");
  assert.equal(result.status, 0);
  const theme = JSON.parse(result.stdout);
  assert.equal(theme.schemaVersion, "0.1.0");
  assert.equal(theme.tokens.primary, "#9d3f2d");
  assert.equal(theme.tokens.canvas, "#f3efe7");
  assert.equal(theme.allRequiredPairsPass, true);
  assert.ok(theme.audits.every((audit) => audit.passes));
});

test("theme exports CSS custom properties", () => {
  const result = run("theme", "#9d3f2d", "--format", "css");
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^:root \{/);
  assert.match(result.stdout, /--color-primary: #9d3f2d;/);
  assert.match(result.stdout, /--color-focus-ring: #[0-9a-f]{6};/);
});

test("theme rejects unsupported options", () => {
  const result = run("theme", "#9d3f2d", "--format", "rainbow");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid theme option/);
});

test("theme reports invalid colors without a stack trace", () => {
  const result = run("theme", "orange");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid hexadecimal color: orange/);
  assert.doesNotMatch(result.stderr, /at compileOneBrandTheme/);
});
