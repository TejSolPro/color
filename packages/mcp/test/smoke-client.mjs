import assert from "node:assert/strict";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const endpoint = process.argv[2] ?? "http://127.0.0.1:8787/mcp";
const client = new Client({ name: "color-plugin-smoke-test", version: "0.1.0" });

try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));

  const listed = await client.listTools();
  assert.deepEqual(
    listed.tools.map((tool) => tool.name).sort(),
    ["audit_color_contrast", "compile_color_theme"],
  );

  const theme = await client.callTool({
    name: "compile_color_theme",
    arguments: { brand: "#635BFF", canvas: "#FFFFFF" },
  });
  assert.equal(theme.isError, undefined);
  assert.equal(theme.structuredContent.kind, "theme");
  assert.equal(theme.structuredContent.theme.tokens.primary, "#635bff");
  assert.equal(theme.structuredContent.theme.allRequiredPairsPass, true);

  const contrast = await client.callTool({
    name: "audit_color_contrast",
    arguments: { foreground: "#000000", background: "#FFFFFF" },
  });
  assert.equal(contrast.isError, undefined);
  assert.equal(contrast.structuredContent.audit.ratio, 21);

  console.log("MCP smoke test passed: tool discovery, theme compilation, and contrast audit.");
} finally {
  await client.close();
}
