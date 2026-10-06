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
  assert.match(result.stderr, /Usage: solpro-color contrast <foreground> <background>/);
  assert.equal(result.stdout, "");
});

test("unknown commands print usage and exit with code 1", () => {
  const result = run("palette", "#000", "#fff");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
});
